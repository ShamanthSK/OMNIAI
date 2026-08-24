from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.store import VectorStore
from app.models.schemas import CitationSource


class RAGRetriever:
    """Retrieves relevant RAG context and structures citation metadata."""

    @classmethod
    async def retrieve_context(
        cls, db: AsyncSession, prompt: str, document_ids: Optional[List[str]] = None, top_k: int = 3
    ) -> Tuple[str, List[CitationSource]]:
        
        # 1. Generate query embedding
        query_embedding = await VectorStore.get_embedding(prompt)

        # 2. Search top matching chunks
        matched_results = await VectorStore.search(
            db=db,
            query_embedding=query_embedding,
            top_k=top_k,
            document_ids=document_ids
        )

        if not matched_results:
            return "", []

        context_blocks = []
        citations = []

        for chunk, filename, score in matched_results:
            snippet = chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content
            context_blocks.append(
                f"[Source: {filename} (Chunk #{chunk.chunk_index + 1})]\n{chunk.content}"
            )
            citations.append(
                CitationSource(
                    document_id=chunk.document_id,
                    filename=filename,
                    chunk_index=chunk.chunk_index,
                    snippet=snippet,
                    score=round(float(score), 4)
                )
            )

        full_context_str = "\n\n".join(context_blocks)
        return full_context_str, citations
