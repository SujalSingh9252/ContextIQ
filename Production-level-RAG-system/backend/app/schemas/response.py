from pydantic import BaseModel
from typing import List


class AskResponse(BaseModel):
    answer: str
    sources: List[str]
    latency: float