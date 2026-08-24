import os
import asyncio
from typing import AsyncGenerator, List, Optional
from app.providers.base import AIProvider
from app.providers.demo import DemoProvider
from app.core.config import settings


class GeminiProvider(AIProvider):
    # Candidate models for Google GenAI in 2026
    CANDIDATE_MODELS = [
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.0-flash",
        "gemini-2.5-flash"
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.provider_id = "gemini"
        self.name = "Google Gemini"
        self.model_name = "gemini-3.6-flash"
        self.capabilities = ["general", "coding", "reasoning", "multimodal", "fast"]
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.is_configured = bool(self.api_key and len(self.api_key.strip()) > 5)
        self.demo_fallback = DemoProvider("gemini", "Google Gemini", "gemini-3.6-flash")
        self._client = None

        if self.is_configured:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception:
                pass

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> str:
        if not self.is_configured or not self._client:
            return await self.demo_fallback.generate(prompt, system_prompt, context)

        full_prompt = prompt
        if context:
            full_prompt = f"Knowledge Context:\n{context}\n\nUser Question:\n{prompt}"
        if system_prompt:
            full_prompt = f"System Instruction: {system_prompt}\n\n{full_prompt}"

        last_error = None
        models_to_try = [self.model_name] + [m for m in self.CANDIDATE_MODELS if m != self.model_name]

        for model in models_to_try:
            try:
                response = await self._client.aio.models.generate_content(
                    model=model,
                    contents=full_prompt,
                )
                if response and response.text:
                    self.model_name = model
                    return response.text
            except Exception as e:
                last_error = e
                continue

        # Fallback on API call exception
        demo_res = await self.demo_fallback.generate(prompt, system_prompt, context)
        return f"{demo_res}\n\n*(Notice: Live Gemini API encountered error: {str(last_error)})*"

    async def stream(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> AsyncGenerator[str, None]:
        if not self.is_configured or not self._client:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk
            return

        try:
            full_prompt = prompt
            if context:
                full_prompt = f"Knowledge Context:\n{context}\n\nUser Question:\n{prompt}"
            if system_prompt:
                full_prompt = f"System Instruction: {system_prompt}\n\n{full_prompt}"

            response_stream = await self._client.aio.models.generate_content_stream(
                model=self.model_name,
                contents=full_prompt,
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk

    async def embed(self, text: str) -> List[float]:
        if not self.is_configured or not self._client:
            return await self.demo_fallback.embed(text)

        try:
            result = await self._client.aio.models.embed_content(
                model="text-embedding-004",
                contents=text,
            )
            return result.embedding.values
        except Exception:
            return await self.demo_fallback.embed(text)

    async def health_check(self) -> bool:
        return self.is_configured
