import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";

const router = createBrowserRouter([{ path: "*", element: <AppShell /> }]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
