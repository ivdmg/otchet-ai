from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Health Check")
async def health_check():
    return {
        "status": "ok",
        "app": "AI GostDoc",
        "version": settings.VERSION
    }
