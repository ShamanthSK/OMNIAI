import json
import time
import asyncio
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.schemas import (
    MessageCreate, ChatResponse, ModelComparisonResult, SynthesisData,
    DBConversation, DBMessage, DBModelRun
)
from app.agents.classifier import RequestClassifier
from app.agents.router import AgentRouter
from app.agents.synthesizer import MultiModelSynthesizer
from app.rag.retriever import RAGRetriever

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def process_chat(payload: MessageCreate, db: AsyncSession = Depends(get_db)):
    # 1. Get or create conversation
    conv_id = payload.conversation_id
    if not conv_id:
        title_snippet = payload.prompt[:35] + ("..." if len(payload.prompt) > 35 else "")
        conv = DBConversation(title=title_snippet, mode=payload.mode, selected_model=payload.selected_model)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        conv_id = conv.id
    else:
        result = await db.execute(select(DBConversation).where(DBConversation.id == conv_id))
        conv = result.scalar_one_or_none()
        if not conv:
            conv = DBConversation(id=conv_id, title=payload.prompt[:35], mode=payload.mode, selected_model=payload.selected_model)
            db.add(conv)
            await db.commit()

    # 2. Store user message
    user_msg = DBMessage(
        conversation_id=conv_id,
        role="user",
        content=payload.prompt,
        mode=payload.mode,
        selected_model=payload.selected_model
    )
    db.add(user_msg)
    await db.commit()

    # 3. Classify Request
    classification = RequestClassifier.classify(payload.prompt, document_attached=bool(payload.document_ids))
    category = classification["category"]

    # 4. RAG Context check
    context_str = ""
    citations = []
    if classification["requires_rag"] or payload.document_ids:
        context_str, citations = await RAGRetriever.retrieve_context(
            db, payload.prompt, document_ids=payload.document_ids
        )

    # 5. Model Routing
    target_providers, routing_reason = AgentRouter.route(
        mode=payload.mode, category=category, requested_model=payload.selected_model
    )

    comparison_results: Optional[List[ModelComparisonResult]] = None
    synthesis_data: Optional[SynthesisData] = None
    final_content = ""
    primary_provider_used = target_providers[0].name if target_providers else "OmniAI Core"
    is_demo_run = any(getattr(p, "is_demo", False) for p in target_providers)

    # 6. Execution Flow
    if payload.mode == "compare" or len(target_providers) > 1:
        # Concurrent Multi-Model Execution
        start_time = time.time()
        
        async def run_provider(provider):
            p_start = time.time()
            try:
                resp_text = await provider.generate(payload.prompt, context=context_str)
                latency = round((time.time() - p_start) * 1000, 2)
                return ModelComparisonResult(
                    provider=provider.provider_id,
                    provider_name=provider.name,
                    model_name=provider.model_name,
                    status="success",
                    response=resp_text,
                    latency_ms=latency,
                    is_demo=getattr(provider, "is_demo", False)
                )
            except Exception as e:
                latency = round((time.time() - p_start) * 1000, 2)
                return ModelComparisonResult(
                    provider=provider.provider_id,
                    provider_name=provider.name,
                    model_name=provider.model_name,
                    status="error",
                    response=f"Error executing provider {provider.name}: {str(e)}",
                    latency_ms=latency,
                    error=str(e),
                    is_demo=getattr(provider, "is_demo", False)
                )

        tasks = [run_provider(p) for p in target_providers]
        comparison_results = await asyncio.gather(*tasks)

        # Synthesize results
        synthesis_data = await MultiModelSynthesizer.synthesize(payload.prompt, comparison_results)
        final_content = synthesis_data.combined_answer
        primary_provider_used = "OmniAI Multi-Model Engine"

    else:
        # Single or Auto execution
        provider = target_providers[0]
        start_time = time.time()
        final_content = await provider.generate(payload.prompt, context=context_str)
        latency = round((time.time() - start_time) * 1000, 2)
        primary_provider_used = provider.name

    # 7. Store Assistant Message
    meta_payload = {
        "routing_reason": routing_reason,
        "task_category": category,
        "comparison_results": [c.model_dump() for c in comparison_results] if comparison_results else None,
        "synthesis": synthesis_data.model_dump() if synthesis_data else None,
        "citations": [c.model_dump() for c in citations] if citations else None
    }

    assistant_msg = DBMessage(
        conversation_id=conv_id,
        role="assistant",
        content=final_content,
        mode=payload.mode,
        selected_model=payload.selected_model,
        provider_used=primary_provider_used,
        metadata_json=json.dumps(meta_payload)
    )
    db.add(assistant_msg)
    
    # Touch conversation timestamp
    conv.updated_at = datetime.datetime.utcnow()
    await db.commit()
    await db.refresh(assistant_msg)

    return ChatResponse(
        message_id=assistant_msg.id,
        conversation_id=conv_id,
        role="assistant",
        content=final_content,
        mode=payload.mode,
        selected_model=payload.selected_model,
        provider_used=primary_provider_used,
        routing_reason=routing_reason,
        task_category=category,
        comparison_results=comparison_results,
        synthesis=synthesis_data,
        citations=citations,
        is_demo=is_demo_run,
        created_at=assistant_msg.created_at
    )


@router.post("/stream")
async def stream_chat(payload: MessageCreate, db: AsyncSession = Depends(get_db)):
    """Server-Sent Events (SSE) streaming endpoint."""
    classification = RequestClassifier.classify(payload.prompt, document_attached=bool(payload.document_ids))
    target_providers, routing_reason = AgentRouter.route(
        mode=payload.mode, category=classification["category"], requested_model=payload.selected_model
    )
    provider = target_providers[0]

    context_str = ""
    if classification["requires_rag"] or payload.document_ids:
        context_str, _ = await RAGRetriever.retrieve_context(db, payload.prompt, document_ids=payload.document_ids)

    async def sse_event_generator():
        # Yield metadata initial event
        meta_event = {
            "type": "meta",
            "provider": provider.name,
            "routing_reason": routing_reason,
            "category": classification["category"]
        }
        yield f"data: {json.dumps(meta_event)}\n\n"

        async for chunk in provider.stream(payload.prompt, context=context_str):
            data = {"type": "content", "delta": chunk}
            yield f"data: {json.dumps(data)}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Transcribes an uploaded audio file using Gemini Multimodal capabilities."""
    try:
        # Read the uploaded audio bytes
        audio_content = await file.read()
        
        if not audio_content:
            raise HTTPException(status_code=400, detail="Empty audio file uploaded.")
            
        # Access the Gemini provider client
        from app.providers.registry import provider_registry
        gemini_provider = provider_registry.get_provider("gemini")
        
        if not gemini_provider or not gemini_provider.is_configured:
            # If Gemini is not configured, fallback to Demo provider response
            return {"text": "Speech recognition is running in Demo Mode. (Gemini API key is unconfigured)"}
            
        from google.genai import types
        client = gemini_provider._client
        
        candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.0-flash", "gemini-2.5-flash"]
        response = None
        last_error = None
        
        models_to_try = [gemini_provider.model_name] + [m for m in candidate_models if m != gemini_provider.model_name]
        
        for model in models_to_try:
            try:
                response = await client.aio.models.generate_content(
                    model=model,
                    contents=[
                        types.Part.from_bytes(
                            data=audio_content,
                            mime_type=file.content_type or "audio/webm"
                        ),
                        "Transcribe this audio clip to text. Return ONLY the transcribed text. Do not include quotes, explanations, or labels. If the clip contains silence or no speech, return nothing."
                    ]
                )
                if response:
                    gemini_provider.model_name = model
                    break
            except Exception as e:
                last_error = e
                continue
                
        if not response:
            raise last_error or Exception("All candidate models failed to transcribe.")
        
        text_out = response.text.strip() if response and response.text else ""
        return {"text": text_out}
        
    except Exception as e:
        print(f"[Audio Transcription API Error]: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )
