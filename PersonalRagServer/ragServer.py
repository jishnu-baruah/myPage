import os
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pinecone import Pinecone
from huggingface_hub import InferenceClient
import traceback
import google.generativeai as genai
import re

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ["PINECONE_API_KEY"]
INDEX_NAME = "portfolio-snippets"
USER_IDS_FILE = "portfolio_user_snippet_ids.json"
HF_TOKEN = os.environ["HF_TOKEN"]
MODEL_NAME = "BAAI/bge-base-en-v1.5"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
ALL_PROJECT_IDS_FILE = "all_project_ids.json"

pc = Pinecone(api_key=API_KEY)
desc = pc.describe_index(INDEX_NAME)
index = pc.Index(host=desc.host)

client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print("Gemini model init error:", e)
        gemini_model = None
else:
    gemini_model = None

# Helper to store user snippet IDs for listing/deletion
if not os.path.exists(USER_IDS_FILE):
    with open(USER_IDS_FILE, "w") as f:
        json.dump([], f)

def add_user_id(snippet_id):
    with open(USER_IDS_FILE, "r") as f:
        ids = json.load(f)
    ids.append(snippet_id)
    with open(USER_IDS_FILE, "w") as f:
        json.dump(ids, f)

def remove_user_id(snippet_id):
    with open(USER_IDS_FILE, "r") as f:
        ids = json.load(f)
    ids = [i for i in ids if i != snippet_id]
    with open(USER_IDS_FILE, "w") as f:
        json.dump(ids, f)

def get_user_ids():
    with open(USER_IDS_FILE, "r") as f:
        return json.load(f)

class QueryRequest(BaseModel):
    question: str
    top_k: int = 10
    history: list = []

class AddSnippetRequest(BaseModel):
    text: str
    section: str = ""

class EditSnippetRequest(BaseModel):
    id: str
    text: str
    section: str

class DeleteSnippetRequest(BaseModel):
    id: str

@app.get("/ui", response_class=HTMLResponse)
def serve_ui():
    return """
    <html><head><title>RAG Knowledge Base Manager</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7fa; margin: 0; padding: 0; }
    .container { max-width: 900px; margin: 30px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0001; padding: 32px; }
    h1, h2 { color: #2a2a2a; }
    .card { background: #f9f9ff; border-radius: 8px; box-shadow: 0 1px 4px #0001; margin: 12px 0; padding: 18px 20px; position: relative; }
    .card .id { font-size: 0.9em; color: #888; cursor: pointer; }
    .card .copy { font-size: 0.9em; color: #007bff; cursor: pointer; margin-left: 8px; }
    .card .meta { font-size: 0.95em; color: #555; margin-bottom: 6px; }
    .card .actions { position: absolute; top: 10px; right: 10px; }
    .card .actions button { margin-left: 6px; }
    .expand { color: #007bff; cursor: pointer; font-size: 0.95em; }
    .hidden { display: none; }
    .msg { margin: 10px 0; color: #007b00; font-weight: bold; }
    .err { margin: 10px 0; color: #c00; font-weight: bold; }
    .input-row { margin-bottom: 12px; }
    input, textarea, select { font-size: 1em; padding: 6px 10px; border-radius: 5px; border: 1px solid #bbb; width: 100%; box-sizing: border-box; }
    button { background: #007bff; color: #fff; border: none; border-radius: 5px; padding: 8px 18px; font-size: 1em; cursor: pointer; }
    button:hover { background: #0056b3; }
    .query-results { margin-top: 24px; }
    .query-card { background: #eaf6ff; border-radius: 8px; margin: 10px 0; padding: 14px 16px; }
    .download-btn { float: right; }
    .search-row { display: flex; gap: 10px; margin-bottom: 10px; }
    @media (max-width: 600px) { .container { padding: 8px; } }
    </style>
    </head><body><div class='container'>
    <h1>RAG Knowledge Base Manager</h1>
    <div class='msg' id='msg'></div>
    <div class='err' id='err'></div>
    <h2>Add Snippet</h2>
    <form id='addForm'>
      <div class='input-row'><textarea name='text' placeholder='Snippet text' required rows=3></textarea></div>
      <div class='input-row'><input name='section' placeholder='Section (e.g. User Note, FAQ, etc.)' required></div>
      <button type='submit'>Add Snippet</button>
    </form>
    <h2>Query</h2>
    <form id='queryForm'>
      <div class='input-row'><input name='question' placeholder='Ask a question...' required></div>
      <button type='submit'>Query</button>
    </form>
    <div class='query-results' id='queryResults'></div>
    <h2>Current User Snippets
      <button class='download-btn' onclick='downloadSnippets()'>Download All as JSON</button>
    </h2>
    <div class='search-row'>
      <input id='searchText' placeholder='Search text...' oninput='listSnippets()'>
      <input id='searchSection' placeholder='Filter by section...' oninput='listSnippets()'>
    </div>
    <div id='snippetList'></div>
    <h2>Edit/Delete Snippet</h2>
    <form id='editForm'>
      <div class='input-row'><input name='id' placeholder='Snippet ID to edit' required></div>
      <div class='input-row'><textarea name='text' placeholder='New text' required rows=2></textarea></div>
      <div class='input-row'><input name='section' placeholder='New section' required></div>
      <button type='submit'>Edit Snippet</button>
    </form>
    <form id='deleteForm'>
      <div class='input-row'><input name='id' placeholder='Snippet ID to delete' required></div>
      <button type='submit'>Delete Snippet</button>
    </form>
    <script>
    let allSnippets = [];
    function showMsg(msg) { document.getElementById('msg').innerText = msg; setTimeout(()=>{document.getElementById('msg').innerText='';}, 3000); }
    function showErr(msg) { document.getElementById('err').innerText = msg; setTimeout(()=>{document.getElementById('err').innerText='';}, 4000); }
    function copyToClipboard(text) { navigator.clipboard.writeText(text); showMsg('Copied!'); }
    function expandText(id) {
      const el = document.getElementById('full-'+id);
      el.classList.toggle('hidden');
    }
    async function listSnippets() {
      const res = await fetch('/list_snippets');
      const data = await res.json();
      allSnippets = data.snippets;
      const searchText = document.getElementById('searchText').value.toLowerCase();
      const searchSection = document.getElementById('searchSection').value.toLowerCase();
      let html = '';
      for (const s of allSnippets) {
        if ((searchText && !s.text.toLowerCase().includes(searchText)) || (searchSection && !s.section.toLowerCase().includes(searchSection))) continue;
        html += `<div class='card'>
          <div class='meta'><b>Section:</b> ${s.section} | <b>Date:</b> ${s.date || ''}</div>
          <div class='id' title='Snippet ID'>ID: ${s.id} <span class='copy' onclick='copyToClipboard("${s.id}")' title='Copy ID'>📋</span></div>
          <div>${s.text.slice(0,180)}${s.text.length>180?`... <span class='expand' onclick='expandText("${s.id}")'>[expand]</span>`:''}</div>
          <div id='full-${s.id}' class='hidden'><hr>${s.text}</div>
          <div class='actions'>
            <button onclick='editPrefill("${s.id}")'>Edit</button>
            <button onclick='deleteSnippet("${s.id}")'>Delete</button>
          </div>
        </div>`;
      }
      document.getElementById('snippetList').innerHTML = html || '<i>No snippets found.</i>';
    }
    function editPrefill(id) {
      const s = allSnippets.find(x=>x.id===id);
      if (!s) return;
      document.querySelector('#editForm [name=id]').value = s.id;
      document.querySelector('#editForm [name=text]').value = s.text;
      document.querySelector('#editForm [name=section]').value = s.section;
    }
    async function deleteSnippet(id) {
      if (!confirm('Delete this snippet?')) return;
      const res = await fetch('/delete_snippet', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
      const data = await res.json();
      if (data.status==='deleted') showMsg('Snippet deleted!'); else showErr(data.detail||'Error');
      listSnippets();
    }
    async function downloadSnippets() {
      const res = await fetch('/download_snippets');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'snippets.json'; a.click();
      window.URL.revokeObjectURL(url);
    }
    document.getElementById('addForm').onsubmit = async (e) => {
      e.preventDefault();
      const text = e.target.text.value;
      const section = e.target.section.value;
      const res = await fetch('/add_snippet', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,section})});
      const data = await res.json();
      if (data.status==='success') showMsg('Snippet added!'); else showErr(data.detail||'Error');
      e.target.reset();
      listSnippets();
    };
    document.getElementById('editForm').onsubmit = async (e) => {
      e.preventDefault();
      const id = e.target.id.value, text = e.target.text.value, section = e.target.section.value;
      const res = await fetch('/edit_snippet', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,text,section})});
      const data = await res.json();
      if (data.status==='success') showMsg('Snippet updated!'); else showErr(data.detail||'Error');
      listSnippets();
    };
    document.getElementById('deleteForm').onsubmit = async (e) => {
      e.preventDefault();
      const id = e.target.id.value;
      const res = await fetch('/delete_snippet', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
      const data = await res.json();
      if (data.status==='deleted') showMsg('Snippet deleted!'); else showErr(data.detail||'Error');
      listSnippets();
    };
    document.getElementById('queryForm').onsubmit = async (e) => {
      e.preventDefault();
      const question = e.target.question.value;
      const res = await fetch('/query', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
      const data = await res.json();
      let html = '<h3>Top Results:</h3>';
      for (const r of data.results) {
        html += `<div class='query-card'><b>[${r.section}]</b> ${r.text.slice(0,300)}... <i>(score: ${r.score.toFixed(3)})</i></div>`;
      }
      document.getElementById('queryResults').innerHTML = html;
    };
    listSnippets();
    </script>
    </div></body></html>
    """

@app.post("/add_snippet")
def add_snippet(req: AddSnippetRequest):
    try:
        embedding = client.feature_extraction(req.text, model=MODEL_NAME)
        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()
        snippet_id = f"user-{uuid.uuid4()}"
        now = datetime.utcnow().isoformat()
        index.upsert(vectors=[(
            snippet_id,
            embedding,
            {"text": req.text, "section": req.section, "date": now}
        )])
        add_user_id(snippet_id)
        return {"status": "success", "id": snippet_id}
    except Exception as e:
        print("Error in /add_snippet endpoint:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/edit_snippet")
def edit_snippet(req: EditSnippetRequest):
    try:
        embedding = client.feature_extraction(req.text, model=MODEL_NAME)
        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()
        now = datetime.utcnow().isoformat()
        index.upsert(vectors=[(req.id, embedding, {"text": req.text, "section": req.section, "date": now})])
        return {"status": "success", "id": req.id}
    except Exception as e:
        print("Error in /edit_snippet endpoint:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/delete_snippet")
def delete_snippet(req: DeleteSnippetRequest):
    try:
        index.delete(ids=[req.id])
        remove_user_id(req.id)
        return {"status": "deleted", "id": req.id}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/list_snippets")
def list_snippets():
    try:
        ids = get_user_ids()
        if not ids:
            return {"snippets": []}
        res = index.fetch(ids=ids)
        snippets = []
        for id in ids:
            v = res.vectors.get(id)
            if v and v.metadata:
                snippets.append({"id": id, "text": v.metadata.get("text", ""), "section": v.metadata.get("section", ""), "date": v.metadata.get("date", "")})
        return {"snippets": snippets}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/download_snippets")
def download_snippets():
    try:
        ids = get_user_ids()
        if not ids:
            return JSONResponse(content=json.dumps([]), media_type="application/json")
        res = index.fetch(ids=ids)
        snippets = []
        for id in ids:
            v = res.vectors.get(id)
            if v and v.metadata:
                snippets.append({"id": id, "text": v.metadata.get("text", ""), "section": v.metadata.get("section", ""), "date": v.metadata.get("date", "")})
        return JSONResponse(content=json.dumps(snippets), media_type="application/json")
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

def get_embedding(text: str):
    return client.feature_extraction(text, model=MODEL_NAME)

# --- PHASE 1: Query Classification and Direct Answers ---
PROFILE_SUMMARY = (
    "**Jishnu Baruah – Builder & Technologist**\n"
    "Location: Kolkata, India\n"
    "Tagline: Building Web3 + AI Tools | Leading with Tech | Empowering Creators\n"
    "Short Bio: I believe in building technology that empowers communities.\n"
    "Background: Full-stack development, IoT, AI, mentoring student teams.\n"
    "Contact: jsbaruah1@gmail.com | [GitHub](https://github.com/jishnu-baruah) | [LinkedIn](https://www.linkedin.com/in/jishnubaruah2020/) | [Twitter/X](https://x.com/JishnuBaruah00) | Discord: jishnu_baruah | Telegram: @JishnuBaruah1"
)

PROMPT_TEMPLATES = {
    "projects": (
        "You are a helpful assistant for Jishnu Baruah's portfolio site.\n"
        "All the information in the context is about Jishnu Baruah.\n"
        "Here is a table of projects. For each, output a markdown bullet with the name (bold), year in parentheses, description, and a [Demo](url) link if present. If the demo link is missing, omit the link.\n"
        "Example input:\n| Name | Year | Description | Demo |\n|------|------|-------------|------|\n| Mintellect | 2025 | AI-Powered Academic Integrity & Research Publishing Platform | https://www.mintellect.xyz/ |\n| Satsfi | 2025 | Prompt-to-DeFi Automation Tool | https://satsfi.vercel.app/ |\n"
        "Example output:\n- **Mintellect** (2025): AI-Powered Academic Integrity & Research Publishing Platform ([Demo](https://www.mintellect.xyz/))\n- **Satsfi** (2025): Prompt-to-DeFi Automation Tool ([Demo](https://satsfi.vercel.app/))\n"
    ),
    "contact": (
        "You are a helpful assistant for Jishnu Baruah's portfolio site.\n"
        "Extract all contact and social links (email, GitHub, LinkedIn, Twitter/X, Discord, Telegram) from the context.\n"
        "Format as a markdown list with bold field names and clickable links. For each field, use the correct label as the link text (e.g., [GitHub](...)). For email, show as plain text. If a field is missing, leave it blank.\n"
        "Example output:\n- **Email:** jsbaruah1@gmail.com\n- **GitHub:** [github.com/jishnu-baruah](https://github.com/jishnu-baruah)\n- **LinkedIn:** [linkedin.com/in/jishnubaruah2020](https://www.linkedin.com/in/jishnubaruah2020/)\n- **Twitter/X:** [x.com/JishnuBaruah00](https://x.com/JishnuBaruah00)\n- **Discord:** jishnu_baruah\n- **Telegram:** @JishnuBaruah1\n"
    ),
    "awards": (
        "You are a helpful assistant for Jishnu Baruah's portfolio site.\n"
        "Extract all awards and achievements from the context.\n"
        "Format as a markdown bullet list. If a field is missing, leave it blank.\n"
        "Example output:\n- BRICS 2024 International Skills Competition — 3rd Prize, Data Analytics (India Representative)\n- EduChain Hackathon (Semester 3) — Winner, Mintellect (AI Academic Platform) & Kuroro (AI Study Guide Generator)\n- Techno Batanagar Hackathon — Prize Winner, IoT Track (Haptic Feedback Suit for the Blind)\n"
    ),
    "bio": (
        "You are a helpful assistant for Jishnu Baruah's portfolio site.\n"
        "Summarize Jishnu Baruah's bio, background, and tagline in 2-3 sentences.\n"
        "If a field is missing, leave it blank.\n"
        "Example output:\nJishnu Baruah is a builder and technologist based in Kolkata, India. He believes in building technology that empowers communities, with a background in full-stack development, IoT, and AI. His tagline: Building Web3 + AI Tools | Leading with Tech | Empowering Creators.\n"
    ),
    "tech": (
        "You are a helpful assistant for Jishnu Baruah's portfolio site.\n"
        "Extract and deduplicate all technologies, programming languages, frameworks, and tools mentioned in the Projects and Bio sections.\n"
        "Output as a comma-separated list of unique skills. If a field is missing, leave it blank.\n"
        "Example output:\nNext.js, Node.js, MongoDB, AI APIs, Web3, IPFS, Filecoin, Web3.js, Solidity, Vercel, LangChain, Pinecone, Python, Flask, FastAPI, Federated Learning, WebRTC, React, Arduino, Embedded C, Ultrasonic Sensors, Vibration Motors\n"
    )
}

PROFILE_SECTIONS = [
    "bio", "about", "profile", "experience", "background", "contact", "social", "award", "achievement", "project", "work", "skills", "tech", "technology"
]

def auto_link_urls(text):
    # Replace raw URLs with markdown links if not already inside a markdown link
    def replacer(match):
        url = match.group(0)
        # If already inside a markdown link, skip
        if f']({url})' in text:
            return url
        return f'[Demo]({url})'
    return re.sub(r'https?://[^\s)]+', replacer, text)

def clean_demo_links(text):
    # Remove [Demo](undefined) and [Demo]() links
    text = re.sub(r'\[Demo\]\(undefined\)', '', text)
    text = re.sub(r'\[Demo\]\(\)', '', text)
    return text

def fix_social_labels(text):
    # Replace [Demo](...) with correct social labels if present
    replacements = [
        (r'\[Demo\]\((https://github.com/[^)]+)\)', r'[github.com/jishnu-baruah](\1)'),
        (r'\[Demo\]\((https://www.linkedin.com/[^)]+)\)', r'[linkedin.com/in/jishnubaruah2020](\1)'),
        (r'\[Demo\]\((https://x.com/[^)]+)\)', r'[x.com/JishnuBaruah00](\1)'),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)
    return text

# Refined tech/skills keywords
TECH_KEYWORDS = ["skills", "tech stack", "technologies", "tools", "framework", "language", "platform"]

@app.post("/query")
def query_rag(req: QueryRequest):
    try:
        q_lower = req.question.lower()
        # PHASE 1: Query Classification
        # Type-specific detection
        is_projects = "project" in q_lower or "projects" in q_lower
        is_contact = any(word in q_lower for word in ["contact", "email", "github", "linkedin", "twitter", "discord", "telegram", "social"])
        is_awards = any(word in q_lower for word in ["award", "achievement", "prize", "winner"])
        is_bio = any(word in q_lower for word in ["bio", "about", "background", "tagline"])
        is_tech = any(word in q_lower for word in TECH_KEYWORDS)
        is_profile = any(word in q_lower for word in PROFILE_SECTIONS) and not any(name in q_lower for name in ["mintellect", "satsfi", "kuroro", "outdated", "incomestream", "haptic"])
        # Check for specific intents before greeting
        if is_contact:
            pass  # will be handled below
        elif is_projects:
            pass
        elif is_awards:
            pass
        elif is_bio:
            pass
        elif is_tech:
            pass
        elif is_greeting:
            return {"results": [], "gemini_answer": "Hello! How can I help you today?"}
        # Only return profile summary if not a tech/skills query
        if is_profile and not (is_projects or is_awards or is_contact or is_bio) and not is_tech:
            return {"results": [], "gemini_answer": PROFILE_SUMMARY}
        # PHASE 2: RAG for portfolio-specific queries
        embedding = get_embedding(req.question)
        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()
        # General project query logic (as before)
        is_general_project_query = is_projects and not any(name in q_lower for name in ["mintellect", "satsfi", "kuroro", "outdated", "incomestream", "haptic"])
        if is_general_project_query:
            # Fetch all project snippets by ID
            try:
                with open(ALL_PROJECT_IDS_FILE, "r") as f:
                    project_ids = json.load(f)
            except Exception:
                project_ids = []
            all_projects = []
            if project_ids:
                res = index.fetch(ids=project_ids)
                for pid in project_ids:
                    v = res.vectors.get(pid)
                    if v and v.metadata and v.metadata.get("section") == "Projects":
                        try:
                            all_projects.append(json.loads(v.metadata.get("text")))
                        except Exception:
                            pass
            # Directly generate markdown list
            project_md = ""
            for p in all_projects:
                name = p.get('name', '')
                year = p.get('year', '')
                desc = p.get('description', '')
                demo = p.get('demo', '')
                md = f"- **{name}**"
                if year:
                    md += f" ({year})"
                if desc:
                    md += f": {desc}"
                if demo and demo.lower() != 'offline (hardware demo available on request)':
                    md += f" ([Demo]({demo}))"
                project_md += md + "\n"
            return {"results": [], "gemini_answer": project_md.strip()}
        else:
            results = index.query(vector=embedding, top_k=5, include_metadata=True)
            matches = [
                {
                    "score": match.score,
                    "section": match.metadata.get("section"),
                    "text": match.metadata.get("text")
                }
                for match in results.matches
            ]
            context = "\n\n".join([m["text"] for m in matches])
        # Chat memory: prepend last 3 Q&A pairs
        history_text = ""
        if hasattr(req, 'history') and req.history:
            for turn in req.history[-3:]:
                history_text += f"User: {turn.get('question','')}\nAssistant: {turn.get('answer','')}\n"
        # Select prompt template
        if is_projects:
            prompt_template = PROMPT_TEMPLATES["projects"]
        elif is_contact:
            prompt_template = PROMPT_TEMPLATES["contact"]
        elif is_awards:
            prompt_template = PROMPT_TEMPLATES["awards"]
        elif is_bio:
            prompt_template = PROMPT_TEMPLATES["bio"]
        elif is_tech:
            prompt_template = PROMPT_TEMPLATES["tech"]
        else:
            prompt_template = (
                "You are a helpful assistant for Jishnu Baruah's portfolio site.\n"
                "Answer the user's question using the context. If a field is missing, leave it blank. Use markdown formatting where appropriate.\n"
            )
        if gemini_model:
            if context:
                prompt = (
                    prompt_template +
                    f"\n{history_text}"
                    f"Context:\n{context}\n\nQuestion: {req.question}\n\nAnswer:"
                )
            else:
                prompt = (
                    "You are a helpful assistant for Jishnu Baruah's portfolio site. "
                    "If you don't know the answer, say so. Do not hallucinate or make up information.\n\n"
                    f"{history_text}"
                    f"Question: {req.question}\n\nAnswer:"
                )
            try:
                response = gemini_model.generate_content(prompt)
                gemini_answer = response.text.strip() if hasattr(response, "text") else str(response)
                # Post-process: auto-link any raw URLs as markdown links
                gemini_answer = auto_link_urls(gemini_answer)
                # Post-process: clean up broken demo links
                gemini_answer = clean_demo_links(gemini_answer)
                # Post-process: fix social labels
                if is_contact:
                    gemini_answer = fix_social_labels(gemini_answer)
            except Exception as e:
                gemini_answer = f"[Gemini error: {e}]"
        else:
            gemini_answer = None
        if is_general_project_query:
            matches = [{"score": 1.0, "section": "Projects", "text": context}]
        return {"results": matches, "gemini_answer": gemini_answer}
    except Exception as e:
        print("Error in /query endpoint:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

# NOTE: You must re-embed your data with all-MiniLM-L6-v2 (dimension 384) for correct retrieval. 