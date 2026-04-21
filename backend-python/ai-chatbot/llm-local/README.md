Chạy các lệnh sau theo thứ tự:
```
pip install vllm
pip install vllm huggingface_hub #lightning.ai đã có sẵn
pip install "numpy<2.0.0"
```

```
export HUGGING_FACE_HUB_TOKEN="   "
```

```
python -m vllm.entrypoints.openai.api_server \
    --model google/gemma-4-31B-it \
    --dtype bfloat16 \
    --max-model-len 8192 \
    --port 8000
```

```
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "google/gemma-4-31B-it",
    "messages": [
      {"role": "user", "content": "Trình bày ngắn gọn về cấu trúc chung của một văn bản quy phạm pháp luật."}
    ],
    "temperature": 1.0,
    "top_p": 0.95
  }'
```