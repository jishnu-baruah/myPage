# TODO: Portfolio Website RAG Server with UI Dashboard

## 1. Project Planning
- [x] Define the scope: portfolio content types (projects, blogs, about, etc.)
- [x] Choose stack: FastAPI (backend), Pinecone (vector DB), Hugging Face (embeddings), modern JS (UI)
- [x] Design minimal schema for portfolio snippets (title, content, tags, date, etc.)

## 2. Backend (FastAPI)
- [x] Set up FastAPI project structure
- [x] Create endpoints:
    - [x] `/query` (RAG retrieval + Gemini generation)
    - [x] `/add_snippet` (add portfolio content)
    - [x] `/edit_snippet` (edit content)
    - [x] `/delete_snippet` (delete content)
    - [x] `/list_snippets` (list all content)
    - [x] `/download_snippets` (export as JSON)
- [x] Integrate Pinecone for vector storage
- [x] Integrate Hugging Face Inference API for embeddings
- [x] Integrate Gemini (Google Generative AI) for answer generation
- [x] Conditional generation: If relevant RAG content (score >= 0.5), use as context for Gemini; else, Gemini answers generally with minimal hallucination
- [x] Add CORS and environment variable support

## 3. Embedding Logic
- [x] Use a suitable model (e.g., all-MiniLM-L6-v2 or BGE)
- [x] Ensure all endpoints use consistent embedding logic
- [ ] Add batch embedding script for initial content

## 4. UI Dashboard
- [ ] Design a modern, responsive dashboard (React, Vue, or plain JS)
- [x] Features:
    - [x] Add/edit/delete portfolio items
    - [x] Query/search interface
    - [x] List and filter content
    - [x] Download/export data
    - [x] Copy-to-clipboard, expandable text, confirmation messages
- [x] Connect UI to FastAPI endpoints (REST calls)
- [ ] Add authentication (optional, for admin dashboard)

## 5. Deployment
- [x] Prepare requirements.txt and render.yaml for Render or similar
- [ ] Add README with setup and usage instructions
- [x] Test on local and cloud (Render, Vercel, etc.)

## 6. Polish & Docs
- [ ] Add error handling and logging
- [ ] Write user/admin documentation
- [ ] Add example data and screenshots

---

**Stretch Goals:**
- [ ] Add semantic search for portfolio tags/skills
- [ ] Integrate with a chatbot for portfolio Q&A (Gemini-powered)
- [ ] Add analytics/dashboard for content views/queries 