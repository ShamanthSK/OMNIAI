from typing import Dict, List, Optional, Any
from app.providers.base import AIProvider
from app.providers.gemini import GeminiProvider
from app.providers.gemma import GemmaProvider
from app.providers.paligemma import PaliGemmaProvider
from app.providers.nvidia import NvidiaProvider
from app.providers.openai import OpenAIProvider
from app.providers.anthropic import AnthropicProvider
from app.providers.grok import GrokProvider
from app.providers.demo import DemoProvider


class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, AIProvider] = {}
        self._init_providers()

    def _init_providers(self):
        # Register Google & NVIDIA models
        self._providers["gemini"] = GeminiProvider()
        self._providers["gemma"] = GemmaProvider(model_name="gemma-4-31b-it")
        self._providers["paligemma"] = PaliGemmaProvider(model_name="paligemma")
        
        # NVIDIA Nemotron models
        self._providers["nemotron-llama"] = NvidiaProvider(model_name="llama-3.1-nemotron-70b")
        self._providers["nemotron-4"] = NvidiaProvider(model_name="nemotron-4-340b")

        # Register OpenAI, Anthropic, and Grok
        self._providers["openai"] = OpenAIProvider()
        self._providers["anthropic"] = AnthropicProvider()
        self._providers["grok"] = GrokProvider()

    def get_provider(self, provider_id: str) -> AIProvider:
        pid = provider_id.lower().strip()
        if pid in self._providers:
            return self._providers[pid]
        # Return fallback DemoProvider for unknown IDs
        return DemoProvider(target_provider_id=pid, target_name=pid.capitalize(), target_model="omni-v1")

    def get_all_providers(self) -> Dict[str, AIProvider]:
        return self._providers

    def get_configured_providers(self) -> Dict[str, AIProvider]:
        configured = {k: v for k, v in self._providers.items() if v.is_configured}
        if not configured:
            # If zero providers are configured with live API keys, return all registered as active
            return self._providers
        return configured

    def get_provider_status_list(self) -> List[Dict[str, Any]]:
        status_list = []
        for pid, provider in self._providers.items():
            status_list.append(provider.get_status_info())
        return status_list


# Singleton registry instance
provider_registry = ProviderRegistry()
