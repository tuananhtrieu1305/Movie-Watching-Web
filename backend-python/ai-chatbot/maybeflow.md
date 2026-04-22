Data lúc lấy từ MySQL bằng `DataLoader.fetch_all_production()` có dạng:

```json
{
    'banner_url': 'https://wallpapercave.com/wp/wp15069153.webp',
    'country': 'USA',
    'created_at': datetime.datetime(2026, 1, 22, 0, 36, 26),
    'description': 'Phim siêu anh hùng về Batman',
    'id': 1,
    'is_premium': 1,
    'language': 'English',
    'poster_url': 'https://upload.wikimedia.org/wikipedia/vi/2/2d/Poster_phim_K%E1%BB%B5_s%C4%A9_b%C3%B3ng_%C4%91%C3%AAm_2008.jpg',
    'rating_avg': Decimal('5.0'),
    'rating_count': 1,
    'release_year': 2008,
    'slug': 'the-dark-knight',
    'status': 'completed',
    'title': 'The Dark Knight',
    'type': 'movie',
    'updated_at': datetime.datetime(2026, 4, 13, 1, 38, 8),

    'genres': ['Hành động', 'Siêu anh hùng', 'Bí ẩn'],
    'actors': ['Tom Hanks (vai Bruce Wayne / Batman)',
            'Leonardo DiCaprio (vai Harvey Dent / Two-Face)',
            'Meryl Streep (vai Rachel Dawes)',
            'Brad Pitt (vai Alfred Pennyworth)'],
    'episodes': ['Tập 1: Full Movie'],
 }
```

Sau đó dict này được định dạng lại dưới dạng chuẩn `DataLoader.build_movie_document()`:

```json
MovieDocument(
    production_id=1, 
    title='The Dark Knight', 
    content='Tên phim/series: The Dark Knight\nLoại: movie\nNăm phát hành: 2008\nQuốc gia: USA\nĐánh giá trung bình: 5.0/5\nSố lượng đánh giá: 1\nThể loại: Hành động, Siêu anh hùng, Bí ẩn\nDàn diễn viên: Tom Hanks (vai Bruce Wayne / Batman), Leonardo DiCaprio (vai Harvey Dent / Two-Face), Meryl Streep (vai Rachel Dawes), Brad Pitt (vai Alfred Pennyworth)\nMô tả nội dung: Phim siêu anh hùng về Batman\nTrạng thái: completed\nNgôn ngữ: English\nPremium: True\nDanh sách tập phim: Tập 1: Full Movie', 
    metadata={'production_id': 1, 'type': 'movie', 'title': 'The Dark Knight', 'year': 2008, 'country': 'USA', 'rating': 5.0, 'language': 'English', 'genres': ['Hành động', 'Siêu anh hùng', 'Bí ẩn'], 'actors': ['Tom Hanks (vai Bruce Wayne / Batman)', 'Leonardo DiCaprio (vai Harvey Dent / Two-Face)', 'Meryl Streep (vai Rachel Dawes)', 'Brad Pitt (vai Alfred Pennyworth)']}
)
```
Hàm `DataLoader.load_all()` sẽ thực hiện 2 bước kia trên toàn bộ tập data để tạo thành list[MovieDocument]

Hàm `Chunking.chunk_all()` sẽ cắt các MovieDocument thành từng đoạn con là Document có dạng:

```json
Document(
    metadata={'production_id': 1, 'type': 'movie', 'title': 'The Dark Knight', 'year': 2008, 'country': 'USA', 'rating': 5.0, 'language': 'English', 'actors': ['Tom Hanks (vai Bruce Wayne / Batman)', 'Leonardo DiCaprio (vai Harvey Dent / Two-Face)', 'Meryl Streep (vai Rachel Dawes)', 'Brad Pitt (vai Alfred Pennyworth)'], 'genres': ['Hành động', 'Siêu anh hùng', 'Bí ẩn'], 'chunk_index': 0}, 
    page_content='Tên phim/series: The Dark Knight\nLoại: movie\nNăm phát hành: 2008\nQuốc gia: USA\nĐánh giá trung bình: 5.0/5\nSố lượng đánh giá: 1\nThể loại: Hành động, Siêu anh hùng, Bí ẩn\nDàn diễn viên: Tom Hanks (vai Bruce Wayne / Batman), Leonardo DiCaprio (vai Harvey Dent / Two-Face), Meryl Streep (vai Rachel Dawes), Brad Pitt (vai Alfred Pennyworth)\nMô tả nội dung: Phim siêu anh hùng về Batman\nTrạng thái: completed\nNgôn ngữ: English\nPremium: True\nDanh sách tập phim: Tập 1: Full Movie'
)
```
Kết quả sau khi Retrieval (chi tiết code test nằm trong file retriever.py) sẽ có dạng list[RetrieverChunk] với 1 trong số đó có dạng:

```json
RetrieverChunk{'chunk_index': 0,
 'content': 'Tên phim/series: The Dark Knight\n'
            'Loại: movie\n'
            'Năm phát hành: 2008\n'
            'Quốc gia: USA\n'
            'Đánh giá trung bình: 5.0/5\n'
            'Số lượng đánh giá: 1\n'
            'Thể loại: Hành động, Siêu anh hùng, Bí ẩn\n'
            'Dàn diễn viên: Tom Hanks (vai Bruce Wayne / Batman), Leonardo '
            'DiCaprio (vai Harvey Dent / Two-Face), Meryl Streep (vai Rachel '
            'Dawes), Brad Pitt (vai Alfred Pennyworth)\n'
            'Mô tả nội dung: Phim siêu anh hùng về Batman\n'
            'Trạng thái: completed\n'
            'Ngôn ngữ: English\n'
            'Premium: True\n'
            'Danh sách tập phim: Tập 1: Full Movie',
 'metadata': {'chunk_index': 0,
              'country': 'USA',
              'genres': ['Hành động', 'Siêu anh hùng', 'Bí ẩn'],
              'language': 'English',
              'production_id': 1,
              'rating': 5.0,
              'title': 'The Dark Knight',
              'type': 'movie',
              'year': 2008},
 'production_id': 1,
 'score': 0.11929681897163391}
```
Đường link: [Truy cập Google](https://www.google.com)