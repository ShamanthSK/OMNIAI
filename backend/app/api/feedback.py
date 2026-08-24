from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.schemas import DBFeedback, DBMessage, FeedbackCreate

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("")
async def record_feedback(payload: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBMessage).where(DBMessage.id == payload.message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    fb = DBFeedback(
        message_id=payload.message_id,
        is_helpful=payload.is_helpful,
        comment=payload.comment
    )
    db.add(fb)
    await db.commit()
    return {"status": "success", "message": "Feedback recorded successfully."}
