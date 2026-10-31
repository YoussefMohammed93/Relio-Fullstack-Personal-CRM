import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";
import { ThemeSurfacePreview } from "@/app/theme-surface-preview";

const router = createBrowserRouter([
  ...(import.meta.env.DEV
    ? [{ path: "/__theme-preview", element: <ThemeSurfacePreview /> }]
    : []),
  { path: "*", element: <AppShell /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
