import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";
import { ComponentSurfacePreview } from "@/app/component-surface-preview";
import { ThemeSurfacePreview } from "@/app/theme-surface-preview";
import {
  AuthLayout,
  AuthPlaceholder,
  NotFoundPage,
  PublicHome,
  PublicLayout,
  RoutePlaceholder,
} from "@/router/route-pages";

const router = createBrowserRouter([
  ...(import.meta.env.DEV
    ? [
        { path: "/__theme-preview", element: <ThemeSurfacePreview /> },
        { path: "/__components-preview", element: <ComponentSurfacePreview /> },
      ]
    : []),
  {
    path: "/",
    element: <PublicLayout />,
    children: [{ index: true, element: <PublicHome /> }],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <AuthPlaceholder title="Login" /> },
      { path: "register", element: <AuthPlaceholder title="Create account" /> },
      { path: "forgot-password", element: <AuthPlaceholder title="Reset password" /> },
      {
        path: "reset-password",
        element: <AuthPlaceholder title="Choose a new password" />,
      },
    ],
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RoutePlaceholder message="Dashboard metrics will appear here when the dashboard is implemented." />
        ),
      },
      {
        path: "contacts",
        element: (
          <RoutePlaceholder message="Contact management is not implemented yet." />
        ),
      },
      {
        path: "companies",
        element: (
          <RoutePlaceholder message="Company management is not implemented yet." />
        ),
      },
      {
        path: "deals",
        element: <RoutePlaceholder message="Deal management is not implemented yet." />,
      },
      {
        path: "tasks",
        element: <RoutePlaceholder message="Task management is not implemented yet." />,
      },
      {
        path: "calendar",
        element: (
          <RoutePlaceholder message="Calendar functionality is not implemented yet." />
        ),
      },
      {
        path: "activities",
        element: (
          <RoutePlaceholder message="Activity management is not implemented yet." />
        ),
      },
      {
        path: "notifications",
        element: <RoutePlaceholder message="Notifications are not implemented yet." />,
      },
      {
        path: "settings",
        element: (
          <RoutePlaceholder message="Account settings are not implemented yet." />
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
