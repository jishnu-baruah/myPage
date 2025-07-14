import os
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
import pinecone
import traceback
import re
import asyncio
import httpx
from collections import OrderedDict
import time
import logging
from langchain_huggingface import HuggingFaceEndpointEmbeddings

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "portfolio-index")
USER_IDS_FILE = "portfolio_user_snippet_ids.json"
HF_TOKEN = os.getenv("HF_TOKEN")
HF_MODEL_NAME = os.getenv("HF_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ALL_PROJECT_IDS_FILE = "all_project_ids.json"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in the environment. Please add it to your .env file.")

# Embeddings
hf_embeddings = HuggingFaceEndpointEmbeddings(
    repo_id=HF_MODEL_NAME,
    huggingfacehub_api_token=HF_TOKEN
)

# Vector DB
vectordb = PineconeVectorStore.from_existing_index(
    index_name=PINECONE_INDEX,
    embedding=hf_embeddings
)

# LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", google_api_key=GEMINI_API_KEY)

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

@app.post("/add_snippet")
def add_snippet(req: AddSnippetRequest):
    try:
        embedding = hf_embeddings.embed_query(req.text)
        snippet_id = f"user-{uuid.uuid4()}"
        now = datetime.utcnow().isoformat()
        vectordb.add_texts(
            texts=[req.text],
            metadatas=[{"text": req.text, "section": req.section, "date": now}],
            ids=[snippet_id]
        )
        add_user_id(snippet_id)
        return {"status": "success", "id": snippet_id}
    except Exception as e:
        print("Error in /add_snippet endpoint:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/edit_snippet")
def edit_snippet(req: EditSnippetRequest):
    try:
        embedding = hf_embeddings.embed_query(req.text)
        now = datetime.utcnow().isoformat()
        vectordb.add_texts(
            texts=[req.text],
            metadatas=[{"text": req.text, "section": req.section, "date": now}],
            ids=[req.id]
        )
        return {"status": "success", "id": req.id}
    except Exception as e:
        print("Error in /edit_snippet endpoint:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/delete_snippet")
def delete_snippet(req: DeleteSnippetRequest):
    try:
        vectordb.delete(ids=[req.id])
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
        docs = vectordb.similarity_search_by_vector([0.0]*hf_embeddings.embedding_dimensions, k=len(ids))
        snippets = []
        for doc in docs:
            meta = doc.metadata
            snippets.append({
                "id": meta.get("id", ""),
                "text": meta.get("text", ""),
                "section": meta.get("section", ""),
                "date": meta.get("date", "")
            })
        return {"snippets": snippets}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/download_snippets")
def download_snippets():
    try:
        ids = get_user_ids()
        if not ids:
            return JSONResponse(content=json.dumps([]), media_type="application/json")
        docs = vectordb.similarity_search_by_vector([0.0]*hf_embeddings.embedding_dimensions, k=len(ids))
        snippets = []
        for doc in docs:
            meta = doc.metadata
            snippets.append({
                "id": meta.get("id", ""),
                "text": meta.get("text", ""),
                "section": meta.get("section", ""),
                "date": meta.get("date", "")
            })
        return JSONResponse(content=json.dumps(snippets), media_type="application/json")
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/chat")
async def chat_endpoint(req: QueryRequest):
    try:
        retriever = vectordb.as_retriever(search_kwargs={"k": req.top_k})
        from langchain.chains import RetrievalQA
        qa = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever
        )
        response = qa.invoke(req.question)
        return {"response": response}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})

# Admin endpoints for add/update/delete can be added similarly as above. 