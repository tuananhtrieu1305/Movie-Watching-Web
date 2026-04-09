"""
Module cấu hình logging tập trung cho hệ thống RAG Chatbot.

Cung cấp hàm tiện ích get_logger() để các module khác lấy logger
với format thống nhất, output ra console (stdout) với màu sắc
và thông tin context đầy đủ (timestamp, module, level, message).
"""

import logging
import sys


LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)-30s | %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: int = logging.INFO) -> None:
    """
    Cấu hình logging cho toàn bộ application.

    Thiết lập root logger với:
    - StreamHandler xuất ra stdout (console)
    - Format thống nhất: timestamp | LEVEL | module_name | message
    - Level mặc định: INFO (có thể override qua tham số)

    Cần gọi một lần duy nhất khi khởi động application (trong main.py).

    Args:
        level (int): Logging level (logging.DEBUG, logging.INFO, ...).
            Mặc định logging.INFO. Đặt logging.DEBUG trong môi trường
            development để xem chi tiết hơn.

    Returns:
        None
    """
    pass


def get_logger(name: str) -> logging.Logger:
    """
    Lấy logger instance cho một module cụ thể.

    Sử dụng trong mỗi module bằng cách gọi ở đầu file:
        logger = get_logger(__name__)

    Sau đó sử dụng:
        logger.info("Thông báo bình thường")
        logger.warning("Cảnh báo")
        logger.error("Lỗi xảy ra", exc_info=True)
        logger.debug("Thông tin debug chi tiết")

    Args:
        name (str): Tên của module, thường truyền __name__.
            Ví dụ: "src.ingestion.data_loader", "src.chat.service"

    Returns:
        logging.Logger: Logger instance đã được cấu hình với
            handler và format từ setup_logging().
    """
    pass
