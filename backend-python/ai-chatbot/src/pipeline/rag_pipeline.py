"""
Module RAG Pipeline — khởi tạo và kết nối tất cả các thành phần.

Cung cấp class RAGPipeline đóng vai trò Composition Root (DI container),
khởi tạo tất cả dependencies và cung cấp access tập trung cho routers.

Đây là file quan trọng nhất trong hệ thống — nơi duy nhất thực hiện
dependency injection và wiring giữa các class.
"""

from src.logger import get_logger

logger = get_logger(__name__)


class RAGPipeline:
    """
    Composition Root — khởi tạo và kết nối tất cả thành phần RAG.

    Class này đóng vai trò DI container, tạo và inject dependencies
    cho toàn bộ hệ thống. Cung cấp facade methods cho routers sử dụng.

    Thứ tự khởi tạo:
    1. Database layer: MongoDBClient, VectorStoreManager
    2. Core services: EmbeddingService, DocumentChunker
    3. Search layer: HybridSearchEngine, Reranker
    4. Orchestrators: Retriever, ResponseGenerator
    5. Business services: ChatHistoryRepository, ChatService, DataIndexer

    Attributes:
        mongo_client (MongoDBClient): MongoDB connection.
        vector_store (VectorStoreManager): ChromaDB manager.
        embedding_service (EmbeddingService): Embedding model.
        chunker (DocumentChunker): Text splitter.
        search_engine (HybridSearchEngine): Hybrid search.
        reranker (Reranker): Cross-encoder reranker.
        retriever (Retriever): Retrieval orchestrator.
        generator (ResponseGenerator): LLM response generator.
        history_repo (ChatHistoryRepository): Chat history CRUD.
        chat_service (ChatService): Chat RAG pipeline.
        data_indexer (DataIndexer): Ingestion pipeline.

    Usage:
        pipeline = RAGPipeline()
        pipeline.initialize()

        # Trong routers:
        response = pipeline.chat_service.process(request)
        stats = pipeline.data_indexer.run(force_reload=True)
    """

    _instance = None

    def __new__(cls):
        """
        Singleton pattern — đảm bảo chỉ có một RAGPipeline trong app.

        Returns:
            RAGPipeline: Singleton instance.
        """
        pass

    @classmethod
    def get_instance(cls) -> "RAGPipeline":
        """
        Lấy singleton instance đã khởi tạo.

        Returns:
            RAGPipeline: Singleton instance.

        Raises:
            RuntimeError: Khi chưa gọi initialize().
        """
        pass

    def initialize(self) -> None:
        """
        Khởi tạo tất cả thành phần theo thứ tự dependency.

        Quy trình:
        1. MongoDBClient — kết nối MongoDB (log connection status)
        2. VectorStoreManager — kết nối ChromaDB (log collection info)
        3. EmbeddingService — load embedding model (log model name)
        4. DocumentChunker — cấu hình text splitter (log chunk config)
        5. HybridSearchEngine(vector_store) — khởi tạo search (log status)
        6. Reranker — load cross-encoder model (log model name, load time)
        7. DataLoader — chuẩn bị MySQL loader (log connection info)
        8. Retriever(search_engine, reranker) — wire retrieval pipeline
        9. ResponseGenerator(retriever) — wire generation pipeline
        10. ChatHistoryRepository(mongo_client) — wire history repository
        11. ChatService(retriever, generator, history_repo) — wire chat service
        12. DataIndexer(data_loader, chunker, vector_store, search_engine)

        Log: tổng thời gian khởi tạo, trạng thái từng thành phần.

        Raises:
            Exception: Khi bất kỳ thành phần nào thất bại.
                Log error kèm tên thành phần gây lỗi và traceback.
        """
        pass

    def shutdown(self) -> None:
        """
        Giải phóng tài nguyên khi server tắt.

        Đóng kết nối MongoDB, cleanup resources.
        Log thông tin shutdown.
        """
        pass
