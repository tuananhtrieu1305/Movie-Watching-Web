from openai import OpenAI
import sys

# 1. Khai báo Client
# Nếu fen chạy file Python này ở máy tính ở nhà, hãy dùng link Pinggy
# Nếu fen chạy ngay trên Kaggle Notebook, đổi thành: base_url="http://localhost:8000/v1"
client = OpenAI(
    base_url="https://uqqjd-136-115-21-147.run.pinggy-free.link/v1",
    api_key="bat-cu-chuoi-gi-cung-duoc" # API local nên không cần key thật
)

# 2. Định nghĩa câu hỏi
model_name = "google/gemma-4-31b-it"
messages = [
    {"role": "system", "content": "Bạn là một trợ lý AI thông minh, trả lời ngắn gọn và hài hước."},
    {"role": "user", "content": "Hãy làm một bài thơ 4 câu khen ngợi sức mạnh của GPU H100 đi!"}
]

print("🤖 Gemma 4 đang suy nghĩ...\n")

# 3. Gửi Request và in kết quả dạng Stream (Nhả từng chữ)
try:
    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
        temperature=0.7,
        max_tokens=500,
        stream=True # Bật tính năng stream
    )

    # Vòng lặp để in ra màn hình ngay khi có token mới
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")
            sys.stdout.flush() # Ép terminal in ra ngay lập tức
            
    print("\n\n✅ Hoàn tất!")

except Exception as e:
    print(f"\n❌ Có lỗi xảy ra: {e}")