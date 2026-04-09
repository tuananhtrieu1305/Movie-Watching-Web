"""
API v1 — History endpoints cho quản lý lịch sử hội thoại.

Sử dụng RAGPipeline.get_instance() để truy cập ChatHistoryRepository.
"""

from fastapi import APIRouter, HTTPException
from src.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/history", tags=["v1 - History"])


@router.get("/{user_id}")
async def get_user_history(user_id: str, limit: int = 10):
    """
    Lấy danh sách cuộc hội thoại của người dùng.

    Log: user_id, limit, số conversations trả về.

    Args:
        user_id (str): ID người dùng (path parameter).
        limit (int): Tối đa conversations (query param). Mặc định 10.

    Returns:
        list[dict]: conversation_id, created_at, updated_at,
            message_count, last_message.

    Raises:
        HTTPException 500: Khi truy vấn thất bại. Log error.
    """
    pass


@router.get("/{user_id}/{conversation_id}")
async def get_conversation_detail(user_id: str, conversation_id: str):
    """
    Lấy chi tiết cuộc hội thoại.

    Log: user_id, conversation_id, số messages.

    Args:
        user_id (str): ID người dùng (xác thực quyền).
        conversation_id (str): ID cuộc hội thoại.

    Returns:
        ConversationHistory: Toàn bộ thông tin cuộc hội thoại.

    Raises:
        HTTPException 404: Conversation không tồn tại.
        HTTPException 403: Không có quyền. Log warning.
    """
    pass


@router.delete("/{user_id}/{conversation_id}")
async def delete_conversation(user_id: str, conversation_id: str):
    """
    Xóa cuộc hội thoại.

    Log: user_id, conversation_id, kết quả.

    Args:
        user_id (str): ID người dùng.
        conversation_id (str): ID cuộc hội thoại.

    Returns:
        dict: {"status": "success", "message": "..."}

    Raises:
        HTTPException 404: Không tìm thấy hoặc không có quyền.
    """
    pass
