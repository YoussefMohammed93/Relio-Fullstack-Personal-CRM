import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([{ path: "*", element: null }]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
