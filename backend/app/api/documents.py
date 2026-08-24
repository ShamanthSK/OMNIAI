import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.schemas import DBDocument, DBDocumentChunk, DocumentSchema
from app.rag.extractor import DocumentExtractor
from app.rag.chunker import TextChunker
from app.rag.store import VectorStore

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required.")

    # Read bytes & validate size (limit 25MB)
    content_bytes = await file.read()
    if len(content_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 25MB limit.")

    # Create document record
    doc_record = DBDocument(
        filename=file.filename,
        file_type=file.content_type or file.filename.split(".")[-1],
        file_size=len(content_bytes),
        status="processing"
    )
    db.add(doc_record)
    await db.commit()
    await db.refresh(doc_record)

    try:
        # Extract text
        extracted_text = DocumentExtractor.extract_text(content_bytes, file.filename)
        if not extracted_text.strip():
            doc_record.status = "failed"
            doc_record.error_message = "No readable text content found in document."
            await db.commit()
            return doc_record

        # Chunk text
        chunks = TextChunker.chunk_text(extracted_text)
        
        # Embed and save chunks
        chunk_objects = []
        for c in chunks:
            vec = await VectorStore.get_embedding(c["content"])
            chunk_db = DBDocumentChunk(
                document_id=doc_record.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                embedding_json=json.dumps(vec),
                metadata_json=json.dumps({"filename": file.filename})
            )
            chunk_objects.append(chunk_db)

        db.add_all(chunk_objects)
        doc_record.status = "ready"
        doc_record.chunk_count = len(chunks)
        await db.commit()
        await db.refresh(doc_record)

        return doc_record

    except Exception as e:
        doc_record.status = "failed"
        doc_record.error_message = str(e)
        await db.commit()
        await db.refresh(doc_record)
        return doc_record


@router.get("", response_model=List[DocumentSchema])
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBDocument).order_by(DBDocument.created_at.desc()))
    return result.scalars().all()


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBDocument).where(DBDocument.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully", "id": doc_id}
