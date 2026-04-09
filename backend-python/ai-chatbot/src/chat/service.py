"""
Module chat service — orchestrate RAG pipeline cho một request chat.

Cung cấp class ChatService kết nối: history → retrieval → generation → history.
"""

from src.schemas import ChatRequest, ChatResponse
from src.logger import get_logger

logger = get_logger(__name__)


class ChatService:
    """
    Service xử lý chat qua RAG pipeline.

    Orchestrate toàn bộ luồng xử lý một request chat:
    quản lý conversation → lưu tin nhắn → truy xuất context
    → rerank → sinh câu trả lời → lưu response.

    Attributes:
        _retriever (Retriever): Orchestrator truy xuất context.
        _generator (ResponseGenerator): Sinh câu trả lời LLM.
        _history_repo (ChatHistoryRepository): CRUD lịch sử chat.

    Usage:
        service = ChatService(retriever, generator, history_repo)
        response = service.process(chat_request)
    """

    def __init__(self, retriever, generator, history_repo):
        """
        Khởi tạo ChatService với dependencies đã inject.

        Args:
            retriever (Retriever): Instance Retriever.
            generator (ResponseGenerator): Instance ResponseGenerator.
            history_repo (ChatHistoryRepository): Instance ChatHistoryRepository.
        """
        pass

    def process(self, request: ChatRequest) -> ChatResponse:
        """
        Xử lý một request chat qua toàn bộ RAG pipeline.

        Quy trình:
        1. Xác định conversation — tạo mới hoặc lấy cũ (log conversation_id)
        2. Lưu tin nhắn user vào MongoDB (log message length)
        3. Lấy lịch sử chat gần nhất (log số messages)
        4. Retriever.retrieve(query) → chunks (log số chunks, thời gian)
        5. ResponseGenerator.generate(query, chunks, history) → answer
           (log thời gian LLM)
        6. Lưu tin nhắn assistant vào MongoDB (log response length)
        7. Trả về ChatResponse (log tổng thời gian pipeline)

        Nếu thất bại → log error kèm: bước thất bại, user_id,
        conversation_id, query (truncated 100 chars), traceback.

        Args:
            request (ChatRequest): user_id, message, conversation_id (optional).

        Returns:
            ChatResponse: conversation_id, answer, sources.

        Raises:
            Exception: Khi pipeline thất bại ở bất kỳ bước nào.
        """
        pass
