import pytest
from app.providers.registry import provider_registry
from app.providers.base import AIProvider
from app.providers.demo import DemoProvider


def test_provider_registry_initialization():
    providers = provider_registry.get_all_providers()
    assert "gemini" in providers
    assert "openai" in providers
    assert "anthropic" in providers
    assert "grok" in providers


@pytest.mark.asyncio
async def test_demo_provider_generation():
    demo = DemoProvider("test", "Test Provider", "test-model-v1")
    response = await demo.generate("Write a quick Python function")
    assert "def " in response or "Python" in response or "OmniAI" in response
    assert demo.is_demo is True


@pytest.mark.asyncio
async def test_provider_fallback_execution():
    provider = provider_registry.get_provider("unknown_id")
    assert provider is not None
    res = await provider.generate("Hello world")
    assert isinstance(res, str)
    assert len(res) > 0
