import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Hàm lấy accessToken từ localStorage (được set bởi AuthContext)
const getAccessToken = () => localStorage.getItem("accessToken") || "";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  // Gắn JWT vào handshake để server verify ngay khi connect
  auth: (cb) => {
    cb({ token: getAccessToken() });
  },
});

export default socket;
