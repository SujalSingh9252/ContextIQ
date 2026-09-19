from dotenv import load_dotenv
import os

load_dotenv(override=True)


class Settings:
    def __init__(self):
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")

        self.LLM_PROVIDER = os.getenv("LLM_PROVIDER")
        self.VECTOR_DB_PROVIDER = os.getenv("VECTOR_DB_PROVIDER")
        self.EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER")

        self.PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        self.PINECONE_INDEX = os.getenv("PINECONE_INDEX")
        self.UPLOAD_DIR = os.getenv("UPLOAD_DIR", "data")

        self._validate()

    def _validate(self):
        errors = []
        if not self.LLM_PROVIDER:
            errors.append("LLM_PROVIDER is not set (use 'groq' or 'gemini')")
        if not self.VECTOR_DB_PROVIDER:
            errors.append("VECTOR_DB_PROVIDER is not set (use 'faiss' or 'pinecone')")
        if not self.EMBEDDING_PROVIDER:
            errors.append("EMBEDDING_PROVIDER is not set (use 'local' or 'gemini')")
        if self.LLM_PROVIDER == "groq" and not self.GROQ_API_KEY:
            errors.append("GROQ_API_KEY is not set")
        if self.LLM_PROVIDER == "gemini" and not self.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY is not set")
        if self.VECTOR_DB_PROVIDER == "pinecone" and not self.PINECONE_API_KEY:
            errors.append("PINECONE_API_KEY is not set")
        if self.VECTOR_DB_PROVIDER == "pinecone" and not self.PINECONE_INDEX:
            errors.append("PINECONE_INDEX is not set")
        if errors:
            raise EnvironmentError("Missing required environment variables:\n" + "\n".join(f"  - {e}" for e in errors))


settings = Settings()