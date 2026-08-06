from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, payments

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health Check"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
