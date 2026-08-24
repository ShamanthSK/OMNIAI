from typing import Dict, Any, List, Tuple
from app.providers.registry import provider_registry
from app.providers.base import AIProvider


class AgentRouter:
    """Intelligently routes requests to the optimal AI model or model cluster."""

    # Preference mapping based on task classification for Google & NVIDIA models
    CATEGORY_PREFERENCES = {
        "coding": ["gemini", "gemma", "nemotron-4", "nemotron-llama"],
        "reasoning": ["gemini", "gemma", "nemotron-llama", "nemotron-4"],
        "writing": ["gemma", "gemini", "nemotron-llama"],
        "research": ["gemini", "gemma", "nemotron-4"],
        "data_analysis": ["gemini", "nemotron-4", "gemma"],
        "document_qa": ["gemini", "gemma", "paligemma"],
        "summarization": ["gemma", "gemini", "nemotron-llama"],
        "general": ["gemini", "gemma", "nemotron-llama", "nemotron-4"]
    }

    @classmethod
    def route(cls, mode: str, category: str, requested_model: str = None) -> Tuple[List[AIProvider], str]:
        """
        Returns (list of AIProvider instances to execute, user-facing explanation string).
        """
        all_providers = provider_registry.get_all_providers()
        configured_providers = provider_registry.get_configured_providers()

        if mode == "single":
            target_key = (requested_model or "gemini").lower()
            # Map any legacy model identifiers
            if target_key in ["openai", "anthropic", "grok"]:
                target_key = "gemini"
            provider = provider_registry.get_provider(target_key)
            explanation = f"Manual override: Executing single request with {provider.name} ({provider.model_name})."
            return [provider], explanation

        elif mode == "compare":
            providers_to_compare = list(configured_providers.values())
            if len(providers_to_compare) < 3:
                providers_to_compare = list(all_providers.values())[:3]
            explanation = f"OmniAI active multi-model compare: Parallel querying {len(providers_to_compare)} AI models."
            return providers_to_compare, explanation

        else:  # AUTO mode
            preferred_order = cls.CATEGORY_PREFERENCES.get(category, ["gemini", "gemma", "nemotron-llama"])
            
            selected_provider = None
            for p_id in preferred_order:
                if p_id in configured_providers:
                    selected_provider = configured_providers[p_id]
                    break

            if not selected_provider:
                selected_provider = provider_registry.get_provider("gemini")

            explanation = f"OmniAI Auto Routing selected {selected_provider.name} for {category.replace('_', ' ')} tasks."
            return [selected_provider], explanation
