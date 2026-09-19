import os
import httpx
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.rag_service import RAGService
from app.schemas.response import AskResponse
from app.core.config import settings

# ── Supabase auth ─────────────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Validate a Supabase JWT by calling the Supabase Auth REST API."""
    token = credentials.credentials

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Server misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set",
        )

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_data = resp.json()
    return user_data.get("id", "unknown")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev. In prod, lock this down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = RAGService()

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "NeuralDoc API is running"}


@app.post("/api/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed."}

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    rag_service.index_pdf(file_path)

    return {
        "status": "File uploaded and indexed successfully",
        "filename": file.filename,
    }


@app.get("/api/ask", response_model=AskResponse)
def ask(q: str, current_user: str = Depends(get_current_user)):
    if not q.strip():
        return {
            "answer": "Query cannot be empty.",
            "sources": [],
            "latency": 0.0,
        }

    return rag_service.generate(q)


@app.get("/api/status")
def status():
    return {"documents_indexed": rag_service.has_documents()}


@app.get("/api/documents")
def list_docs():
    return {"documents": rag_service.get_documents()}
