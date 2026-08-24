import asyncio
from typing import AsyncGenerator, List, Optional
from app.providers.base import AIProvider
from app.providers.demo import DemoProvider
from app.core.config import settings


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.provider_id = "anthropic"
        self.name = "Anthropic Claude"
        self.model_name = "claude-3-5-sonnet-20241022"
        self.capabilities = ["general", "coding", "writing", "reasoning", "analysis"]
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.is_configured = bool(self.api_key and len(self.api_key.strip()) > 5)
        self.demo_fallback = DemoProvider("anthropic", "Anthropic Claude", "claude-3-5-sonnet")
        self._client = None

        if self.is_configured:
            try:
                from anthropic import AsyncAnthropic
                self._client = AsyncAnthropic(api_key=self.api_key)
            except Exception:
                pass

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> str:
        if not self.is_configured or not self._client:
            return await self.demo_fallback.generate(prompt, system_prompt, context)

        try:
            sys_text = system_prompt or "You are an intelligent AI assistant."
            if context:
                sys_text += f"\n\nRetrieved Knowledge Context:\n{context}"

            response = await self._client.messages.create(
                model=self.model_name,
                max_tokens=4096,
                system=sys_text,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.content[0].text
        except Exception as e:
            demo_res = await self.demo_fallback.generate(prompt, system_prompt, context)
            return f"{demo_res}\n\n*(Notice: Live Anthropic API encountered error: {str(e)})*"

    async def stream(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> AsyncGenerator[str, None]:
        if not self.is_configured or not self._client:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk
            return

        try:
            sys_text = system_prompt or "You are an intelligent AI assistant."
            if context:
                sys_text += f"\n\nRetrieved Knowledge Context:\n{context}"

            async with self._client.messages.stream(
                model=self.model_name,
                max_tokens=4096,
                system=sys_text,
                messages=[{"role": "user", "content": prompt}],
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception:
            async for chunk in self.demo_fallback.stream(prompt, system_prompt, context):
                yield chunk

    async def embed(self, text: str) -> List[float]:
        return await self.demo_fallback.embed(text)

    async def health_check(self) -> bool:
        return self.is_configured
