/**
 * data.js
 * File chứa dữ liệu giả lập (Mock Data)
 */

// --------------------------------------------------------
// 1. DANH SÁCH NGƯỜI DÙNG (USER DICTIONARY)
// Key là ID người dùng, giúp tra cứu nhanh O(1)
// --------------------------------------------------------
export const USERS = {
  user_01: {
    id: "user_01",
    name: "NGUYỄN MINH ĐỨC",
    avatar:
      "https://ui-avatars.com/api/?name=Nguyen+Minh+Duc&background=0D8ABC&color=fff",
    roles: ["vip"], // Có huy hiệu Vô cực
    profileUrl: "/u/minhduc",
  },
  user_02: {
    id: "user_02",
    name: "Na245",
    avatar: "https://ui-avatars.com/api/?name=Na+245&background=random",
    roles: ["vip"],
    profileUrl: "/u/na245",
  },
  user_03: {
    id: "user_03",
    name: "Phạm Bá Tiến",
    avatar:
      "https://ui-avatars.com/api/?name=Pham+Ba+Tien&background=ff5722&color=fff",
    roles: [], // User thường
    profileUrl: "/u/batien",
  },
  user_04: {
    id: "user_04",
    name: "Mọt Phim Hàn",
    avatar:
      "https://ui-avatars.com/api/?name=Mot+Phim&background=6366f1&color=fff",
    roles: [],
    profileUrl: "/u/motphim",
  },
  // User đang đăng nhập (ví dụ chính là bạn)
  current_user: {
    id: "user_99",
    name: "Bạn",
    avatar: "https://ui-avatars.com/api/?name=Toi&background=333&color=fff",
    roles: [],
  },
};

// --------------------------------------------------------
// 2. DANH SÁCH BÌNH LUẬN (COMMENTS LIST)
// Chỉ lưu authorId để tham chiếu sang USERS
// --------------------------------------------------------
export const COMMENTS = [
  {
    id: 1,
    authorId: "user_01", // Tham chiếu đến NGUYỄN MINH ĐỨC
    content: {
      text: "Tao đã xem đủ loại phim hàn, phản diện cũng đủ loại, từ sát nhân cho đến đủ thể loại phản diện đáng ghét nhưng lần đầu xem phim mà cứ đến đoạn của 1 nhân vật được coi là chính diện như cái con bé Seo jin, tao lại phải tua. Sao có thể để 1 nữ diễn viên ngoại hình thường mà lại tỏ vẻ khó chịu đến thế nhỉ. Bảo thằng ** kia nó làm sai gì cơ, đây đã *** xinh còn chảnh.",
      rating: 4, // Ví dụ rating (nếu có)
      isSpoiler: false,
      episodeTag: "P.1 - Tập 8",
    },
    time: "3 giờ trước",
    stats: {
      likes: 12,
      dislikes: 1,
      repliesCount: 3,
    },
    interaction: {
      hasLiked: false,
      hasDisliked: false,
    },
    replies: [], // Mảng chứa các comment con (Reply)
  },
  {
    id: 2,
    authorId: "user_02", // Tham chiếu đến Na245
    content: {
      text: "Xem đc 10p đầu thấy con nữ chính đơ hết muốn xem.",
      rating: 1,
      isSpoiler: false,
      episodeTag: null, // Comment chung
    },
    time: "5 giờ trước",
    stats: {
      likes: 0,
      dislikes: 5,
      repliesCount: 0,
    },
    interaction: {
      hasLiked: false,
      hasDisliked: true, // Ví dụ user hiện tại đã dislike comment này
    },
    replies: [],
  },
  {
    id: 3,
    authorId: "user_03", // Tham chiếu đến Phạm Bá Tiến
    content: {
      text: "Cho xin cắt đoạn ** cháu với đứa kia không. Mẹ thằng ** cháu vừa đẹp trai, vừa cao to, thông minh lại tốt tính sao chọn con dv diễn vừa khó chịu vừa ko đủ sắc đẹp để làm hot girl trường vậy. Chán lắm rồi.",
      rating: null,
      isSpoiler: true, // Ví dụ set là spoiler
      episodeTag: "P.1 - Tập 7",
    },
    time: "1 ngày trước",
    stats: {
      likes: 45,
      dislikes: 2,
      repliesCount: 10,
    },
    interaction: {
      hasLiked: true, // Ví dụ user hiện tại đã like comment này
      hasDisliked: false,
    },
    replies: [],
  },
  {
    id: 4,
    authorId: "user_04", // Tham chiếu đến Mọt Phim Hàn
    content: {
      text: "Phim hay mà mọi người chê dữ vậy? Tập này plot twist đỉnh thực sự!",
      rating: 5,
      isSpoiler: false,
      episodeTag: "P.2 - Tập 1",
    },
    time: "2 ngày trước",
    stats: {
      likes: 102,
      dislikes: 4,
      repliesCount: 21,
    },
    interaction: {
      hasLiked: false,
      hasDisliked: false,
    },
    replies: [],
  },
];
