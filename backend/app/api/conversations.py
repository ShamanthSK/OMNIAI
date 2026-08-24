import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.schemas import DBConversation, DBMessage, ConversationSchema, ConversationDetailSchema

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationSchema])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DBConversation).order_by(DBConversation.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/{conversation_id}", response_model=ConversationDetailSchema)
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(DBConversation)
        .where(DBConversation.id == conversation_id)
        .options(selectinload(DBConversation.messages))
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages_list = []
    for msg in conv.messages:
        meta = json.loads(msg.metadata_json) if msg.metadata_json else {}
        messages_list.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "mode": msg.mode,
            "selected_model": msg.selected_model,
            "provider_used": msg.provider_used,
            "routing_reason": meta.get("routing_reason"),
            "task_category": meta.get("task_category"),
            "comparison_results": meta.get("comparison_results"),
            "synthesis": meta.get("synthesis"),
            "citations": meta.get("citations"),
            "created_at": msg.created_at
        })

    return {
        "id": conv.id,
        "title": conv.title,
        "mode": conv.mode,
        "selected_model": conv.selected_model,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "messages": messages_list
    }


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DBConversation).where(DBConversation.id == conversation_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conv)
    await db.commit()
    return {"message": "Conversation deleted successfully"}
