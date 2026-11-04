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
import { CompanyDetailsPage } from "@/features/companies/company-details-page";
import { CompaniesPage } from "@/features/companies/companies-page";
import { DealDetailsPage } from "@/features/deals/deal-details-page";
import { DealsPage } from "@/features/deals/deals-page";
import { TasksPage } from "@/features/tasks/tasks-page";
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
      { path: "companies/:companyId", element: <CompanyDetailsPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "deals/:dealId", element: <DealDetailsPage /> },
      { path: "deals", element: <DealsPage /> },
      {
        path: "tasks",
        element: <TasksPage />,
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
