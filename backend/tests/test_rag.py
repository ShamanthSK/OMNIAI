import pytest
from app.rag.extractor import DocumentExtractor
from app.rag.chunker import TextChunker


def test_text_chunking():
    sample_text = " ".join([f"word{i}" for i in range(1000)])
    chunks = TextChunker.chunk_text(sample_text, chunk_size=200, overlap=50)
    assert len(chunks) > 1
    assert chunks[0]["chunk_index"] == 0
    assert "word0" in chunks[0]["content"]


def test_txt_extraction():
    raw_bytes = b"Hello OmniAI RAG system!\nThis is a sample document."
    text = DocumentExtractor.extract_text(raw_bytes, "test.txt")
    assert "Hello OmniAI RAG system!" in text
