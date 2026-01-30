import os
import shutil

import boto3
import ffmpeg
from fastapi import BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# 1. Cấu hình kết nối R2 (Lấy từ biến môi trường Docker)
s3_client = boto3.client(
    "s3",
    endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)
BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN")


class VideoJob(BaseModel):
    file_name: str  # Ví dụ: "videos/batman.mp4"


def process_hls_task(file_name: str):
    """Hàm chạy ngầm: Tải -> Cắt -> Upload"""
    try:
        print(f"🎬 Bắt đầu xử lý: {file_name}")

        # A. Tạo thư mục tạm
        base_name = os.path.splitext(os.path.basename(file_name))[0]  # "batman"
        work_dir = f"/app/temp/{base_name}"
        os.makedirs(work_dir, exist_ok=True)

        local_input_path = f"{work_dir}/input.mp4"
        hls_output_dir = f"{work_dir}/hls"
        os.makedirs(hls_output_dir, exist_ok=True)

        # B. Tải file từ R2 về máy
        print("⬇️ Đang tải file gốc từ Cloudflare R2...")
        s3_client.download_file(BUCKET_NAME, file_name, local_input_path)

        # C. Cắt video bằng FFmpeg (Magic is here!)
        print("✂️ Đang cắt video ra HLS (m3u8)...")
        (
            ffmpeg.input(local_input_path)
            .output(
                f"{hls_output_dir}/playlist.m3u8",
                format="hls",
                start_number=0,
                hls_time=10,
                hls_list_size=0,
            )
            .run(capture_stdout=True, capture_stderr=True)
        )

        # D. Upload ngược lại lên R2 (Cả folder)
        print("☁️ Đang upload các đoạn phim đã cắt lên R2...")
        r2_hls_path = f"hls/{base_name}"  # Đường dẫn trên mây: hls/batman/

        for root, _, files in os.walk(hls_output_dir):
            for file in files:
                local_file = os.path.join(root, file)
                # Tính toán đường dẫn key trên R2
                r2_key = f"{r2_hls_path}/{file}"

                # Upload từng file nhỏ (.ts, .m3u8)
                content_type = (
                    "application/x-mpegURL" if file.endswith(".m3u8") else "video/MP2T"
                )
                s3_client.upload_file(
                    local_file,
                    BUCKET_NAME,
                    r2_key,
                    ExtraArgs={"ContentType": content_type},
                )

        # E. Dọn dẹp rác
        shutil.rmtree(work_dir)

        # F. Link cuối cùng để xem
        final_hls_url = f"{PUBLIC_DOMAIN}/{r2_hls_path}/playlist.m3u8"
        print(f"✅ XỬ LÝ XONG! Link phim HLS: {final_hls_url}")

        # TODO: Ở đây bạn có thể gọi ngược lại API Node.js để update vào Database
        # requests.post("http://backend-node:3000/api/update-video-url", json={...})

    except Exception as e:
        print(f"❌ LỖI XỬ LÝ VIDEO: {str(e)}")


@app.post("/process-video")
async def process_video(job: VideoJob, background_tasks: BackgroundTasks):
    # Nhận lệnh từ Node.js và trả lời ngay lập tức (không bắt Node chờ)
    background_tasks.add_task(process_hls_task, job.file_name)
    return {"message": "Đã nhận lệnh, Python đang xử lý ngầm...", "file": job.file_name}
