"""
Module history repository — CRUD operations cho lịch sử chat trên MongoDB.

Cung cấp class ChatHistoryRepository tách riêng data access logic
khỏi API router.
"""

from typing import Optional
from src.schemas import ChatMessage, ConversationHistory
from src.logger import get_logger

logger = get_logger(__name__)


class ChatHistoryRepository:
    """
    Repository pattern cho CRUD lịch sử hội thoại trên MongoDB.

    Tách biệt data access logic khỏi business logic và API layer.
    Sử dụng MongoDBClient để lấy collection.

    Attributes:
        _mongo_client (MongoDBClient): MongoDB client instance.
        _collection: MongoDB collection cho chat history.

    Usage:
        repo = ChatHistoryRepository(mongo_client)
        conv_id = repo.create_conversation("user1")
        repo.add_message(conv_id, message)
        history = repo.get_conversation(conv_id)
    """

    def __init__(self, mongo_client):
        """
        Khởi tạo ChatHistoryRepository.

        Args:
            mongo_client (MongoDBClient): Instance MongoDBClient đã connect().
        """
        pass

    def create_conversation(self, user_id: str) -> str:
        """
        Tạo cuộc hội thoại mới.

        Sinh conversation_id (UUID v4), tạo document trong MongoDB.
        Log: user_id, conversation_id mới.

        Args:
            user_id (str): ID người dùng.

        Returns:
            str: conversation_id (UUID v4).

        Raises:
            Exception: Khi insert thất bại. Log error kèm user_id.
        """
        pass

    def add_message(self, conversation_id: str, message: ChatMessage) -> None:
        """
        Thêm tin nhắn vào cuộc hội thoại.

        Sử dụng $push + cập nhật updated_at.
        Log debug: conversation_id, role, content length.

        Args:
            conversation_id (str): ID cuộc hội thoại.
            message (ChatMessage): Tin nhắn cần thêm.

        Raises:
            ValueError: Khi conversation_id không tồn tại.
                Log error kèm conversation_id.
        """
        pass

    def get_conversation(self, conversation_id: str) -> Optional[ConversationHistory]:
        """
        Lấy chi tiết cuộc hội thoại.

        Log debug: conversation_id, found/not found, số messages.

        Args:
            conversation_id (str): ID cuộc hội thoại.

        Returns:
            Optional[ConversationHistory]: ConversationHistory hoặc None.
        """
        pass

    def get_recent_messages(
        self,
        conversation_id: str,
        limit: int = 10
    ) -> list[ChatMessage]:
        """
        Lấy N tin nhắn gần nhất.

        Sử dụng MongoDB $slice để tối ưu.
        Log debug: conversation_id, limit, số messages thực tế.

        Args:
            conversation_id (str): ID cuộc hội thoại.
            limit (int): Số tin nhắn gần nhất. Mặc định 10.

        Returns:
            list[ChatMessage]: Tin nhắn (cũ → mới). Rỗng nếu không tìm thấy.
        """
        pass

    def get_user_conversations(self, user_id: str, limit: int = 10) -> list[dict]:
        """
        Lấy danh sách cuộc hội thoại của user.

        Sắp xếp theo updated_at giảm dần.
        Log: user_id, số conversations.

        Args:
            user_id (str): ID người dùng.
            limit (int): Tối đa conversations. Mặc định 10.

        Returns:
            list[dict]: conversation_id, created_at, updated_at,
                message_count, last_message (truncated 100 chars).
        """
        pass

    def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """
        Xóa cuộc hội thoại (kiểm tra quyền sở hữu).

        Log: conversation_id, user_id, kết quả.
        Log warning nếu user_id không khớp.

        Args:
            conversation_id (str): ID cuộc hội thoại.
            user_id (str): ID người dùng (xác thực quyền).

        Returns:
            bool: True nếu xóa thành công.
        """
        pass
