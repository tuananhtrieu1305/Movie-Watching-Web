"""
API v1 — Chat endpoint cho chatbot tư vấn phim.

Sử dụng RAGPipeline.get_instance() để truy cập ChatService.
"""

from fastapi import APIRouter, HTTPException
from src.schemas import ChatRequest, ChatResponse
from src.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/chat", tags=["v1 - Chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint chính để chat với chatbot tư vấn phim.

    Nhận tin nhắn, xử lý qua RAG pipeline, trả về câu trả lời.
    Log: user_id, conversation_id, query (truncated), thời gian.

    Args:
        request (ChatRequest): user_id, message, conversation_id (optional).

    Returns:
        ChatResponse: answer + sources.

    Raises:
        HTTPException 500: Khi pipeline thất bại. Log error + traceback.
    """
    pass
