"""
Module generator — sinh câu trả lời từ LLM dựa trên RAG context.

Cung cấp class ResponseGenerator sử dụng LangChain để quản lý
prompt template và gọi LLM.
"""

from src.schemas import ChatMessage, RetrievedChunk
from src.logger import get_logger

logger = get_logger(__name__)


class ResponseGenerator:
    """
    Sinh câu trả lời từ LLM dựa trên context và lịch sử chat.

    Quản lý LLM instance, system prompt, và prompt engineering.
    Kết hợp context từ retrieval với chat history để tạo
    multi-turn conversation.

    Attributes:
        _llm: LangChain ChatOpenAI instance.
        _system_prompt (str): System prompt đã build.
        _retriever (Retriever): Retriever để format context.

    Usage:
        generator = ResponseGenerator(retriever)
        answer = generator.generate(query, chunks, chat_history)
    """

    def __init__(self, retriever):
        """
        Khởi tạo ResponseGenerator.

        Load LLM với tham số từ config (model name, temperature, max_tokens).
        Build system prompt. Log tên model và cấu hình.

        Args:
            retriever (Retriever): Instance Retriever để format context.

        Raises:
            ValueError: Khi OPENAI_API_KEY chưa cấu hình.
                Log error cảnh báo.
        """
        pass

    def _init_llm(self):
        """
        Khởi tạo LLM instance từ LangChain.

        Sử dụng ChatOpenAI với LLM_MODEL_NAME, LLM_TEMPERATURE,
        LLM_MAX_TOKENS, LLM_API_KEY từ config.
        Log tên model, temperature, max_tokens.

        Returns:
            langchain_openai.ChatOpenAI: LLM instance.

        Raises:
            ValueError: Khi API key chưa cấu hình.
        """
        pass

    def _build_system_prompt(self) -> str:
        """
        Tạo system prompt cho chatbot tư vấn phim.

        Định nghĩa:
        - Vai trò: Chuyên gia tư vấn phim trên web MovieHub
        - Ngôn ngữ: Tiếng Việt, thân thiện, nhiệt tình
        - Quy tắc: Chỉ trả lời dựa trên context, thông báo nếu không tìm thấy
        - Format: Gợi ý phim kèm lý do, đánh giá, thông tin diễn viên

        Returns:
            str: System prompt string.
        """
        pass

    def build_messages(
        self,
        query: str,
        context: str,
        chat_history: list[ChatMessage] | None = None
    ) -> list[dict]:
        """
        Xây dựng danh sách messages cho LLM.

        Cấu trúc:
        1. System message: persona + quy tắc
        2. Chat history: N tin nhắn gần nhất (tối đa 10)
        3. User message: context + câu hỏi hiện tại

        Log debug: số messages history, độ dài context.

        Args:
            query (str): Câu hỏi hiện tại.
            context (str): Context string từ Retriever.format_context().
            chat_history (list[ChatMessage] | None): Lịch sử hội thoại.

        Returns:
            list[dict]: Messages format [{"role": "...", "content": "..."}, ...]
        """
        pass

    def generate(
        self,
        query: str,
        retrieved_chunks: list[RetrievedChunk],
        chat_history: list[ChatMessage] | None = None
    ) -> str:
        """
        Sinh câu trả lời từ LLM.

        Orchestrate:
        1. Retriever.format_context(chunks) → context string
        2. build_messages(query, context, history) → messages
        3. LLM.invoke(messages) → response
        4. Trích xuất text response

        Log: số chunks, số messages, thời gian LLM, độ dài response.

        Args:
            query (str): Câu hỏi người dùng.
            retrieved_chunks (list[RetrievedChunk]): Chunks đã rerank.
            chat_history (list[ChatMessage] | None): Lịch sử chat.

        Returns:
            str: Câu trả lời text từ LLM.

        Raises:
            Exception: Khi LLM API thất bại.
                Log error kèm query, số chunks, error chi tiết.
        """
        pass
