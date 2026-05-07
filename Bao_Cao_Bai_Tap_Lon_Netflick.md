# BÁO CÁO BÀI TẬP LỚN LẬP TRÌNH WEB
**Đề tài:** Website Xem Phim Trực Tuyến Tích Hợp Xem Chung (Netflick)
**Sinh viên thực hiện:** [Tên của bạn]

---

## 1. Mở đầu
*   **Giới thiệu đề tài:** Dự án xây dựng website xem phim trực tuyến hiện đại, cho phép người dùng xem phim, thảo luận và tạo phòng xem chung với bạn bè.
*   **Lý do chọn đề tài:** Nhu cầu giải trí online tăng cao kết hợp với xu hướng tương tác xã hội ngay trong quá trình tiêu thụ nội dung số.
*   **Mục tiêu của đề tài:** Xây dựng nền tảng SPA (Single Page Application) mượt mà, tối ưu hóa bộ lọc tìm kiếm và đồng bộ hóa dữ liệu thời gian thực (Real-time).
*   **Phạm vi của hệ thống:** Bao gồm đầy đủ các tính năng của một website streaming từ giao diện người chơi, bộ lọc phim, hệ thống bình luận đến trang quản trị.

## 2. Cơ sở lý thuyết và công nghệ sử dụng
*   **Mô hình web áp dụng:** Client-Server kiến trúc tách biệt. Frontend giao tiếp với Backend qua REST API và WebSockets.
*   **Các công nghệ sử dụng:**
    *   **Frontend:** React.js, Vite, Ant Design, Tailwind CSS, Axios, Lucide Icons.
    *   **Backend:** Node.js, Express Framework, Prisma ORM.
    *   **Database:** MySQL.
    *   **Real-time:** Socket.io (cho Chat và Watch Party).
*   **Vai trò:** React đảm nhiệm render UI động; Node.js xử lý logic Backend; Prisma giúp quản lý Schema và truy vấn Database MySQL dễ dàng; Socket.io quản lý kết nối không đồng bộ.

## 3. Phân tích hệ thống
*   **Mô tả bài toán:** Website cung cấp nền tảng xem phim trực tuyến, giải quyết vấn đề tương tác giữa những người cùng xem một bộ phim.
*   **Đối tượng người dùng:** 
    *   Khách vãng lai: Xem danh sách phim, tìm kiếm.
    *   Thành viên: Bình luận, Like/Dislike, tạo và tham gia Watch Party.
    *   Quản trị viên: Quản lý phim, người dùng và xem báo cáo thống kê.
*   **Các chức năng chính:** 
    *   Trình phát video (Movie Player).
    *   Bộ lọc phim chuyên sâu (Filter by Genre/Country/Type).
    *   Bình luận phân cấp (Nested Comments) & Cảm xúc bình luận.
    *   Phòng xem chung (Watch Party) đồng bộ trạng thái video.
    *   Quản lý tài khoản và gói thành viên VIP.

## 4. Thiết kế hệ thống
### 4.1 Thiết kế frontend
*   **Các trang chính:**
    *   `HomePage`: Hiển thị phim đề xuất, phim mới và các danh mục hot.
    *   `BrowsePage`: Hệ thống lọc phim động mạnh mẽ sử dụng URL Query Params.
    *   `WatchPage`: Trình phát video kèm danh sách tập phim và khu vực thảo luận.
    *   `UserDashboard`: Quản lý hồ sơ, lịch sử xem và gói VIP.
*   **Framework:** Sử dụng React với phong cách Component-based, đảm bảo tính tái sử dụng code cao.

### 4.2 Thiết kế backend
*   **Module chính:** Auth (Đăng nhập/Đăng ký), Streaming (Xử lý phim/tập phim), Interaction (Bình luận/Cảm xúc), WatchParty (Điều hướng Socket).
*   **Xử lý nghiệp vụ:** Sử dụng Controller-Service pattern để tách biệt logic xử lý và định tuyến.
*   **Xác thực:** Bảo mật bằng JWT Access Token lưu ở LocalStorage và Refresh Token lưu tại Cookie (HttpOnly).

### 4.3 Thiết kế cơ sở dữ liệu
*   **Các bảng chính:** `users`, `productions` (Sản phẩm phim), `episodes` (Tập phim), `genres` (Thể loại), `comments` (Bình luận), `watch_parties` (Phòng xem).
*   **Quan hệ:** 
    *   `productions` - `genres`: Quan hệ nhiều-nhiều qua bảng trung gian `production_genres`.
    *   `users` - `comments`: Quan hệ một-nhiều.
    *   `productions` - `episodes`: Quan hệ một-nhiều.

## 5. Xây dựng chương trình
### 5.1 Xây dựng frontend
*   Xây dựng giao diện Responsive, hỗ trợ tốt trên nhiều kích thước màn hình.
*   Sử dụng React Context API (`AuthContext`) để quản lý phiên đăng nhập toàn cục.
*   Tích hợp `Socket.io-client` để nhận thông báo bình luận và sự kiện đồng bộ video ngay lập tức.

### 5.2 Xây dựng backend
*   Backend xử lý các API lọc phim với tốc độ cao nhờ Prisma tối ưu hóa câu lệnh SQL.
*   Hệ thống CRUD (Thêm, Sửa, Xóa) cho phim và người dùng hoàn thiện trong trang Admin.
*   Kết nối MySQL bền vững, xử lý triệt để lỗi Encoding Tiếng Việt.

### 5.3 Kết quả chạy chương trình
*   Người dùng có thể tìm đúng bộ phim yêu cầu chỉ sau vài lượt click lọc.
*   Tính năng Watch Party cho phép hai người ở xa xem phim cùng nhau với độ trễ cực thấp.
*   Bình luận tự động hiển thị mà không cần tải lại trang.

## 6. Kiểm thử và đánh giá
*   **Kiểm thử:** Đã tiến hành kiểm thử chức năng (Black-box testing) trên các module quan trọng như Đăng nhập, Lọc phim và Gửi bình luận.
*   **Ưu điểm:** Trải nghiệm người dùng mượt mà, giao diện chuyên nghiệp, tính năng Real-time ổn định.
*   **Hạn chế:** Cần cải thiện thêm hệ thống gợi ý phim thông minh hơn dựa trên AI trong tương lai.

## 7. Kết luận và hướng phát triển
*   **Kết quả:** Dự án hoàn thành tốt các yêu cầu của một bài tập lớn chuyên ngành, áp dụng được nhiều công nghệ mới.
*   **Khó khăn:** Mất nhiều thời gian trong việc đồng bộ trạng thái Play/Pause giữa các máy khách trong Watch Party.
*   **Hướng phát triển:** Thêm tính năng tải phim Offline, tích hợp thanh toán tự động qua Momo/VNPay và xây dựng hệ thống Chat tích hợp AI tư vấn phim.

## 8. Tài liệu tham khảo
1. React Library Documentation - react.dev
2. Prisma ORM Reference - prisma.io
3. Socket.io Real-time engine docs
4. Youtube/Google for learning UI layout concepts.

## 9. Phụ lục
*   **Cài đặt:** Chạy `npm install`, setup biến môi trường `.env` và `npm run dev`.
*   **Cấu trúc code:** 
    *   `frontend/src/modules/`: Chứa các tính năng tách biệt.
    *   `backend-node/src/core/`: Chứa các Middleware và tiện ích hệ thống.
