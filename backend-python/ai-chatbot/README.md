# 🤖 AI Chatbot — Tư Vấn Phim MovieHub

> **Chatbot thông minh** sử dụng kỹ thuật **RAG (Retrieval-Augmented Generation)** để tư vấn phim cho người dùng.  
> Chatbot tìm kiếm thông tin phim trong cơ sở dữ liệu, sau đó dùng AI (Google Gemini) để sinh câu trả lời tự nhiên, chính xác.

---

## 📚 Mục lục

- [Tech Stack](#-tech-stack)
- [RAG là gì?](#-rag-là-gì)
- [Kiến trúc tổng quan](#-kiến-trúc-tổng-quan)
- [Chi tiết 2 luồng chính](#-chi-tiết-2-luồng-chính)
  - [Luồng 1: Ingestion (Nạp dữ liệu)](#luồng-1-ingestion-pipeline--nạp-dữ-liệu-phim)
  - [Luồng 2: Chat Query (Hỏi đáp)](#luồng-2-chat-query-pipeline--hỏi-đáp)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Dependency Injection & OOP](#-dependency-injection--oop)
- [API Endpoints](#-api-endpoints)
- [Hướng dẫn cài đặt & chạy](#-hướng-dẫn-cài-đặt--chạy)
- [Option: Chạy LLM ở Local](#-option-chạy-llm-ở-local-thay-vì-gemini-api)
- [Cấu hình Environment](#-cấu-hình-environment)

---

## 🛠 Tech Stack

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| **Web Framework** | FastAPI + Uvicorn | API server async, tự tạo Swagger docs |
| **LLM (Não bộ AI)** | Google Gemini (qua LangChain) | Sinh câu trả lời tự nhiên từ context |
| **Embedding Model** | `BAAI/bge-m3` (HuggingFace) | Chuyển text → vector số để so sánh ngữ nghĩa |
| **Reranker** | `BAAI/bge-reranker-v2-m3` | Chấm điểm lại kết quả tìm kiếm cho chính xác hơn |
| **Vector Database** | ChromaDB (local) | Lưu trữ và tìm kiếm vector (Semantic Search) |
| **Keyword Search** | BM25 (rank-bm25) | Tìm kiếm theo từ khóa truyền thống |
| **Chat History DB** | MongoDB (Motor async) | Lưu lịch sử hội thoại theo user |
| **Source Data DB** | MySQL | Nguồn dữ liệu phim gốc (productions, genres, actors, ...) |
| **Orchestration** | LangChain | Kết nối các thành phần AI (embedding, LLM, vector store) |
| **Schema Validation** | Pydantic | Validate request/response data |

### Tóm tắt dependencies chính (`requirements.txt`)

```
fastapi, uvicorn          → Web server
langchain, langchain-*    → Orchestration AI pipeline
chromadb                  → Vector database
pymongo, motor            → MongoDB (async)
mysql-connector-python    → MySQL driver
sentence-transformers     → Embedding & Reranker models
rank-bm25                 → Keyword search
```

---

## 🧠 RAG là gì?

**RAG = Retrieval-Augmented Generation** — Kỹ thuật giúp AI trả lời chính xác hơn bằng cách:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CÁCH HOẠT ĐỘNG CỦA RAG                       │
│                                                                 │
│  1. User hỏi: "Phim hành động hay rating cao?"                 │
│                        ↓                                        │
│  2. RETRIEVAL: Tìm trong DB các phim liên quan                 │
│     → Tìm được: The Dark Knight, Avengers, ...                 │
│                        ↓                                        │
│  3. AUGMENTED: Nhét thông tin phim vào prompt                   │
│     → "Dựa trên các phim sau: [The Dark Knight...], hãy..."    │
│                        ↓                                        │
│  4. GENERATION: Gemini đọc context + sinh câu trả lời          │
│     → "Mình gợi ý cho bạn The Dark Knight (2008)..."           │
└─────────────────────────────────────────────────────────────────┘
```

**Tại sao cần RAG?** Vì LLM (Gemini/GPT) không biết dữ liệu phim riêng của MovieHub. RAG giúp "bơm" dữ liệu thực vào cho AI, tránh bịa thông tin (hallucination).

---

## 🏗 Kiến trúc tổng quan

Hệ thống gồm **2 pipeline chính**:

```
╔══════════════════════════════════════════════════════════════════╗
║                     AI CHATBOT SYSTEM                            ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐    ║
║  │         PIPELINE 1: INGESTION (Chạy 1 lần)              │    ║
║  │                                                          │    ║
║  │  MySQL ──→ DataLoader ──→ Chunker ──→ ChromaDB + BM25   │    ║
║  │  (Nguồn)   (Trích xuất)   (Cắt nhỏ)   (Lưu vector)     │    ║
║  └──────────────────────────────────────────────────────────┘    ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐    ║
║  │         PIPELINE 2: CHAT QUERY (Mỗi lần user hỏi)       │    ║
║  │                                                          │    ║
║  │  User ──→ History ──→ Retriever ──→ Reranker ──→ Gemini  │    ║
║  │  (Hỏi)   (Ngữ cảnh)  (Tìm kiếm)   (Lọc top)   (Trả lời)│   ║
║  └──────────────────────────────────────────────────────────┘    ║
║                                                                  ║
║  Database Layer:  MySQL │ ChromaDB │ MongoDB                     ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Chi tiết 2 luồng chính

### Luồng 1: Ingestion Pipeline — Nạp dữ liệu phim

> **Mục đích**: Lấy dữ liệu phim từ MySQL → xử lý → lưu vào ChromaDB & BM25 để sẵn sàng cho việc tìm kiếm.  
> **Khi nào chạy**: Khi thêm phim mới hoặc muốn đồng bộ lại toàn bộ dữ liệu. Gọi qua API `POST /api/v1/ingest`.

```
 ┌─────────┐     ┌─────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
 │  MySQL  │────→│  DataLoader │────→│ DocumentChunker│───→│ VectorStore  │     │ HybridSearch │
 │ (Nguồn) │     │ (Trích xuất)│     │  (Cắt nhỏ)    │    │  (ChromaDB)  │     │   (BM25)     │
 └─────────┘     └─────────────┘     └───────────────┘     └──────────────┘     └──────────────┘
                                            │                     ↑                    ↑
                                            │      Embedding      │     Pickle save    │
                                            └─────────────────────┴────────────────────┘
                                              LangChain Document (page_content + metadata)
```

**Chi tiết từng bước:**

| Bước | Class | Mô tả |
|------|-------|-------|
| **1. Extract** | `DataLoader` | Kết nối MySQL → JOIN bảng `productions`, `genres`, `actors`, `episodes` → Tổng hợp thành `MovieDocument` (content text + metadata) |
| **2. Transform** | `DocumentChunker` | Dùng `RecursiveCharacterTextSplitter` (LangChain) cắt content thành chunks nhỏ (mặc định 1024 ký tự, overlap 100). Mỗi chunk giữ nguyên metadata gốc + thêm `chunk_index` |
| **3. Load (Vector)** | `VectorStoreManager` | Gọi `EmbeddingService` (model `bge-m3`) chuyển chunk text → vector 1536 chiều → Lưu vào ChromaDB với ID format `prod_{id}_chunk_{idx}` |
| **4. Load (Keyword)** | `HybridSearchEngine` | Build BM25 index từ danh sách chunks → Serialize bằng `pickle` lưu ra file `bm25_index.pkl` |

**Ví dụ dữ liệu qua từng bước:**

```python
# Bước 1 — DataLoader tạo MovieDocument:
MovieDocument(
    production_id=1,
    title="The Dark Knight",
    content="Tên phim: The Dark Knight\nLoại: movie\nNăm: 2008\nThể loại: Hành động, Bí ẩn\n...",
    metadata={"production_id": 1, "type": "movie", "year": 2008, "genres": ["Hành động", "Bí ẩn"], ...}
)

# Bước 2 — Chunker cắt thành LangChain Document:
Document(
    page_content="Tên phim: The Dark Knight\nLoại: movie\n...",
    metadata={"production_id": 1, "title": "The Dark Knight", "chunk_index": 0, ...}
)

# Bước 3 — Embedding rồi lưu vào ChromaDB:
ChromaDB.add(id="prod_1_chunk_0", vector=[0.012, -0.045, ...], metadata={...})

# Bước 4 — BM25 index được lưu ra file:
pickle.dump(bm25_retriever, "data/bm25_index.pkl")
```

---

### Luồng 2: Chat Query Pipeline — Hỏi đáp

> **Mục đích**: Xử lý câu hỏi của user qua RAG pipeline → trả về câu trả lời thông minh.  
> **Khi nào chạy**: Mỗi khi user gửi tin nhắn qua API `POST /api/v1/chat`.

```
  User gửi câu hỏi
        │
        ▼
 ┌──────────────┐    ┌──────────────────┐
 │  ChatService │───→│ HistoryRepo      │  ← Bước 1-3: Quản lý conversation
 │ (Orchestrator)│   │ (MongoDB CRUD)   │     + Lưu tin nhắn user
 └──────┬───────┘    └──────────────────┘     + Lấy lịch sử chat gần nhất
        │
        ▼
 ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
 │   Retriever  │───→│ HybridSearch     │───→│   Reranker   │  ← Bước 4: Tìm & xếp hạng
 │(Orchestrator)│    │(Semantic + BM25) │    │(Cross-encoder)│
 └──────┬───────┘    └──────────────────┘    └──────────────┘
        │
        ▼
 ┌──────────────────┐    ┌──────────────┐
 │ ResponseGenerator│───→│ Google Gemini│  ← Bước 5: Sinh câu trả lời
 │ (Prompt Builder) │    │   (LLM API)  │
 └──────┬───────────┘    └──────────────┘
        │
        ▼
  Lưu response vào MongoDB + Trả về cho user  ← Bước 6-7
```

**Chi tiết từng bước:**

| Bước | Xử lý | Chi tiết |
|------|--------|---------|
| **1** | **Quản lý Conversation** | Nếu `conversation_id` rỗng → tạo mới (UUID v4) trong MongoDB. Nếu có → tiếp tục cuộc hội thoại cũ |
| **2** | **Lưu tin nhắn User** | Dùng `$push` để append tin nhắn vào mảng `messages` trong MongoDB |
| **3** | **Lấy History** | Lấy 10 tin nhắn gần nhất (dùng `$slice`) làm ngữ cảnh hội thoại |
| **4a** | **Preprocess Query** | Chuẩn hóa Unicode (NFC), lowercase, loại bỏ ký tự đặc biệt |
| **4b** | **Hybrid Search** | Chạy **song song** Semantic Search (ChromaDB cosine) + Keyword Search (BM25) |
| **4c** | **RRF Fusion** | Trộn 2 nguồn kết quả bằng **Reciprocal Rank Fusion**: `score = Σ 1/(k + rank)` |
| **4d** | **Rerank** | Cross-encoder (`bge-reranker-v2-m3`) chấm điểm lại từng cặp (query, chunk) → giữ top-K chính xác nhất |
| **5a** | **Format Context** | Ghép chunks thành chuỗi context có format `[Phim: X] (Thể loại: Y \| Năm: Z)` |
| **5b** | **Build Messages** | Tạo mảng messages: `[System Prompt, Chat History, Context + User Query]` |
| **5c** | **Call Gemini** | Gọi `ChatGoogleGenerativeAI.ainvoke()` (async) → nhận câu trả lời |
| **6** | **Lưu Response** | Lưu câu trả lời của AI vào MongoDB |
| **7** | **Return** | Trả về `ChatResponse(conversation_id, answer, sources[])` |

**Timeout bảo vệ:**
- Retrieval: tối đa **20 giây** (`CHAT_RETRIEVAL_TIMEOUT_SECONDS`)
- LLM call: tối đa **60 giây** (`CHAT_LLM_TIMEOUT_SECONDS`)

---

## 📁 Cấu trúc thư mục

```
ai-chatbot/
├── .env.example              # Mẫu biến môi trường
├── Dockerfile                # Docker build
├── requirements.txt          # Python dependencies
├── init.sql                  # SQL seed data
│
├── data/                     # Dữ liệu runtime (BM25 index, ChromaDB)
│
└── src/                      # ── SOURCE CODE ──
    ├── main.py               # FastAPI app entry point
    ├── config.py             # Đọc env vars, tập trung cấu hình
    ├── schemas.py            # Pydantic models (request/response/internal)
    ├── logger.py             # Logging tập trung (console format đẹp)
    │
    ├── api/                  # 🌐 API Layer
    │   ├── v1/
    │   │   ├── __init__.py         # Gom routers → prefix /api/v1
    │   │   ├── chat_router.py      # POST /api/v1/chat
    │   │   ├── history_router.py   # GET/DELETE /api/v1/history
    │   │   └── ingestion_router.py # POST /api/v1/ingest
    │   └── v2/                     # Placeholder cho mở rộng
    │
    ├── pipeline/             # 🔗 Composition Root
    │   └── rag_pipeline.py   # RAGPipeline (Singleton, DI Container)
    │
    ├── chat/                 # 💬 Chat Service
    │   └── service.py        # ChatService — orchestrate toàn bộ query flow
    │
    ├── ingestion/            # 📦 Data Ingestion
    │   ├── data_loader.py    # DataLoader — trích xuất từ MySQL
    │   ├── chunking.py       # DocumentChunker — cắt nhỏ text
    │   └── indexer.py        # DataIndexer — orchestrate ingestion flow
    │
    ├── retrieval/            # 🔍 Search & Retrieval
    │   ├── embedding.py      # EmbeddingService — text → vector
    │   ├── hybrid_search.py  # HybridSearchEngine — Semantic + BM25 + RRF
    │   ├── reranker.py       # Reranker — Cross-encoder scoring
    │   └── retriever.py      # Retriever — orchestrate search pipeline
    │
    ├── generation/           # 🤖 LLM Generation
    │   └── generator.py      # ResponseGenerator — prompt + Gemini
    │
    ├── history/              # 📜 Chat History
    │   └── repository.py     # ChatHistoryRepository — MongoDB CRUD
    │
    └── database/             # 🗄️ Database Connections
        ├── vector_store.py   # VectorStoreManager — ChromaDB
        └── mongodb.py        # MongoDBClient — MongoDB (async)
```

---

## 🧩 Dependency Injection & OOP

Tất cả class được khởi tạo và "đấu dây" (wire) tại **một nơi duy nhất**: `RAGPipeline` (Composition Root).

```
RAGPipeline (Singleton — tạo 1 lần duy nhất khi server start)
│
├── [Database Layer]
│   ├── MongoDBClient (Singleton, async)
│   └── VectorStoreManager → EmbeddingService (Singleton)
│
├── [AI Models]
│   ├── EmbeddingService ← model: BAAI/bge-m3
│   └── Reranker ← model: BAAI/bge-reranker-v2-m3
│
├── [Search Layer]
│   ├── HybridSearchEngine ← (VectorStoreManager)
│   └── Retriever ← (HybridSearchEngine, Reranker)
│
├── [Generation Layer]
│   └── ResponseGenerator ← (Retriever) + Google Gemini
│
├── [Business Layer]
│   ├── ChatHistoryRepository ← (MongoDBClient)
│   ├── ChatService ← (Retriever, ResponseGenerator, ChatHistoryRepository)
│   └── DataIndexer ← (DataLoader, DocumentChunker, VectorStoreManager, HybridSearchEngine)
```

**Nguyên tắc**: Mỗi class nhận dependencies qua **constructor** (không tự tạo). API routers truy cập services qua `RAGPipeline.get_instance()`.

**Thứ tự khởi tạo khi server start** (`rag_pipeline.py → initialize()`):
1. MongoDB connect + ChromaDB initialize
2. Load AI models (Embedding, Reranker)
3. Chuẩn bị DataLoader
4. Wire Retriever + Generator
5. Wire ChatService + DataIndexer → **Hệ thống sẵn sàng!**

---

## 🌐 API Endpoints

Base URL: `http://localhost:8002`

| Method | Endpoint | Mô tả | Body |
|--------|----------|-------|------|
| `GET` | `/` | Health check | — |
| `POST` | `/api/v1/chat` | Gửi tin nhắn chat | `{user_id, message, conversation_id?}` |
| `POST` | `/api/v1/ingest` | Nạp dữ liệu phim từ MySQL | `{force_reload: true}` |
| `GET` | `/api/v1/ingest/stats` | Thống kê vector store | — |
| `GET` | `/api/v1/history/{user_id}` | Danh sách hội thoại của user | — |
| `GET` | `/api/v1/history/{user_id}/{id}` | Chi tiết một hội thoại | — |
| `DELETE` | `/api/v1/history/{user_id}/{id}` | Xóa hội thoại | — |
| `GET` | `/docs` | Swagger UI (tự động) | — |

### Ví dụ request/response:

```bash
# Gửi câu hỏi
curl -X POST http://localhost:8002/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user1", "message": "Gợi ý phim hành động hay"}'
```

```json
// Response
{
  "conversation_id": "a1b2c3d4-...",
  "answer": "Mình gợi ý cho bạn The Dark Knight (2008) — một siêu phẩm hành động...",
  "sources": [
    {"production_id": 1, "title": "The Dark Knight", "score": 0.95},
    {"production_id": 5, "title": "Avengers", "score": 0.87}
  ]
}
```

---

## 🚀 Hướng dẫn cài đặt & chạy

### Yêu cầu
- Python 3.10+
- MySQL (có sẵn dữ liệu phim)
- MongoDB (cho chat history)

### Các bước

```bash
# 1. Di chuyển vào thư mục
cd backend-python/ai-chatbot

# 2. Cài dependencies
pip install -r requirements.txt

# 3. Tạo file .env từ mẫu
cp .env.example .env
# → Sửa: GEMINI_API_KEY, HF_TOKEN, MySQL/MongoDB connection strings

# 4. Chạy server
PYTHONPATH=. uvicorn src.main:app --reload --host 0.0.0.0 --port 8002

# 5. Nạp dữ liệu phim (chạy 1 lần hoặc khi có phim mới)
curl -X POST http://localhost:8002/api/v1/ingest -d '{"force_reload": true}'

# 6. Mở Swagger UI test API
# → http://localhost:8002/docs
```

---

## 🖥 Option: Chạy LLM ở Local (thay vì Gemini API)

> Nếu không muốn dùng Gemini API (tốn tiền / cần offline), bạn có thể **tự host LLM trên máy riêng** bằng **vLLM** + model **Gemma 4 31B**.
> Folder `llm-local/` chứa sẵn hướng dẫn và script test.

### Yêu cầu phần cứng

- **GPU**: NVIDIA với ≥ 40GB VRAM (khuyến nghị H100, A100, hoặc dùng dịch vụ cloud như Kaggle/Lightning.ai)
- Model `google/gemma-4-31B-it` cần ~31B parameters → **bắt buộc GPU mạnh**

### Cách hoạt động

```
┌────────────────────────────────────────────────────────────┐
│  Máy có GPU (Kaggle / Lightning.ai / Server riêng)        │
│                                                            │
│  vLLM Server (:8000)                                       │
│  ├── Model: google/gemma-4-31B-it                          │
│  └── API: OpenAI-compatible (/v1/chat/completions)         │
│                         │                                  │
│                    (nếu remote)                            │
│                    Pinggy Tunnel                            │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Máy local (hoặc AI Chatbot server)                        │
│                                                            │
│  Gọi API qua OpenAI SDK:                                   │
│  client = OpenAI(base_url="http://<host>:8000/v1")         │
└────────────────────────────────────────────────────────────┘
```

vLLM expose API **tương thích OpenAI** → code client giống hệt khi gọi OpenAI/Gemini, chỉ đổi `base_url`.

### Các bước cài đặt

```bash
# 1. Cài vLLM (trên máy có GPU)
pip install vllm huggingface_hub
pip install "numpy<2.0.0"

# 2. Đăng nhập HuggingFace (cần accept license model Gemma)
export HUGGING_FACE_HUB_TOKEN="hf_your_token_here"

# 3. Khởi động vLLM server
python -m vllm.entrypoints.openai.api_server \
    --model google/gemma-4-31B-it \
    --dtype bfloat16 \
    --max-model-len 8192 \
    --port 8000
```

### Test nhanh bằng curl

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemma-4-31B-it",
    "messages": [
      {"role": "user", "content": "Gợi ý phim hay cho cuối tuần"}
    ],
    "temperature": 0.7
  }'
```

### Test bằng Python (`llm-local/test_llm.py`)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",  # Hoặc URL Pinggy nếu remote
    api_key="any-string"                  # vLLM local không cần key thật
)

response = client.chat.completions.create(
    model="google/gemma-4-31b-it",
    messages=[{"role": "user", "content": "Xin chào!"}],
    temperature=0.7,
    stream=True  # Hỗ trợ streaming (nhả từng token)
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")
```

### Truy cập từ xa (nếu GPU ở cloud)

Nếu vLLM chạy trên Kaggle/Lightning.ai, dùng **Pinggy** để tạo tunnel công khai:

```bash
# Trên máy cloud (cạnh vLLM)
ssh -p 443 -R0:localhost:8000 a.pinggy.io
# → Nhận được link: https://xxxxx.pinggy-free.link
```

Sau đó đổi `base_url` trong code thành link Pinggy đó.

> **Lưu ý**: Để tích hợp vào chatbot chính, cần sửa `generator.py` để dùng `ChatOpenAI` (LangChain) thay vì `ChatGoogleGenerativeAI`, trỏ `base_url` về vLLM server.

---

## ⚙ Cấu hình Environment

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `GEMINI_API_KEY` | API key Google Gemini | *(bắt buộc)* |
| `HF_TOKEN` | HuggingFace token (tải model) | *(khuyến khích)* |
| `LLM_MODEL_NAME` | Tên model Gemini | `gemini-3-flash` |
| `LLM_TEMPERATURE` | Độ sáng tạo (0-1) | `0.4` |
| `EMBEDDING_MODEL_NAME` | Model embedding | `BAAI/bge-m3` |
| `RERANKER_MODEL_NAME` | Model reranker | `BAAI/bge-reranker-v2-m3` |
| `CHROMA_PERSIST_DIR` | Thư mục lưu ChromaDB | `./chroma_data` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MYSQL_HOST` / `MYSQL_DATABASE` | MySQL connection | `localhost` / `movie_streaming_db` |
| `CHUNK_SIZE` | Kích thước chunk (ký tự) | `1024` |
| `CHUNK_OVERLAP` | Overlap giữa chunks | `100` |
| `RETRIEVAL_TOP_K` | Số chunks trả về | `10` |
| `CHAT_RETRIEVAL_TIMEOUT_SECONDS` | Timeout retrieval | `20` |
| `CHAT_LLM_TIMEOUT_SECONDS` | Timeout gọi LLM | `60` |
