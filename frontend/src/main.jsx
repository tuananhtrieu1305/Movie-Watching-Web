import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/homepage.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/route.jsx";
import { ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import MeetingProvider from "./modules/meeting/MeetingContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <MeetingProvider>
      <ConfigProvider locale={enUS} theme={{ algorithm: theme.darkAlgorithm }}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </MeetingProvider>
  </AuthProvider>
);
