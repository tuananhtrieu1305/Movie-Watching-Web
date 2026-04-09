"""
API v1 — Ingestion endpoints cho nạp dữ liệu phim.

Sử dụng RAGPipeline.get_instance() để truy cập DataIndexer.
"""

from fastapi import APIRouter, HTTPException
from src.schemas import IngestRequest
from src.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/ingest", tags=["v1 - Ingestion"])


@router.post("")
async def ingest_data(request: IngestRequest):
    """
    Kích hoạt quá trình ingest dữ liệu phim từ MySQL vào ChromaDB.

    Gọi RAGPipeline.data_indexer.run() để thực thi pipeline.
    Log: bắt đầu ingest, force_reload flag, kết quả.

    Args:
        request (IngestRequest): Body chứa force_reload flag.

    Returns:
        dict: Thống kê (total_documents, total_chunks, elapsed_time, status).

    Raises:
        HTTPException 500: Khi ingest thất bại. Log error + traceback.
    """
    pass


@router.get("/stats")
async def get_stats():
    """
    Lấy thống kê ChromaDB collection.

    Returns:
        dict: chroma_stats, status.

    Raises:
        HTTPException 500: Khi không thể lấy thống kê.
    """
    pass
