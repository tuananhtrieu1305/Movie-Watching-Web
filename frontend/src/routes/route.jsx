import { createBrowserRouter, Navigate } from "react-router-dom";

// 1. Import Layout
import MainLayout from "../components/layout/MainLayout";

// 2. Import Discovery Pages
import HomePage from "../modules/discovery/pages/HomePage";
import UserLayout from "../modules/user/UserLayout";
import ProfilePage from "../modules/user/pages/ProfilePage";
import HistoryPage from "../modules/user/pages/HistoryPage";
import FavoritesPage from "../modules/user/pages/FavoritesPage";
import NotificationsPage from "../modules/user/pages/NotificationsPage";
import SettingsPage from "../modules/user/pages/SettingsPage";

// 3. Import Auth Pages
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";

// 4. Import Payment Pages
import PlansPage from "../modules/payment/pages/PlansPage";
import CheckoutPage from "../modules/payment/pages/CheckoutPage";

// 5. Import Admin Pages
import AdminPage from "../admin/AdminPage";
import Test from "../admin/analytics/Test";
import Test1 from "../admin/users/Test";
import ContentTable from "../admin/content/ContentTable";
import Test3 from "../admin/community/Test";
import NotFoundPage from "../components/streamingPage/NotFoundPage";
import WatchPageWrapper from "../modules/streaming/WatchPageWrapper";

export const router = createBrowserRouter([
  // --- NHÓM 1: PUBLIC (Có Header/Footer) ---
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // --- USER SECTION (Nested routes) ---

      {
        // :slug là tham số động (VD: /watch/stranger-things-s4)
        path: "watch/:slug",
        element: <WatchPageWrapper />,
      },
    ],
  },
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/user/profile" replace />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "plans",
        element: <PlansPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
    ],
  },
  // --- NHÓM 2: ADMIN (Giao diện riêng) ---
  {
    path: "/admin",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: <Test />,
      },
      {
        path: "users",
        element: <Test1 />,
      },
      {
        path: "/admin/content",
        element: <ContentTable />,
      },
      {
        path: "community",
        element: <Test3 />,
      },
    ],
  },

  // --- NHÓM 3: AUTH (Full màn hình, không Header) ---
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // --- 404 Not Found ---
  {
    path: "*",
    element: (
      <div className="text-white text-center mt-20">
        404 - Trang không tồn tại
      </div>
    ),
  },
]);
