"""
Module embedding — tạo embedding vectors từ text.

Cung cấp class EmbeddingService để khởi tạo embedding model
và tạo vectors cho documents hoặc query.
"""

from langchain.schema import Document
from src.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """
    Service tạo embedding vectors sử dụng LangChain embedding models.

    Hỗ trợ OpenAI Embeddings và HuggingFace Embeddings.
    Xử lý batch embedding cho documents và single embedding cho query.

    Attributes:
        _model: LangChain embedding model instance.
        _model_name (str): Tên model đang sử dụng.

    Usage:
        service = EmbeddingService()
        vectors = service.embed_documents(documents)
        query_vector = service.embed_query("phim hành động hay")
    """

    def __init__(self):
        """
        Khởi tạo EmbeddingService và load embedding model.

        Sử dụng EMBEDDING_MODEL_NAME và OPENAI_API_KEY từ config.
        Log tên model đang sử dụng.

        Raises:
            ValueError: Khi API key không được cấu hình.
                Log error cảnh báo thiếu API key.
        """
        pass

    def get_model(self):
        """
        Trả về embedding model instance.

        Returns:
            langchain_openai.OpenAIEmbeddings | HuggingFaceEmbeddings:
                Embedding model sẵn sàng sử dụng.
        """
        pass

    def embed_documents(self, documents: list[Document]) -> list[list[float]]:
        """
        Tạo embedding vectors cho danh sách Documents.

        Trích xuất page_content và gửi đến model theo batch.
        Log tiến trình: tổng documents, batch hiện tại.

        Args:
            documents (list[Document]): Documents cần embed.

        Returns:
            list[list[float]]: Embedding vectors tương ứng 1-1.

        Raises:
            Exception: Khi API call thất bại.
                Log error kèm batch index gây lỗi.
        """
        pass

    def embed_query(self, query: str) -> list[float]:
        """
        Tạo embedding vector cho một câu query.

        Args:
            query (str): Câu query cần embed.

        Returns:
            list[float]: Embedding vector.

        Raises:
            Exception: Khi API call thất bại. Log error kèm query.
        """
        pass
