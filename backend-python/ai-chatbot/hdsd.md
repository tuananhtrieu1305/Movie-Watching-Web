0. setup .env: LLM_API_KEY, HF_TOKEN, và chạy lệnh pip install requirements.txt

1. Di chuyển đến thư mục chatbot

```
cd Movie-Watching-Web/backend-python/ai-chatbot
```

2. Chạy uvicorn

```
PYTHONPATH=. uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Phần còn lại là mở web lên và test nhớ chạy npm install react-markdown
sudo chown -R $(whoami) ~/Movie-Watching-Web/frontend (Nếu dùng lightning)
