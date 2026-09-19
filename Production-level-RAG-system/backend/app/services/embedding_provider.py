import os
import requests


class EmbeddingProvider:
    def __init__(self):
        self.provider = os.getenv("EMBEDDING_PROVIDER", "local")

        if self.provider == "huggingface":
            self.api_key = os.getenv("HF_API_KEY")
            if not self.api_key:
                raise RuntimeError("HF_API_KEY not set")

            self.model_url = (
                "https://router.huggingface.co/hf-inference/"
                "models/sentence-transformers/all-MiniLM-L6-v2"
            )
        else:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed(self, texts):
        if self.provider == "huggingface":
            headers = {"Authorization": f"Bearer {self.api_key}"}
            embeddings = []

            for text in texts:
                response = requests.post(
                    self.model_url,
                    headers=headers,
                    json={"inputs": text}
                )

                if response.status_code != 200:
                    raise RuntimeError(
                        f"HuggingFace API error: {response.text}"
                    )

                data = response.json()

                # HF feature-extraction returns list of token embeddings
                # We average them to get single sentence embedding
                if isinstance(data, list):
                    # average pooling
                    import numpy as np
                    vector = np.mean(data, axis=0).tolist()
                    embeddings.append(vector)
                else:
                    raise RuntimeError(f"Unexpected HF response: {data}")

            return embeddings

        elif self.provider == "local":
            return self.model.encode(texts).tolist()