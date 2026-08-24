from fastapi import APIRouter
from app.core.config import settings
from app.providers.registry import provider_registry

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    providers_status = provider_registry.get_provider_status_list()
    configured_count = sum(1 for p in providers_status if p["configured"])
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "total_providers": len(providers_status),
        "configured_providers": configured_count,
        "providers": providers_status
    }
