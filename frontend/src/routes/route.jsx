import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../modules/discovery/HomePage";
import AdminPage from "../admin/AdminPage";
import Test from "../admin/analytics/Test";
import Test1 from "../admin/users/Test";
import ContentTable from "../admin/content/ContentTable";
import Test3 from "../admin/community/Test";
import NotFoundPage from "../components/streamingPage/NotFoundPage";
import WatchPageWrapper from "../modules/streaming/WatchPageWrapper";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        // :slug là tham số động (VD: /watch/stranger-things-s4)
        path: "watch/:slug",
        element: <WatchPageWrapper />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: <Test />,
      },
      {
        path: "/admin/users",
        element: <Test1 />,
      },
      {
        path: "/admin/content",
        element: <ContentTable />,
      },
      {
        path: "/admin/community",
        element: <Test3 />,
      },
    ],
  },
]);
