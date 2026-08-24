from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Optional, Dict, Any


class AIProvider(ABC):
    provider_id: str
    name: str
    model_name: str
    capabilities: List[str]
    is_configured: bool = False
    is_demo: bool = False

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> str:
        """Generate full text response synchronously/asynchronously."""
        pass

    @abstractmethod
    async def stream(self, prompt: str, system_prompt: Optional[str] = None, context: Optional[str] = None) -> AsyncGenerator[str, None]:
        """Stream chunks of response text."""
        pass

    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        """Generate embedding vector for input text."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check provider status and API key validity."""
        pass

    def get_status_info(self) -> Dict[str, Any]:
        return {
            "id": self.provider_id,
            "name": self.name,
            "model": self.model_name,
            "configured": self.is_configured,
            "status": "configured" if self.is_configured else ("demo" if self.is_demo else "unavailable"),
            "capabilities": self.capabilities,
            "description": f"{self.name} ({self.model_name}) Provider Integration"
        }
