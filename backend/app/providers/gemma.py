import asyncio
from typing import AsyncGenerator, List, Optional
from app.providers.base import AIProvider
from app.providers.demo import DemoProvider
from app.core.config import settings

class GemmaProvider(AIProvider):
    def __init__(self, model_name: str = "gemma-4-31b-it"):
        self.provider_id = "gemma"
        self.name = "Google Gemma"
        self.model_name = model_name
        self.capabilities = ["reasoning", "coding", "agentic", "writing"]
        
        # Runs via Gemini client backend if configured
        self.api_key = settings.GEMINI_API_KEY
        self.is_configured = bool(self.api_key and len(self.api_key.strip()) > 5)
        self.demo_fallback = DemoProvider("gemma", "Google Gemma", model_name)
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

        loop = asyncio.get_running_loop()
        try:
            # Query Gemma 2 27B / 9B model hosted on Gemini API Developer endpoint
            response = await loop.run_in_executor(
                None,
                lambda: self._client.models.generate_content(
                    model="gemma-2-27b-it",
                    contents=full_prompt,
                )
            )
            if response and response.text:
                return response.text
        except Exception as e:
            demo_res = await self.demo_fallback.generate(prompt, system_prompt, context)
            return f"{demo_res}\n\n*(Notice: Google Gemma model execution fallback due to API error: {str(e)})*"

        return await self.demo_fallback.generate(prompt, system_prompt, context)

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

            loop = asyncio.get_running_loop()
            response_stream = await loop.run_in_executor(
                None,
                lambda: self._client.models.generate_content_stream(
                    model="gemma-2-27b-it",
                    contents=full_prompt,
                )
            )
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk

    async def embed(self, text: str) -> List[float]:
        return await self.demo_fallback.embed(text)

    async def health_check(self) -> bool:
        return self.is_configured
