from pypdf import PdfReader
from app.services.embedding_provider import EmbeddingProvider
from app.services.retreiver import VectorStore
from app.services.pinecone_store import PineconeVectorStore
from .llm import generate_response
from app.core.logger import logger
import time
import mlflow
import os
from dotenv import load_dotenv      
load_dotenv()

SIMILARITY_THRESHOLD = 5.0

class RAGService:

    def __init__(self):
        self.embedding_provider = EmbeddingProvider()
        self.vector_provider = os.getenv("VECTOR_DB_PROVIDER")

        if self.vector_provider == "pinecone":
            self.vector_store = PineconeVectorStore(384)
            print("Using Pinecone vector store.")
        else:
            self.vector_store = VectorStore(384)
            # Try loading existing index
            if os.path.exists("vector_store/index.faiss"):
                self.vector_store.load()
                print("Vector store loaded successfully.")
            else:
                print("No existing vector store found.")

    def index_pdf(self, path: str):
        reader = PdfReader(path)
        text = ""

        for page in reader.pages:
            text += page.extract_text()

        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        embeddings = self.embedding_provider.embed(chunks)

        doc_id = os.path.basename(path)
        self.vector_store.add_embeddings(embeddings, chunks, doc_id)
        if self.vector_provider != "pinecone":
            self.vector_store.save()
        

    def retrieve(self, query: str):
        query_embedding = self.embedding_provider.embed([query])[0]
        return self.vector_store.search(query_embedding)

    def generate(self, query: str):

        mlflow.set_experiment("RAG-Observability")

        start_time = time.time()
        retrieved_results = self.retrieve(query)

        filtered = [
            r for r in retrieved_results
            if r["score"] <= SIMILARITY_THRESHOLD
        ]

        sources = list(set([r["doc_id"] for r in filtered]))

        if not filtered:
            return "No relevant information found."

        context = "\n\n".join([r["chunk"] for r in filtered])

        prompt = f"""
You are an AI assistant.
Answer ONLY from the provided context.
If answer is not in context, say "Information not found in context."

Context:
{context}

Question:
{query}

Answer:
"""

        answer = generate_response(prompt)
        latency = round(time.time() - start_time, 2)

        logger.info(f"Query: {query}")
        logger.info(f"Retrieved count: {len(filtered)}")
        logger.info(f"Latency: {latency:.2f}s")

        return {
            "answer": answer,
            "sources": sources,
            "latency": latency
        }
    def has_documents(self):
        return len(self.get_documents()) > 0

    def get_documents(self):
        if self.vector_provider == "pinecone":
            return self.vector_store.get_documents()
        return list(set([doc["doc_id"] for doc in self.vector_store.documents]))