# RAG Backend ↔ Frontend Integration Plan

## 1. Backend Audit

The FastAPI backend (in `Production-level-RAG-system/backend/`) is robust but uses basic custom authentication via SQLite.

### Endpoints

- **`POST /api/auth/register`** (No Auth): Expects `{ username, password }`, returns `{ message }`.
- **`POST /api/auth/login`** (No Auth): Expects `{ username, password }`, returns `{ access_token, token_type: "bearer" }`. Support for hardcoded `admin`/`password` bypass.
- **`POST /api/upload`** (Requires Bearer Token): Expects `multipart/form-data` with a `.pdf` file. Returns `{ status, filename }` or `{ error }` on failure.
- **`GET /api/ask?q={query}`** (Requires Bearer Token): Expects query parameter `q`. Returns `{ answer: string, sources: string[], latency: float }`. 
- **`GET /api/status`** (No Auth): Returns `{ documents_indexed: bool }`.
- **`GET /api/documents`** (No Auth): Returns `{ documents: [...] }`.
- **`GET /`** (No Auth): Health check returning `{ status, message }`.

### Architecture Details

- **Auth**: Decodes an internal JWT using its own `SECRET_KEY` and algorithm.
- **Data Shapes**: Strict enforcement of payloads using Pydantic models.
- **Streaming/WebSocket**: The endpoints do not currently support streaming natively (relies on blocking generation `rag_service.generate(q)`). 

---

## 2. Frontend Audit

The custom Vite/React frontend currently lives in `src/` at the root.

- **Current API Calls**: There are **no RAG-related API calls currently in `src/`**. The application only simulates the frontend pages. The Landing page (`src/pages/Landing.tsx`) defines the product, but no data fetches occur.
- **Expected Data Shapes**: Since the features aren't wired yet, they dictate the UI architecture but haven't hardened into types.
- **Auth**: The `src/` app utilizes **Supabase** for its entire authentication pipeline (Email/Password, Google OAuth). Sessions and JWTs are managed via `@supabase/supabase-js`. 

---

## 3. Files to Delete

- **Delete Entirely**: `Production-level-RAG-system/frontend/` (Since the Vite frontend replaces this Next.js app completely).
- **Potential Deletions (Backend)**: 
  - `backend/app/api/auth.py`
  - `backend/app/models/user.py` 
  - *Note: These exist to serve the backend's internal SQLite login flow. Because the frontend relies on Supabase, these files might become obsolete if we shift the backend to validate Supabase JWTs.*

---

## 4. Environment Variables

### Expected by Backend (Currently missing in `.env.local`):

- `LLM_PROVIDER` (e.g., `groq` or `gemini`)
- `VECTOR_DB_PROVIDER` (e.g., `faiss` or `pinecone`)
- `EMBEDDING_PROVIDER` (e.g., `local` or `gemini`)
- `GROQ_API_KEY` or `GEMINI_API_KEY` (based on provider)
- `PINECONE_API_KEY` and `PINECONE_INDEX` (if using Pinecone)
- `UPLOAD_DIR` (defaults to `data`)

### Expected by Frontend (Currently present in `.env.local`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Gaps Flagged**: The `.env.local` only holds Frontend keys. The backend requires LLM, Embedding, and Vector DB variables. They must be merged.

---

## 5. Mismatches & Conflicts

1. **Authentication Mismatch (Critical)**: The backend issues its own JWT tokens via its own logic (`admin`/`password`). The Vite frontend utilizes Supabase JWTs. **Conflict:** If the frontend passes a Supabase JWT to the backend, `fastapi.security.HTTPBearer` will reject it as it does not match its internal `SECRET_KEY`. 
2. **Missing Chat UI**: The root frontend has a Landing page navigating to `/chat` (or similar features), but that page does not exist in `main.tsx` routes. 
3. **CORS Assumptions**: The backend defines permissive CORS `allow_origins=["*"]`. This should be tightened.
4. **Proxy/Port Configurations**: The React app runs on `5173` while the backend runs on `8000`. The frontend lacks a mechanism (like `api.ts` or Vite proxy config) to direct `/api/*` network requests to `http://localhost:8000`.

---

## 6. Proposed Final Structure

The monorepo structure will be cleaned up to flatten the architecture.

```text
MY-VLY-PROJECT/
├── backend/                  ← Moved from Production-level-RAG-system/backend/
├── src/                      ← Frontend logic (unchanged structure)
├── public/
├── package.json
├── vite.config.ts            ← Will contain proxy configuration
├── tailwind.config.js
└── .env                      ← Unified config containing Vite+Supabase + Backend LLM API keys
```

---

## 7. Step-by-Step Integration Checklist

- [ ] **Step 1: Cleanup & Move**
  - Delete `Production-level-RAG-system/frontend/`.
  - Move `Production-level-RAG-system/backend/` to `backend/` in the root structure.
  - Move/Merge the backend `.env` variables into a single root `.env` or `.env.local`.
  - Remove the now-empty `Production-level-RAG-system/` directory.

- [ ] **Step 2: API Proxy Setup**
  - Edit `vite.config.ts` in the root to add a `server.proxy` object forwarding `/api` calls to `http://localhost:8000` to avoid CORS headaches during local development.

- [ ] **Step 3: Resolve Auth Conflict**
  - Modify the FastAPI backend authorization logic (`get_current_user` in `main.py`).
  - Instead of decoding tokens using local `SECRET_KEY`, fetch Supabase's public JWT signing keys or use the Supabase Python SDK to validate incoming tokens.

- [ ] **Step 4: Frontend API Scaffolding `src/lib/api.ts`**
  - Extract the session token from Supabase context (`session.access_token`).
  - Create fetching utilities (`uploadPdf()`, `askQuery()`) passing the Bearer token in the `Authorization` header.

- [ ] **Step 5: File Upload & Ask UI**
  - Scaffold out the `/chat` route in `main.tsx` or similar app dashboard routes.
  - Implement form submission handling the `multipart/form-data` requirement.

- [ ] **Step 6: Hardening**
  - Update `backend/app/main.py` CORS `allow_origins` to restrict access strictly to the production frontend URL and Vite dev server.
  - Remove the mock `admin` / `password` backend route.