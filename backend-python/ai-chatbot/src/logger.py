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

class ColorFormatter(logging.Formatter):
    """
    Tùy chỉnh Formatter để thêm màu sắc vào terminal dựa trên level của log.
    """
    # Mã màu ANSI
    GREY = "\x1b[38;20m"
    BLUE = "\x1b[34;20m"
    GREEN = "\x1b[32;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    RESET = "\x1b[0m"

    # Map màu sắc với từng level
    FORMATS = {
        logging.DEBUG: BLUE + LOG_FORMAT + RESET,
        logging.INFO: GREEN + LOG_FORMAT + RESET,
        logging.WARNING: YELLOW + LOG_FORMAT + RESET,
        logging.ERROR: RED + LOG_FORMAT + RESET,
        logging.CRITICAL: BOLD_RED + LOG_FORMAT + RESET
    }

    def format(self, record: logging.LogRecord) -> str:
        log_fmt = self.FORMATS.get(record.levelno, self.GREY + LOG_FORMAT + self.RESET)
        formatter = logging.Formatter(log_fmt, datefmt=LOG_DATE_FORMAT)
        return formatter.format(record)


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
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    if root_logger.hasHandlers(): # Tránh việc log bị lặp đúp (duplicate) nếu setup_logging bị gọi nhiều lần
        root_logger.handlers.clear()

    console_handler = logging.StreamHandler(sys.stdout) # Tạo handler xuất log ra console
    console_handler.setLevel(level)

    console_handler.setFormatter(ColorFormatter()) # Gắn Formatter có màu sắc vào handler

    root_logger.addHandler(console_handler) # Thêm handler vào root logger


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
    return logging.getLogger(name)