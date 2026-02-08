import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/pages/HomePage";
import { ChatPage } from "@/pages/ChatPage";
import { ConnectionsPage } from "@/pages/ConnectionsPage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "chat",
            element: <ChatPage />,
          },
          {
            path: "connections",
            element: <ConnectionsPage />,
          },
        ],
      },
    ],
  },
  // {
  //   path: "*",
  //   element: (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-4xl font-bold">404</h1>
  //         <p className="text-muted-foreground mt-2">Page not found</p>
  //       </div>
  //     </div>
  //   ),
  // },
]);
