# 🎬 Backend Python — MovieHub

Backend Python cho hệ thống MovieHub, bao gồm hai service:

| Service | Port | Mô tả |
|---------|------|-------|
| **AI Chatbot** | `8002` | Chatbot tư vấn phim sử dụng RAG |
| **Video Processor** | `8001` | Xử lý video (encoding, thumbnail, ...) |

---

## 📁 Cấu trúc thư mục

```
backend-python/
├── README.md
│
├── ai-chatbot/
│   ├── Dockerfile
│   ├── .env.example
│   ├── requirements.txt
│   │
│   └── src/
│       ├── __init__.py
│       ├── main.py                    # FastAPI entry point
│       ├── config.py                  # Cấu hình tập trung (env vars)
│       ├── schemas.py                 # Pydantic models
│       ├── logger.py                  # Logging tập trung (console)
│       │
│       ├── api/                       # 🌐 API Layer (tập trung, phân phiên bản)
│       │   ├── __init__.py
│       │   ├── v1/                    #   Phiên bản 1
│       │   │   ├── __init__.py        #     Gom tất cả v1 routers
│       │   │   ├── chat_router.py     #     POST /api/v1/chat
│       │   │   ├── history_router.py  #     GET/DELETE /api/v1/history
│       │   │   └── ingestion_router.py#     POST /api/v1/ingest
│       │   └── v2/                    #   Phiên bản 2 (placeholder)
│       │       └── __init__.py        #     Sẵn sàng mở rộng
│       │
│       ├── pipeline/                  # 🔗 Composition Root (DI Container)
│       │   ├── __init__.py
│       │   └── rag_pipeline.py        #   Class RAGPipeline
│       │
│       ├── chat/                      # 💬 Nghiệp vụ: Xử lý chat
│       │   ├── __init__.py
│       │   └── service.py             #   Class ChatService
│       │
│       ├── ingestion/                 # 📦 Nghiệp vụ: Nạp dữ liệu phim
│       │   ├── __init__.py
│       │   ├── data_loader.py         #   Class DataLoader
│       │   ├── chunking.py            #   Class DocumentChunker
│       │   └── indexer.py             #   Class DataIndexer
│       │
│       ├── retrieval/                 # 🔍 Nghiệp vụ: Tìm kiếm & truy xuất
│       │   ├── __init__.py
│       │   ├── embedding.py           #   Class EmbeddingService
│       │   ├── hybrid_search.py       #   Class HybridSearchEngine
│       │   ├── reranker.py            #   Class Reranker
│       │   └── retriever.py           #   Class Retriever
│       │
│       ├── generation/                # 🤖 Nghiệp vụ: Sinh câu trả lời
│       │   ├── __init__.py
│       │   └── generator.py           #   Class ResponseGenerator
│       │
│       ├── history/                   # 📜 Nghiệp vụ: Lịch sử hội thoại
│       │   ├── __init__.py
│       │   └── repository.py          #   Class ChatHistoryRepository
│       │
│       └── database/                  # 🗄️ Hạ tầng: Kết nối database
│           ├── __init__.py
│           ├── vector_store.py        #   Class VectorStoreManager
│           └── mongodb.py             #   Class MongoDBClient
│
└── video-processor/
    ├── Dockerfile
    ├── requirements.txt
    └── src/
        ├── main.py
        ├── chatbot/
        │   └── Test.py
        └── recommender/
            └── Test.py
```

---

## 🌐 API Versioning

API được tổ chức theo phiên bản trong `src/api/`:

```python
# src/api/v1/__init__.py — gom tất cả v1 routers
router = APIRouter(prefix="/api/v1")
router.include_router(chat_router)       # /api/v1/chat
router.include_router(history_router)    # /api/v1/history
router.include_router(ingestion_router)  # /api/v1/ingest

# main.py — chỉ cần 2 dòng
app.include_router(v1_router)
app.include_router(v2_router)
```

Khi cần thêm phiên bản mới (v2), tạo routers trong `src/api/v2/` mà **không ảnh hưởng** đến v1.

### v1 Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Health check |
| `POST` | `/api/v1/chat` | Gửi tin nhắn chat |
| `POST` | `/api/v1/ingest` | Nạp dữ liệu phim |
| `GET` | `/api/v1/ingest/stats` | Thống kê vector store |
| `GET` | `/api/v1/history/{user_id}` | Danh sách hội thoại |
| `GET` | `/api/v1/history/{user_id}/{id}` | Chi tiết hội thoại |
| `DELETE` | `/api/v1/history/{user_id}/{id}` | Xóa hội thoại |
| `GET` | `/docs` | Swagger UI |

### v2 Endpoints (placeholder)

Chưa có — sẵn sàng mở rộng khi cần streaming, multi-modal, etc.

---

## 🏗️ Kiến trúc OOP & Dependency Injection

```
RAGPipeline (Singleton — Composition Root)
│
├── MongoDBClient (Singleton)
│     └── ChatHistoryRepository
├── VectorStoreManager
│     └── HybridSearchEngine
├── EmbeddingService
├── DocumentChunker
├── Reranker
├── Retriever ← (HybridSearchEngine, Reranker)
├── ResponseGenerator ← (Retriever)
├── ChatService ← (Retriever, ResponseGenerator, ChatHistoryRepository)
└── DataIndexer ← (DataLoader, DocumentChunker, VectorStoreManager, HybridSearchEngine)
```

**Ingestion flow:**
```
DataIndexer.run() → DataLoader → DocumentChunker → VectorStoreManager + BM25
```

**Query flow:**
```
ChatService.process() → History → Retriever → Reranker → ResponseGenerator → History
```

---

## 📋 Logging

```python
from src.logger import get_logger
logger = get_logger(__name__)

logger.info("Thông báo")
logger.error("Lỗi", exc_info=True)
```

```
2026-04-06 22:30:15 | INFO     | src.pipeline.rag_pipeline   | RAGPipeline ready (1.5s)
2026-04-06 22:30:20 | INFO     | src.chat.service            | Chat: user_id=user1, 0.8s
2026-04-06 22:30:21 | ERROR    | src.database.mongodb        | MongoDB connection failed
```

---

## 🚀 Hướng dẫn chạy

```bash
cd backend-python/ai-chatbot
pip install -r requirements.txt
cp .env.example .env              # sửa API key + connections
uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```

---

## 📝 Ghi chú

- Code **OOP + Dependency Injection** — mỗi class nhận dependencies qua constructor
- `RAGPipeline` là **Composition Root** — nơi duy nhất wire tất cả objects
- API routers lấy services qua `RAGPipeline.get_instance()`
- Thêm API version mới: tạo folder `src/api/v3/`, thêm routers, đăng ký trong `main.py`
- Tất cả hàm chỉ có **tên + docstring** (body `pass`). Cần tự viết implementation
