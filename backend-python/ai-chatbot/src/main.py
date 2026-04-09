"""
Entry point cho FastAPI application — AI Chatbot tư vấn phim MovieHub.

Khởi tạo FastAPI app, cấu hình logging, CORS, đăng ký API routers
(v1, v2), và khởi tạo RAGPipeline tại startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.logger import setup_logging, get_logger
from src.pipeline.rag_pipeline import RAGPipeline
from src.api.v1 import router as v1_router
from src.api.v2 import router as v2_router

# ── Khởi tạo logging trước tiên ─────────────────────────────
setup_logging()
logger = get_logger(__name__)

# ── Khởi tạo FastAPI app ────────────────────────────────────
app = FastAPI(
    title="MovieHub AI Chatbot",
    description="Chatbot tư vấn phim sử dụng RAG (Retrieval-Augmented Generation)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register API Versions ───────────────────────────────────
app.include_router(v1_router)
app.include_router(v2_router)


# ── Health Check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"service": "MovieHub AI Chatbot", "status": "active", "version": "1.0.0"}


# ── Startup / Shutdown Events ───────────────────────────────
@app.on_event("startup")
async def startup_event():
    """
    Khởi tạo RAGPipeline (composition root) khi server bắt đầu.

    Wire tất cả dependencies: MongoDB, ChromaDB, Embedding, Reranker, LLM.
    Log trạng thái khởi tạo từng thành phần.
    """
    pass


@app.on_event("shutdown")
async def shutdown_event():
    """
    Gọi RAGPipeline.shutdown() để đóng connections và cleanup.
    """
    pass
