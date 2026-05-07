import { createBrowserRouter, Navigate } from "react-router-dom";

// 1. Import Layout
import MainLayout from "../../shared/components/layout/MainLayout";

// 2. Import Discovery Pages
import HomePage from "../../modules/discovery/pages/HomePage";
import BrowsePage from "../../modules/discovery/browse/BrowsePage";
import UserLayout from "../../modules/user/layout/UserLayout";
import ProfilePage from "../../modules/user/pages/ProfilePage";
import HistoryPage from "../../modules/user/pages/HistoryPage";
import TransactionsPage from "../../modules/user/pages/TransactionsPage";
import FavoritesPage from "../../modules/user/pages/FavoritesPage";
import NotificationsPage from "../../modules/user/pages/NotificationsPage";
import SettingsPage from "../../modules/user/pages/SettingsPage";

// 3. Import Auth Pages
import LoginPage from "../../modules/auth/pages/LoginPage";
import RegisterPage from "../../modules/auth/pages/RegisterPage";

// 4. Import Payment Pages
import PlansPage from "../../modules/payment/pages/PlansPage";
import CheckoutPage from "../../modules/payment/pages/CheckoutPage";

// 5. Import Admin Pages
import AdminPage from "../../modules/admin/AdminPage";
import AnalyticsDashboard from "../../modules/admin/analytics/AnalyticsDashboard";
import ContentTable from "../../modules/admin/content/ContentTable";
import NotFoundPage from "../../modules/streaming/components/watch/NotFoundPage";
import WatchPageWrapper from "../../modules/streaming/pages/WatchPageWrapper";
import UsersManagement from "../../modules/admin/users/UsersManagement";
import TransactionsManagement from "../../modules/admin/transactions/TransactionsManagement";
import SubscriptionsHistory from "../../modules/admin/subscriptions/SubscriptionsHistory";
import { useAuth } from "../../modules/auth/hooks/useAuth";

// 6. Import Meeting Pages
import MeetingContext from "../../modules/meeting/context/MeetingContext";
import MeetingPage from "../../modules/meeting/pages/MeetingPage";
import ActiveMeeting from "../../modules/meeting/pages/ActiveMeeting";
import { Outlet } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export const router = createBrowserRouter([
  // --- NHÓM 1: PUBLIC (Có Header/Footer) ---
  {
    path: "/",
    element: (
      <MeetingContext>
        <MainLayout />
      </MeetingContext>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // --- USER SECTION (Nested routes) ---

      {
        path: "watch/:slug",
        element: <WatchPageWrapper />,
      },
      {
        path: "movies",
        element: <BrowsePage />,
      },
      {
        path: "series",
        element: <BrowsePage />,
      },
      {
        path: "meeting",
        children: [
          {
            index: true,
            element: <MeetingPage />,
          },
          {
            path: ":meetingId",
            element: <ActiveMeeting />,
          },
        ],
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
        path: "transactions",
        element: <TransactionsPage />,
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
    element: (
      <RequireAdmin>
        <AdminPage />
      </RequireAdmin>
    ),
    children: [
      {
        index: true,
        element: <AnalyticsDashboard />,
      },
      {
        path: "users",
        element: <UsersManagement />,
      },
      {
        path: "transactions",
        element: <TransactionsManagement />,
      },
      {
        path: "subscriptions",
        element: <SubscriptionsHistory />,
      },
      {
        path: "/admin/content",
        element: <ContentTable />,
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
