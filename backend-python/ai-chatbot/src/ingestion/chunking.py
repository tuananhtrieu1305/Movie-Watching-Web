"""
Module chunking — chia nhỏ MovieDocument thành các text chunks.

Cung cấp class DocumentChunker sử dụng RecursiveCharacterTextSplitter
từ LangChain để chia nhỏ documents giữ nguyên ngữ nghĩa và metadata.
"""

from typing import Optional
from langchain.schema import Document
from src.logger import get_logger

logger = get_logger(__name__)


class DocumentChunker:
    """
    Chia nhỏ MovieDocument thành các text chunks có kích thước phù hợp.

    Sử dụng RecursiveCharacterTextSplitter từ LangChain với separator
    phù hợp cho nội dung tiếng Việt + tiếng Anh.

    Attributes:
        _chunk_size (int): Kích thước tối đa mỗi chunk (ký tự).
        _chunk_overlap (int): Số ký tự chồng lấp giữa các chunk.
        _text_splitter: LangChain RecursiveCharacterTextSplitter instance.

    Usage:
        chunker = DocumentChunker(chunk_size=512, chunk_overlap=50)
        chunks = chunker.chunk_all(movie_documents)
    """

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 50):
        """
        Khởi tạo DocumentChunker với cấu hình chunk.

        Tạo RecursiveCharacterTextSplitter với separator phù hợp.
        Log cấu hình chunk_size và chunk_overlap.

        Args:
            chunk_size (int): Kích thước tối đa mỗi chunk. Mặc định 512.
            chunk_overlap (int): Số ký tự chồng lấp. Mặc định 50.
        """
        pass

    def chunk_single(self, movie_document) -> list[Document]:
        """
        Chia nhỏ một MovieDocument thành nhiều LangChain Document chunks.

        Mỗi chunk kế thừa metadata từ MovieDocument gốc và bổ sung
        chunk_index. Metadata gồm: production_id, title, type,
        genres, year, country, chunk_index.

        Args:
            movie_document (MovieDocument): Document cần chunk.

        Returns:
            list[Document]: Danh sách LangChain Document chunks.
        """
        pass

    def chunk_all(self, movie_documents: list) -> list[Document]:
        """
        Chia nhỏ toàn bộ danh sách MovieDocument.

        Log: tổng documents đầu vào, tổng chunks đầu ra.

        Args:
            movie_documents (list[MovieDocument]): Danh sách documents.

        Returns:
            list[Document]: Tất cả LangChain Document chunks.
        """
        pass
