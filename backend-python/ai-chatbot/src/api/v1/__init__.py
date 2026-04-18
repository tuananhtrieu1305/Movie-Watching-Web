"""
API v1 — Gom tất cả routers của phiên bản v1.

Import file này trong main.py để đăng ký toàn bộ endpoints v1
dưới prefix /api/v1.
"""

from fastapi import APIRouter
from src.api.v1.chat_router import router as chat_router
from src.api.v1.history_router import router as history_router
from src.api.v1.ingestion_router import router as ingestion_router

router = APIRouter(prefix="/api/v1")

router.include_router(chat_router)
router.include_router(history_router)
router.include_router(ingestion_router)
