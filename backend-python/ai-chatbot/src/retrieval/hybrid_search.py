"""
Module hybrid search — kết hợp Semantic Search + BM25 Keyword Search.

Cung cấp class HybridSearchEngine quản lý cả hai phương pháp search
và kết hợp kết quả bằng Reciprocal Rank Fusion (RRF).
"""

from typing import Optional
from langchain.schema import Document
from src.schemas import RetrievedChunk
from src.logger import get_logger

logger = get_logger(__name__)


class HybridSearchEngine:
    """
    Engine tìm kiếm kết hợp Semantic (dense) + BM25 (sparse).

    Quản lý cả ChromaDB vector search và BM25 keyword search,
    cung cấp phương thức hybrid_search() để kết hợp kết quả.

    Attributes:
        _vector_store (VectorStoreManager): Quản lý ChromaDB cho semantic search.
        _bm25_retriever: LangChain BM25Retriever instance (khởi tạo sau ingest).
        _is_bm25_ready (bool): BM25 retriever đã sẵn sàng chưa.

    Usage:
        engine = HybridSearchEngine(vector_store)
        engine.init_bm25(documents)
        results = engine.search("phim hành động hay", top_k=10, alpha=0.5)
    """

    def __init__(self, vector_store):
        """
        Khởi tạo HybridSearchEngine.

        Args:
            vector_store (VectorStoreManager): Instance VectorStoreManager
                đã được initialize().
        """
        pass

    def init_bm25(self, documents: list[Document]) -> None:
        """
        Khởi tạo BM25 retriever với danh sách documents.

        Cần gọi sau khi ingest hoặc khi server khởi động.
        Log số documents dùng để build index.

        Args:
            documents (list[Document]): Toàn bộ Documents đã chunk.
        """
        pass

    def semantic_search(self, query: str, top_k: int = 10) -> list[Document]:
        """
        Semantic search trong ChromaDB.

        Tạo embedding cho query, tìm chunks có cosine similarity cao nhất.
        Log query và số kết quả.

        Args:
            query (str): Câu truy vấn.
            top_k (int): Số kết quả tối đa. Mặc định 10.

        Returns:
            list[Document]: Documents sắp xếp theo relevance giảm dần.

        Raises:
            Exception: Khi search thất bại. Log error kèm query.
        """
        pass

    def keyword_search(self, query: str, top_k: int = 10) -> list[Document]:
        """
        BM25 keyword search.

        Log query và số kết quả.

        Args:
            query (str): Câu truy vấn.
            top_k (int): Số kết quả tối đa. Mặc định 10.

        Returns:
            list[Document]: Documents sắp xếp theo BM25 score giảm dần.

        Raises:
            RuntimeError: Khi BM25 chưa khởi tạo (chưa gọi init_bm25).
                Log error cảnh báo.
        """
        pass

    def search(
        self,
        query: str,
        top_k: int = 10,
        alpha: float = 0.5
    ) -> list[RetrievedChunk]:
        """
        Hybrid search kết hợp semantic + keyword.

        Quy trình:
        1. Chạy semantic_search() và keyword_search()
        2. Chuẩn hóa score về [0, 1]
        3. Kết hợp: final_score = alpha * semantic + (1 - alpha) * keyword
        4. Loại bỏ duplicate (production_id + chunk_index)
        5. Sắp xếp theo final_score giảm dần

        Log: query, alpha, kết quả từ mỗi phương pháp, kết quả cuối.

        Args:
            query (str): Câu truy vấn.
            top_k (int): Số kết quả tối đa. Mặc định 10.
            alpha (float): Trọng số semantic [0, 1]. Mặc định 0.5.

        Returns:
            list[RetrievedChunk]: Kết quả đã fuse.
        """
        pass

    def reciprocal_rank_fusion(
        self,
        results_list: list[list[Document]],
        k: int = 60,
        top_k: int = 10
    ) -> list[RetrievedChunk]:
        """
        Kết hợp kết quả bằng Reciprocal Rank Fusion.

        RRF score = sum(1 / (k + rank_i)) cho mỗi document.
        Log số nguồn đầu vào và số kết quả đầu ra.

        Args:
            results_list (list[list[Document]]): Kết quả từ nhiều nguồn.
            k (int): Tham số smoothing. Mặc định 60.
            top_k (int): Số kết quả tối đa. Mặc định 10.

        Returns:
            list[RetrievedChunk]: Kết quả đã fuse, sắp xếp theo RRF score.
        """
        pass
