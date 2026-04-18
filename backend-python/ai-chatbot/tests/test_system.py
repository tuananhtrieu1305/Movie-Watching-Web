"""
Script Test Tổng Thể Hệ Thống RAG (End-to-End)
Chạy lệnh: python test_system.py (hoặc python -m src.chat.test_system)
"""

# import sys
# import os

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# PYTHONPATH=. python3 tests/test_system.py
import asyncio
import time

# Nhớ sửa lại đường dẫn import tùy theo chỗ fen đặt file này nhé
from src.pipeline.rag_pipeline import RAGPipeline
from src.schemas import ChatRequest
from src.logger import get_logger, setup_logging

setup_logging()
logger = get_logger("Test_System")

async def main():
    logger.info("🚀 BẮT ĐẦU KHỞI ĐỘNG HỆ THỐNG RAG...")
    
    # Lấy instance của Nhạc trưởng và khởi tạo toàn bộ (MongoDB, Chroma, Models)
    # pipeline = RAGPipeline.get_instance()
    pipeline = RAGPipeline()
    await pipeline.initialize()
    
    query = "Giới thiệu cho tôi một bộ phim hay về du hành vũ trụ hoặc siêu anh hùng."
    user_test_id = "user_vip_test_999"
    
    try:
        # ==========================================
        # TRẠM 1: TEST NÃO BỘ TÌM KIẾM (RETRIEVAL)
        # ==========================================
        logger.info("\n" + "="*60)
        logger.info("📍 TRẠM 1: TEST TÌM KIẾM TÀI LIỆU (RETRIEVAL)")
        logger.info("="*60)
        logger.info(f"Câu hỏi: '{query}'")
        
        t1_start = time.time()
        # Gọi thẳng Retriever (Đã bao gồm Hybrid Search + Reranker)
        chunks = await pipeline.retriever.retrieve(query)
        logger.info(f"⏱ Thời gian tìm kiếm: {time.time() - t1_start:.2f}s")
        logger.info(f"Tìm thấy {len(chunks)} đoạn tài liệu liên quan.")
        
        if chunks:
            logger.info("🌟 Top 1 tài liệu xịn nhất tìm được:")
            logger.info(f" - Phim: {chunks[0].metadata.get('title', 'Unknown')}")
            logger.info(f" - Điểm số tự tin (Score): {chunks[0].score}")
            logger.info(f" - Trích đoạn: {chunks[0].content[:150]}...\n")
        else:
            logger.warning("⚠️ Không tìm thấy tài liệu nào! (Hãy chắc chắn bạn đã chạy run_ingest.py để nạp dữ liệu)")

        # ==========================================
        # TRẠM 2: TEST SIÊU ĐẦU BẾP (GENERATION)
        # ==========================================
        logger.info("\n" + "="*60)
        logger.info("📍 TRẠM 2: TEST SINH CÂU TRẢ LỜI BẰNG LLM (GENERATION)")
        logger.info("="*60)
        
        if chunks:
            t2_start = time.time()
            # Giả lập chưa có lịch sử chat (truyền history rỗng)
            answer = await pipeline.generator.generate(
                query=query, 
                retrieved_chunks=chunks, 
                chat_history=[]
            )
            logger.info(f"⏱ Thời gian LLM suy nghĩ: {time.time() - t2_start:.2f}s")
            logger.info(f"🤖 AI Trả lời:\n{answer}")
        else:
            logger.warning("⚠️ Bỏ qua Trạm 2 vì Trạm 1 không tìm thấy tài liệu.")

        # ==========================================
        # TRẠM 3: TEST NHẠC TRƯỞNG E2E & TRÍ NHỚ (CHAT SERVICE)
        # ==========================================
        logger.info("\n" + "="*60)
        logger.info("📍 TRẠM 3: TEST TOÀN TRÌNH VÀ BỘ NHỚ (CHAT SERVICE)")
        logger.info("="*60)
        
        request_1 = ChatRequest(user_id=user_test_id, message="Có phim trinh thám hoặc hack não nào căng thẳng không?")
        
        t3_start = time.time()
        response_1 = await pipeline.chat_service.process(request_1)
        
        logger.info(f"🗣️ Khách hỏi (Câu 1): {request_1.message}")
        logger.info(f"🤖 AI Đáp: {response_1.answer}")
        logger.info(f"📚 Nguồn: {response_1.sources}")
        logger.info(f"🆔 Bàn số (Conversation ID): {response_1.conversation_id}")
        logger.info(f"⏱ Thời gian xử lý: {time.time() - t3_start:.2f}s")
        
        # --- TEST BỘ NHỚ ---
        logger.info("\n--- Thử chat tiếp câu 2 (Test khả năng nhớ ngữ cảnh) ---")
        request_2 = ChatRequest(
            user_id=user_test_id, 
            message="Đạo diễn của bộ phim bạn vừa kể tên là ai vậy?", 
            conversation_id=response_1.conversation_id  # Nhét ID cũ vào để nó nhớ
        )
        response_2 = await pipeline.chat_service.process(request_2)
        logger.info(f"🗣️ Khách hỏi (Câu 2): {request_2.message}")
        logger.info(f"🤖 AI Đáp: {response_2.answer}")
        
    except Exception as e:
        logger.error(f"❌ TOANG KHI TEST: {e}", exc_info=True)
        
    finally:
        # Ngắt kết nối Database và giải phóng RAM an toàn
        await pipeline.shutdown()
        logger.info("\n🛑 Đã tắt hệ thống an toàn. Kết thúc bài test!")

if __name__ == "__main__":
    asyncio.run(main())