# TODO: Portfolio Site Integration & Polish

## 1. RAG + Gemini Integration (Context-Augmented Generation)
- [ ] Update chat/Q&A flow to:
    - [ ] First call the RAG server for context.
    - [ ] Then call Gemini API, passing both the user's question and the RAG context.
    - [ ] Display Gemini's answer, and optionally the context used.
- [ ] Add error handling and loading states for both RAG and Gemini API calls.
- [ ] (Optional) Show a "powered by Gemini + RAG" badge or info.
- [ ] Create a utility/hook for the two-step process (RAG → Gemini).
- [ ] Ensure the context is formatted clearly for Gemini (e.g., "Context: ... Question: ...").

## 2. RAG Server Integration
- [x] Add API client for FastAPI RAG server (REST calls)
- [x] Integrate RAG server for:
    - [x] Portfolio Q&A (site-wide or in chat)
    - [x] Project/Info/Contact page enhancements (contextual answers, smart suggestions)
- [x] Add error handling and loading states for RAG queries

## 3. Gemini (Google AI) Integration
- [x] Set up Gemini free tier API client (REST or SDK)
- [x] Add Gemini as a fallback or alternative to RAG for chat/answers
- [x] UI toggle or auto-selection between RAG and Gemini
- [x] Show Gemini attribution and handle rate limits/errors

## 4. UI/UX & Styling Consistency
- [ ] Review and unify color palette, font sizes, and spacing (Tailwind + custom CSS)
- [ ] Fix any component-level inconsistencies (buttons, cards, forms, etc.)
- [ ] Ensure dark/light mode works everywhere
- [ ] Polish mobile responsiveness (test all pages/components)
- [ ] Add loading skeletons/placeholders for async content

## 5. Chat & Smart Features
- [ ] Enhance chat interface to support both RAG and Gemini
- [ ] Add message history, copy-to-clipboard, and feedback (like/dislike) options
- [ ] Optionally, allow users to select which AI to use per message

## 6. General Improvements
- [ ] Refactor code for clarity and maintainability (hooks, utils, etc.)
- [ ] Add tests for API integration and UI logic
- [ ] Update documentation for new features and integrations

---

**Stretch Goals:**
- [ ] Add user authentication (if needed for advanced features)
- [ ] Analytics for AI usage and user queries
- [ ] Admin dashboard for monitoring RAG/Gemini usage

# TODO: Make Site Fully Responsive for Mobile (No Overlap, Desktop Unchanged)

- [ ] Home page: Ensure all sections stack and nothing overlaps on mobile
- [ ] Projects page: Make project list, columns, and overlays responsive
- [ ] Info page: Stack social links, awards, and bio vertically on mobile; remove absolute positioning on mobile
- [ ] Contact page: Stack contact info, socials, and form vertically on mobile; remove absolute positioning on mobile
- [ ] Navigation: Ensure navigation is accessible and not overlapping on mobile
- [ ] Chat interface: Confirm button and modal are mobile-friendly (already mostly done)
- [ ] Test all pages on various mobile screen sizes
- [ ] Polish paddings, margins, and max-widths for mobile
- [ ] Keep all desktop (`lg:`) styling unchanged 