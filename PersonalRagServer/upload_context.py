import os
import uuid
import json
import re
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_pinecone import PineconeVectorStore
import pinecone
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "portfolio-index")
HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_NAME = os.getenv("HF_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
CONTEXT_FILE = "context.md"
ALL_PROJECT_IDS_FILE = "all_project_ids.json"

# Embeddings
hf_embeddings = HuggingFaceEndpointEmbeddings(
    repo_id=HF_MODEL_NAME,
    huggingfacehub_api_token=HF_TOKEN
)

# Ensure Pinecone index exists
pc = Pinecone(api_key=PINECONE_API_KEY)
if PINECONE_INDEX not in pc.list_indexes().names():
    pc.create_index(
        name=PINECONE_INDEX,
        dimension=384,  # all-MiniLM-L6-v2 and similar models use 384
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

# Vector DB
vectordb = PineconeVectorStore.from_existing_index(
    index_name=PINECONE_INDEX,
    embedding=hf_embeddings
)

def parse_project_lines(buffer):
    projects = []
    project = {}
    for line in buffer:
        if line.startswith('**'):
            if project:
                projects.append(project)
                project = {}
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
        snippet_id = f"context-{uuid.uuid4()}"
        vectordb.add_texts(
            texts=[text],
            metadatas=[{"text": text, "section": section}],
            ids=[snippet_id]
        )
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