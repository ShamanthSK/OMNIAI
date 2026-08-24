from typing import List
from fastapi import APIRouter
from app.models.schemas import ProviderStatusSchema
from app.providers.registry import provider_registry

router = APIRouter(prefix="/providers", tags=["Providers"])


@router.get("/status", response_model=List[ProviderStatusSchema])
async def get_providers_status():
    return provider_registry.get_provider_status_list()
