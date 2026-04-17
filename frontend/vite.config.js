import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Cho phép truy cập từ mạng LAN
    allowedHosts: true, // Mọi domain/ngrok đều được phép
    cors: true, // Bật CORS
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
