"""
Module cấu hình cho hệ thống RAG Chatbot tư vấn phim.

Chứa tất cả các biến môi trường, cấu hình model, database,
và các tham số chunking/retrieval cho toàn bộ hệ thống.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# LLM Configuration
# ============================================================
LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "gemini-3-flash")
LLM_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.4"))
LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "1024"))

# ============================================================
# LLM Configuration
# ============================================================
HF_TOKEN = os.getenv("HF_TOKEN", "")

# ============================================================
# Embedding Configuration
# ============================================================
EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-m3")
EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "1536"))

# ============================================================
# Reranker Configuration
# ============================================================
RERANKER_MODEL_NAME: str = os.getenv("RERANKER_MODEL_NAME", "BAAI/bge-reranker-v2-m3")
RERANKER_TOP_K: int = int(os.getenv("RERANKER_TOP_K", "8"))

# ============================================================
# ChromaDB Configuration + BM25
# ============================================================
CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "movie_collection")
BM25_INDEX_PATH = os.getenv("BM25_INDEX_PATH", "../data/bm25_index.pkl")

# ============================================================
# MongoDB Configuration (Chat History)
# ============================================================
MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "movie_chatbot_db")
MONGODB_COLLECTION_HISTORY: str = os.getenv("MONGODB_COLLECTION_HISTORY", "chat_history")

# ============================================================
# MySQL Configuration (Source Data)
# ============================================================
MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "movie_streaming_db")

# ============================================================
# Chunking Configuration
# ============================================================
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1024"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))

# ============================================================
# Retrieval Configuration
# ============================================================
RETRIEVAL_TOP_K: int = int(os.getenv("RETRIEVAL_TOP_K", "10"))
HYBRID_SEARCH_ALPHA: float = float(os.getenv("HYBRID_SEARCH_ALPHA", "0.5"))

# ============================================================
# API Configuration
# ============================================================
API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
API_PORT: int = int(os.getenv("API_PORT", "8002"))

# ============================================================
# Chat Runtime Timeouts (seconds)
# ============================================================
# Prevent requests from hanging indefinitely when external services are slow.
CHAT_RETRIEVAL_TIMEOUT_SECONDS: float = float(
	os.getenv("CHAT_RETRIEVAL_TIMEOUT_SECONDS", "200")
)
CHAT_LLM_TIMEOUT_SECONDS: float = float(
	os.getenv("CHAT_LLM_TIMEOUT_SECONDS", "600")
)
