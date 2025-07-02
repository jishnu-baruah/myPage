import os
import uuid
import json
import re
from dotenv import load_dotenv
from pinecone import Pinecone
from huggingface_hub import InferenceClient

load_dotenv()

API_KEY = os.environ["PINECONE_API_KEY"]
HF_TOKEN = os.environ["HF_TOKEN"]
MODEL_NAME = "BAAI/bge-base-en-v1.5"
INDEX_NAME = "portfolio-snippets"
CONTEXT_FILE = "context.md"
ALL_PROJECT_IDS_FILE = "all_project_ids.json"

pc = Pinecone(api_key=API_KEY)
index = pc.Index(INDEX_NAME)
client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)

def parse_project_lines(buffer):
    projects = []
    project = {}
    for line in buffer:
        if line.startswith('**'):
            # New project
            if project:
                projects.append(project)
                project = {}
            # Extract name and year
            m = re.match(r'\*\*(.*?)\*\* ?\((\d{4})\)?:? ?(.*)', line)
            if m:
                project['name'] = m.group(1).strip()
                project['year'] = m.group(2) if m.group(2) else ''
                project['description'] = m.group(3).strip()
            else:
                project['name'] = line.strip()
                project['year'] = ''
                project['description'] = ''
        elif line.startswith('Technologies:'):
            project['technologies'] = line.replace('Technologies:', '').strip()
        elif line.startswith('Role:'):
            project['role'] = line.replace('Role:', '').strip()
        elif line.startswith('Demo:'):
            project['demo'] = line.replace('Demo:', '').strip()
    if project:
        projects.append(project)
    return projects

def parse_context_md(path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    snippets = []
    section = None
    buffer = []
    for line in lines:
        line = line.strip()
        if line.startswith("## "):
            if buffer and section:
                if section == "Projects":
                    projects = parse_project_lines(buffer)
                    for p in projects:
                        snippets.append({"section": section, "text": json.dumps(p)})
                else:
                    for item in buffer:
                        snippets.append({"section": section, "text": item})
            section = line.replace("## ", "")
            buffer = []
        elif line.startswith("- **") or line.startswith("- "):
            if section == "Projects":
                buffer.append(line.lstrip("- ").strip())
            else:
                if buffer:
                    snippets.append({"section": section, "text": "\n".join(buffer)})
                    buffer = []
                buffer.append(line.lstrip("- ").strip())
        elif line:
            buffer.append(line)
    if buffer and section:
        if section == "Projects":
            projects = parse_project_lines(buffer)
            for p in projects:
                snippets.append({"section": section, "text": json.dumps(p)})
        else:
            for item in buffer:
                snippets.append({"section": section, "text": item})
    return snippets

def embed_and_upload(snippets):
    project_ids = []
    for snip in snippets:
        text = snip["text"]
        section = snip["section"]
        embedding = client.feature_extraction(text, model=MODEL_NAME)
        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()
        snippet_id = f"context-{uuid.uuid4()}"
        index.upsert(vectors=[(
            snippet_id,
            embedding,
            {"text": text, "section": section}
        )])
        print(f"Uploaded snippet: {section} | {text[:60]}...")
        if section == "Projects":
            project_ids.append(snippet_id)
    # Save all project IDs
    if project_ids:
        with open(ALL_PROJECT_IDS_FILE, "w") as f:
            json.dump(project_ids, f)

if __name__ == "__main__":
    snippets = parse_context_md(CONTEXT_FILE)
    embed_and_upload(snippets)
    print("All context uploaded to Pinecone.")