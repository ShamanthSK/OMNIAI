import json
import math
from typing import List, Dict, Any, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import DBDocumentChunk, DBDocument
from app.providers.registry import provider_registry


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


class VectorStore:
    """Manages document chunk embeddings and vector similarity queries."""

    @classmethod
    async def get_embedding(cls, text: str) -> List[float]:
        # Use active configured provider or demo fallback
        provider = provider_registry.get_provider("gemini")
        return await provider.embed(text)

    @classmethod
    async def search(
        cls, db: AsyncSession, query_embedding: List[float], top_k: int = 4, document_ids: List[str] = None
    ) -> List[Tuple[DBDocumentChunk, str, float]]:
        """
        Returns list of (DBDocumentChunk, filename, similarity_score).
        """
        stmt = select(DBDocumentChunk, DBDocument.filename).join(
            DBDocument, DBDocumentChunk.document_id == DBDocument.id
        )
        
        if document_ids:
            stmt = stmt.where(DBDocumentChunk.document_id.in_(document_ids))

        result = await db.execute(stmt)
        rows = result.all()

        scored_chunks = []
        for chunk, filename in rows:
            if chunk.embedding_json:
                try:
                    vec = json.loads(chunk.embedding_json)
                    score = cosine_similarity(query_embedding, vec)
                    scored_chunks.append((chunk, filename, score))
                except Exception:
                    continue

        scored_chunks.sort(key=lambda x: x[2], reverse=True)
        return scored_chunks[:top_k]
