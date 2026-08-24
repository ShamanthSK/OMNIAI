import datetime
import uuid
import json
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import BaseModel, Field

from app.core.database import Base


# ==========================================
# SQLAlchemy Database Models
# ==========================================

def generate_uuid() -> str:
    return str(uuid.uuid4())


class DBUser(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    conversations = relationship("DBConversation", back_populates="user", cascade="all, delete-orphan")


class DBConversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String, default="New Conversation")
    mode: Mapped[str] = mapped_column(String, default="auto")  # auto, single, compare
    selected_model: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    user = relationship("DBUser", back_populates="conversations")
    messages = relationship("DBMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="DBMessage.created_at")


class DBMessage(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    conversation_id: Mapped[str] = mapped_column(String, ForeignKey("conversations.id"))
    role: Mapped[str] = mapped_column(String)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text)
    mode: Mapped[str] = mapped_column(String, default="auto")
    selected_model: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    provider_used: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Store JSON string for citations/synthesis
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("DBConversation", back_populates="messages")
    model_runs = relationship("DBModelRun", back_populates="message", cascade="all, delete-orphan")
    feedback = relationship("DBFeedback", back_populates="message", cascade="all, delete-orphan", uselist=False)


class DBDocument(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    filename: Mapped[str] = mapped_column(String)
    file_type: Mapped[str] = mapped_column(String)
    file_size: Mapped[int] = mapped_column(Integer)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="uploading")  # uploading, processing, ready, failed
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    chunks = relationship("DBDocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DBDocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    document_id: Mapped[str] = mapped_column(String, ForeignKey("documents.id"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    embedding_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Stored list of floats JSON
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    document = relationship("DBDocument", back_populates="chunks")


class DBModelRun(Base):
    __tablename__ = "model_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    conversation_id: Mapped[str] = mapped_column(String)
    message_id: Mapped[str] = mapped_column(String, ForeignKey("messages.id"))
    provider: Mapped[str] = mapped_column(String)
    model_name: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)  # success, error
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    error_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response_content: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    message = relationship("DBMessage", back_populates="model_runs")


class DBFeedback(Base):
    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    message_id: Mapped[str] = mapped_column(String, ForeignKey("messages.id"))
    is_helpful: Mapped[bool] = mapped_column(Boolean)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    message = relationship("DBMessage", back_populates="feedback")


# ==========================================
# Pydantic API Schemas
# ==========================================

class MessageCreate(BaseModel):
    conversation_id: Optional[str] = None
    prompt: str
    mode: str = "auto"  # auto, single, compare
    selected_model: Optional[str] = None
    document_ids: Optional[List[str]] = None


class ModelComparisonResult(BaseModel):
    provider: str
    provider_name: str
    model_name: str
    status: str  # success, error, unavailable
    response: str
    latency_ms: float
    error: Optional[str] = None
    is_demo: bool = False


class SynthesisData(BaseModel):
    agreements: List[str]
    discrepancies: List[str]
    hallucination_warnings: List[str]
    uncertainty_level: str  # Low, Medium, High
    combined_answer: str


class CitationSource(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    snippet: str
    score: float


class ChatResponse(BaseModel):
    message_id: str
    conversation_id: str
    role: str = "assistant"
    content: str
    mode: str
    selected_model: Optional[str] = None
    provider_used: str
    routing_reason: Optional[str] = None
    task_category: Optional[str] = None
    comparison_results: Optional[List[ModelComparisonResult]] = None
    synthesis: Optional[SynthesisData] = None
    citations: Optional[List[CitationSource]] = None
    is_demo: bool = False
    created_at: datetime.datetime


class ConversationSchema(BaseModel):
    id: str
    title: str
    mode: str
    selected_model: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ConversationDetailSchema(ConversationSchema):
    messages: List[Dict[str, Any]]


class DocumentSchema(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime.datetime


class ProviderStatusSchema(BaseModel):
    id: str
    name: str
    model: str
    configured: bool
    status: str  # configured, demo, unavailable, error
    capabilities: List[str]
    description: str


class FeedbackCreate(BaseModel):
    message_id: str
    is_helpful: bool
    comment: Optional[str] = None
