import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/button";
import { useAuth } from "@/features/auth/auth-state";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, status, error, refreshUser } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
        <p role="status" className="text-sm text-muted-foreground">
          Restoring your session…
        </p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
        <section className="flex max-w-sm flex-col items-center gap-4 text-center">
          <h1 className="text-lg font-semibold">We couldn’t restore your session</h1>
          <p className="text-sm text-muted-foreground">
            {error ?? "Check your connection and try again."}
          </p>
          <Button type="button" onClick={() => void refreshUser()}>
            Try again
          </Button>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
