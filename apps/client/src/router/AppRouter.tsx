import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";
import { ComponentSurfacePreview } from "@/app/component-surface-preview";
import { ThemeSurfacePreview } from "@/app/theme-surface-preview";
import { AuthLayout } from "@/features/auth/auth-layout";
import { AccountSettingsPage } from "@/features/auth/account-settings-page";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from "@/features/auth/auth-pages";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { ContactDetailsPage } from "@/features/contacts/contact-details-page";
import { ContactsPage } from "@/features/contacts/contacts-page";
import {
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
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RoutePlaceholder message="Dashboard metrics will appear here when the dashboard is implemented." />
        ),
      },
      { path: "contacts/:contactId", element: <ContactDetailsPage /> },
      { path: "contacts", element: <ContactsPage /> },
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
        element: <AccountSettingsPage />,
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
