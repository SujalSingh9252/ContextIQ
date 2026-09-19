import os
import numpy as np


class VectorStore:
    def __init__(self, dim: int):
        import faiss

        self.faiss = faiss
        self.index = faiss.IndexFlatL2(dim)

        # Store chunks along with document ID
        self.documents = []

    def add_embeddings(self, embeddings, texts, doc_id):
        embeddings_array = np.array(embeddings, dtype="float32")

        self.index.add(embeddings_array)

        for text in texts:
            self.documents.append({
                "chunk": text,
                "doc_id": doc_id
            })

    def search(self, query_embedding, k=3):
        if self.index.ntotal == 0:
            return []

        k = min(k, self.index.ntotal)

        distances, indices = self.index.search(
            np.array([query_embedding], dtype="float32"),
            k
        )

        results = []

        for idx, dist in zip(indices[0], distances[0]):
            if idx < 0:
                continue

            doc = self.documents[idx]

            results.append({
                "chunk": doc["chunk"],
                "doc_id": doc["doc_id"],
                "score": float(dist)
            })

        return results

    def save(self, path="vector_store"):
        os.makedirs(path, exist_ok=True)

        self.faiss.write_index(
            self.index,
            f"{path}/index.faiss"
        )

        import pickle

        with open(f"{path}/documents.pkl", "wb") as f:
            pickle.dump(self.documents, f)

    def load(self, path="vector_store"):
        import pickle

        self.index = self.faiss.read_index(
            f"{path}/index.faiss"
        )

        documents_path = f"{path}/documents.pkl"

        if os.path.exists(documents_path):
            with open(documents_path, "rb") as f:
                self.documents = pickle.load(f)
        else:
            self.documents = []