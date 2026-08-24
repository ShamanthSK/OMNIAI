from typing import List, Dict, Any


class TextChunker:
    """Splits document text into overlapping semantic chunks."""

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 800, overlap: int = 150) -> List[Dict[str, Any]]:
        if not text or not text.strip():
            return []

        words = text.split()
        chunks = []
        chunk_idx = 0

        i = 0
        while i < len(words):
            chunk_words = words[i : i + chunk_size]
            chunk_content = " ".join(chunk_words)
            
            chunks.append({
                "chunk_index": chunk_idx,
                "content": chunk_content,
                "token_estimate": len(chunk_words)
            })

            chunk_idx += 1
            i += (chunk_size - overlap)
            if i >= len(words):
                break

        return chunks
