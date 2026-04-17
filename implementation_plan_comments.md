# Kế hoạch Triển khai Hệ thống Comment (Backend & Real-time)

Tài liệu này mô tả chi tiết cách xây dựng tính năng Bình luận và Đánh giá phim cho dự án Movie-Watching-Web, với kiến trúc hiệu năng cao và mở rộng chuẩn xác.

## 1. Thay đổi Database & Tối ưu Hiệu năng (`prisma/schema.prisma`)
Cần cập nhật Model `comments` để hỗ trợ tính năng UI và tối ưu tốc độ phân trang:

- **1. Hỗ trợ Spoiler**: Thêm trường `is_spoiler Boolean? @default(false)` vào model `comments`.
- **2. Đánh Index (Composite Index)**: Để API Cursor-based Pagination chạy mượt khi dữ liệu lên tới hàng triệu dòng mà không bị Full Table Scan, ta sẽ thêm Index phức hợp vào model `comments`:
  ```prisma
  @@index([production_id, id(sort: Desc)], map: "idx_production_cursor")
  ```
- **3. Hỗ trợ Like & Dislike**:
  - Thêm cột `dislikes_count Int? @default(0)` vào model `comments`.
  - Tạo Enum mới: `enum reaction_type { LIKE, DISLIKE }`.
  - Đổi tên bảng `comment_likes` thành `comment_reactions`. Thêm trường `type reaction_type` vào bảng này.
  - Sử dụng khóa chính cũ `@@id([user_id, comment_id])`. Điều này đảm bảo khi người dùng đã bấm Like mà đổi ý bấm Dislike thì sẽ **ghi đè** trạng thái (Tức là KHÔNG thể vừa like vừa dislike 1 comment).
- **Lệnh thực thi**: `npx prisma db push` để cập nhật database mà không làm mất dữ liệu hiện tại.

## 2. Thiết kế API REST (Node.js/Express)
Tổ chức code tại thư mục `backend-node/src/modules/community/`.

### Bảng Endpoints đầy đủ (Life-cycle Comment):
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/community/:movieId/comments` | Lấy danh sách comment gốc (Cursor-based, 15 cái/lượt). |
| `GET` | `/api/community/comments/:parentId/replies` | Lấy bình luận con (Cursor-based, 10 cái/lượt). |
| `POST` | `/api/community/comments` | Tạo bình luận mới. (Xử lý Upsert Rating độc lập, xem chi tiết bên dưới). |
| `PUT` | `/api/community/comments/:id` | Sửa nội dung bình luận (Trả về biến cờ `is_edited = true`). |
| `DELETE`| `/api/community/comments/:id` | Xóa bình luận. **Sử dụng Soft Delete** (Chuyển `status` thành `deleted` và đổi nội dung thành *"Bình luận đã bị xóa"*). Giữ nguyên các nhánh con để không mất văn cảnh (Ngữ cảnh tranh luận như Reddit). |
| `POST` | `/api/community/comments/:id/reaction` | Thả/Bỏ tim cho bình luận. Nhận dữ liệu payload Body: `{ reactType: 'LIKE' || 'DISLIKE' }`. Dùng logic Upsert để ghi đè. |

### Xử lý Logic Upsert Rating (Để tránh lặp điểm số ảo):
API `POST` tạo Comment sẽ tách bạch khâu lưu Rating như sau:
1. Ghi nội dung Comment dạng Text vào bảng `comments`.
2. Kiểm tra `if (rating > 0)`: Thực hiện **UPSERT** vào bảng `ratings`. Nghĩa là: Nếu User chưa chấm điểm phim này thì tạo hàm Tạo mới (`create`). Nếu đã chấm điểm rồi thì Cập nhật số sao mới (`update`).
=> *Triệt tiêu hoàn toàn rủi ro 1 user bình luận 5 lần 5 sao khiến điểm trung bình của bộ phim bị thổi phồng.*

## 3. Kiến trúc Real-time (Socket.io)
Dựa trên thư viện `socket.io` đã cài sẵn trong dự án.

- **Phòng (Rooms)**: Mỗi bộ phim là một phòng riêng (`movie_${id}`).
- **Luồng chạy an toàn**: Nghiêm cấm Client bắn trực tiếp qua Socket. Phải ghi dữ liệu vào DB qua API REST -> API gọi Socket để Broadcast.
- **Xử lý UI**: 
    - Nếu đang ở trên cùng: Chèn ngay.
    - Nếu đang cuộn xuống đọc: Hiện Pop-up "Có 5 bình luận mới" để người dùng chủ động bấm tải lại.
- **Xử lý đứt cáp (Socket Reconnect)**: Nếu frontend bị mất mạng 30s và kết nối lại (`socket.on('reconnect')`), tự động gọi lại API `GET` với tham số `cursor` truyền bằng ID của comment mới nhất đang hiển thị trên mặt giao diện. Hành động này sẽ tự động tải bù "khoảng trống 30s" bị mất trên mạng.

## 4. Bảo mật & Chống Spam
- **Rate Limit**: Giới hạn mỗi user chỉ được comment tối đa 5 lần mỗi phút.
- **Duplicate Check**: Chặn gửi 2 comment có nội dung giống hệt nhau trong thời gian ngắn để chống copy-paste liên tục.
- **Anti-XSS**: Loại bỏ/Sanitize mọi thẻ HTML độc hại bằng thư viện trong NodeJS.
- **Validation**: Kiểm tra độ dài text (1 - 1000 ký tự).

---

## 5. Giới hạn độ sâu (Max Depth)
Để tránh vỡ giao diện web:
- **Tối đa 2 cấp độ lồng nhau**.
- Từ cấp thứ 3 trở đi, các câu trả lời sẽ tự động bị "ép phẳng" (Flatten) về cùng hàng ngang của cấp độ 2, và nhét thêm tag `@ten_user` ở đầu nội dung để duy trì tính đối thoại trực tiếp.

---

**Trạng thái**: Bản quy hoạch hoàn chỉnh. Đã chốt kiến trúc.
*Đang đợi triển khai dòng code đầu tiên.*
