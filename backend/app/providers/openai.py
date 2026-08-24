import asyncio
from typing import AsyncGenerator, List, Optional
from app.providers.base import AIProvider
from app.providers.demo import DemoProvider
from app.core.config import settings


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.provider_id = "openai"
        self.name = "OpenAI"
        self.model_name = "gpt-4o"
        self.capabilities = ["general", "coding", "reasoning", "writing", "structured"]
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.is_configured = bool(self.api_key and len(self.api_key.strip()) > 5)
        self.demo_fallback = DemoProvider("openai", "OpenAI GPT", "gpt-4o")
        self._client = None

        if self.is_configured:
            try:
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=self.api_key)
            except Exception:
                pass

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> str:
        if not self.is_configured or not self._client:
            return await self.demo_fallback.generate(prompt, system_prompt, context)

        try:
            messages = []
            sys_content = system_prompt or "You are an intelligent AI assistant."
            if context:
                sys_content += f"\n\nRetrieved Knowledge Context:\n{context}"
            messages.append({"role": "system", "content": sys_content})
            messages.append({"role": "user", "content": prompt})

            response = await self._client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            demo_res = await self.demo_fallback.generate(prompt, system_prompt, context)
            return f"{demo_res}\n\n*(Notice: Live OpenAI API encountered error: {str(e)})*"

    async def stream(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> AsyncGenerator[str, None]:
        if not self.is_configured or not self._client:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk
            return

        try:
            messages = []
            sys_content = system_prompt or "You are an intelligent AI assistant."
            if context:
                sys_content += f"\n\nRetrieved Knowledge Context:\n{context}"
            messages.append({"role": "system", "content": sys_content})
            messages.append({"role": "user", "content": prompt})

            stream_resp = await self._client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                stream=True,
            )
            async for chunk in stream_resp:
                content = chunk.choices[0].delta.content if chunk.choices else ""
                if content:
                    yield content
        except Exception:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk

    async def embed(self, text: str) -> List[float]:
        if not self.is_configured or not self._client:
            return await self.demo_fallback.embed(text)

        try:
            resp = await self._client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return resp.data[0].embedding
        except Exception:
            return await self.demo_fallback.embed(text)

    async def health_check(self) -> bool:
        return self.is_configured
