# TODO: Portfolio Website RAG Server with UI Dashboard

## 1. Project Planning
- [x] Define the scope: portfolio content types (projects, blogs, about, etc.)
- [x] Choose stack: FastAPI (backend), Pinecone (vector DB), Hugging Face (embeddings), modern JS (UI)
- [x] Design minimal schema for portfolio snippets (title, content, tags, date, etc.)

## 2. Backend (FastAPI)
- [x] Set up FastAPI project structure
- [x] Create endpoints:
    - [x] `/query` (RAG retrieval + LLM generation)
    - [x] `/add_snippet` (add portfolio content)
    - [x] `/edit_snippet` (edit content)
    - [x] `/delete_snippet` (delete content)
    - [x] `/list_snippets` (list all content)
    - [x] `/download_snippets` (export as JSON)
- [x] Integrate Pinecone for vector storage
- [x] Integrate Hugging Face Inference API for embeddings
- [x] **Switch LLM to Hugging Face Inference API**
    - [x] Sign up for Hugging Face and get API key
    - [x] Choose a suitable model (e.g., Mixtral-8x7B-Instruct, Mistral-7B-Instruct)
    - [x] Implement async LLM call with error handling and timeouts
    - [x] Store API key securely (Render env vars)
    - [x] Refactor `/query` endpoint to be async and use await for all external calls
- [x] **Audit embedding & storage process**
    - [x] Confirmed all major content types (projects, skills, socials, bio, awards) are covered and compatible with new LLM and prompt engineering
    - [x] Projects stored as JSON, others as plain text with clear section labels
    - [x] Reminder: Ensure new content types are labeled and structured consistently
- [ ] **Prompt Engineering & Formatting Consistency**
    - [ ] Review and refine prompt structure to include context, instructions, and formatting rules (markdown, social/contact link rules, project lists, etc.)
    - [ ] Update post-processing logic to enforce output formatting (fix links, deduplicate, etc.)
    - [ ] Test with a variety of queries to ensure formatting is preserved
- [ ] **Short-Term Memory & Caching with Pinecone**
    - [ ] Design schema for storing recent chat history (Q&A pairs) in Pinecone (with session/user ID, timestamp)
    - [ ] On each query, retrieve last N Q&A pairs for session/user and include in prompt
    - [ ] Implement answer caching (in-memory or Pinecone) for repeated questions/answers
    - [ ] Use a hash of question/context as cache key; check cache before LLM call
- [x] **Backend Efficiency & Optimization**
    - [x] Make all external calls (Pinecone, Hugging Face) async
    - [ ] Limit context window (top 3–5 relevant snippets)
    - [x] Minimize dependencies in requirements.txt for faster cold starts
    - [ ] Log slow queries and errors for future optimization

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
- [ ] Document new architecture and flow (e.g., in context.md or README)
- [ ] Add comments to all new/changed code for maintainability

---

## Ongoing Quality & Efficiency Improvements
- [ ] Regularly review and update prompt engineering for best LLM output quality
- [ ] Experiment with different Hugging Face models for best performance/quality tradeoff
- [ ] Monitor API usage and latency; optimize context size and history as needed
- [ ] Add/adjust post-processing to enforce strict formatting rules
- [ ] Add more tests and edge cases to ensure robustness
- [ ] Profile and optimize slow queries or bottlenecks

---

**Stretch Goals:**
- [ ] Add semantic search for portfolio tags/skills
- [ ] Integrate with a chatbot for portfolio Q&A (Hugging Face-powered)
- [ ] Add analytics/dashboard for content views/queries
- [ ] Add A/B testing for prompt/model variants
- [ ] Add monitoring for API usage, cache hits/misses, and errors 