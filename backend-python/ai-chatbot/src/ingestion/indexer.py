"""
Module indexer — orchestrate toàn bộ pipeline ingestion.

Cung cấp class DataIndexer kết nối DataLoader → DocumentChunker
→ VectorStoreManager + HybridSearchEngine.
"""

from src.logger import get_logger

logger = get_logger(__name__)


class DataIndexer:
    """
    Orchestrator cho pipeline nạp dữ liệu phim vào hệ thống RAG.

    Kết nối các thành phần: DataLoader, DocumentChunker, VectorStoreManager,
    HybridSearchEngine thành một pipeline thống nhất.

    Attributes:
        _data_loader (DataLoader): Trích xuất dữ liệu từ MySQL.
        _chunker (DocumentChunker): Chia nhỏ documents.
        _vector_store (VectorStoreManager): Quản lý ChromaDB.
        _search_engine (HybridSearchEngine): Khởi tạo BM25 index.

    Usage:
        indexer = DataIndexer(data_loader, chunker, vector_store, search_engine)
        stats = indexer.run(force_reload=True)
    """

    def __init__(self, data_loader, chunker, vector_store, search_engine):
        """
        Khởi tạo DataIndexer với các dependencies đã inject.

        Args:
            data_loader (DataLoader): Instance DataLoader.
            chunker (DocumentChunker): Instance DocumentChunker.
            vector_store (VectorStoreManager): Instance VectorStoreManager.
            search_engine (HybridSearchEngine): Instance HybridSearchEngine.
        """
        pass

    def run(self, force_reload: bool = False) -> dict:
        """
        Chạy toàn bộ pipeline ingestion.

        Quy trình:
        1. Log bắt đầu ingestion, ghi nhận force_reload flag
        2. Nếu force_reload=True → xóa ChromaDB collection cũ (log warning)
        3. DataLoader.load_all() → log số documents
        4. DocumentChunker.chunk_all() → log số chunks
        5. VectorStoreManager.add_documents() → log tiến trình embedding
        6. HybridSearchEngine.init_bm25() → log BM25 index size
        7. Log hoàn thành kèm elapsed time

        Mỗi bước đều log thời gian. Nếu thất bại → log error + traceback.

        Args:
            force_reload (bool): True = xóa dữ liệu cũ, ingest lại. Mặc định False.

        Returns:
            dict:
                - total_documents (int): Số MovieDocument đã load
                - total_chunks (int): Tổng chunks sau khi split
                - elapsed_time (float): Thời gian (giây)
                - status (str): "success" | "error"
                - message (str): Thông báo chi tiết

        Raises:
            Exception: Khi bất kỳ bước nào thất bại.
        """
        pass
