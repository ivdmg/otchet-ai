from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, payments, websockets, documents

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(websockets.router, tags=["WebSockets"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
