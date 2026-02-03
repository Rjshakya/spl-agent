import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout.js";
import { HomePage } from "@/pages/HomePage.js";
import { ChatPage } from "@/pages/ChatPage.js";
import { ConnectionsPage } from "@/pages/ConnectionsPage.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
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
  {
    path: "*",
    element: (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground mt-2">Page not found</p>
        </div>
      </div>
    ),
  },
]);
