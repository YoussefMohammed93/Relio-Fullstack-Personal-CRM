import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-state";

function BrandMark() {
  return (
    <Link
      to="/"
      aria-label="Relio home"
      className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src="/logo-text.svg"
        alt="Relio"
        className="brand-wordmark-light h-11 w-auto"
      />
      <img
        src="/logo-text-dark.svg"
        alt="Relio"
        className="brand-wordmark-dark h-11 w-auto"
      />
    </Link>
  );
}

export function AuthLayout() {
  const { user, status } = useAuth();

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
        <p role="status" className="text-sm text-muted-foreground">
          Restoring your session…
        </p>
      </main>
    );
  }

  if (user) return <Navigate to="/app" replace />;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-48 -top-56 size-136 rounded-full bg-primary/5.5 blur-3xl" />
        <div className="absolute -right-48 -top-36 size-144 rounded-full bg-info/4.5 blur-3xl" />
        <div className="absolute inset-y-0 left-[47%] hidden w-px bg-border/60 lg:block" />
      </div>
      <div className="relative mx-auto grid min-h-screen w-full max-w-360 grid-cols-1 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="flex min-w-0 flex-col px-5 pb-9 pt-6 sm:px-9 sm:pt-8 lg:px-12 lg:pb-10 lg:pt-10 xl:px-16">
          <BrandMark />
          <div className="mx-auto mt-8 w-full max-w-xl lg:mt-[clamp(2rem,8vh,6.5rem)]">
            <p className="text-xs font-semibold uppercase text-primary">
              For independent work
            </p>
            <h1 className="mt-3 max-w-lg text-[2.4rem] font-semibold leading-[1.06] sm:text-5xl">
              Build stronger relationships with Relio.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Keep your contacts, opportunities, and follow-ups together in one calm
              workspace.
            </p>
            <div className="mt-4 hidden sm:block">
              <img
                src="/auth.png"
                alt="Illustrative Relio workspace concept with sample contact, deal, and pipeline metrics"
                className="h-auto w-full object-contain"
              />
              <p className="mt-1 text-center text-[11px] text-muted-foreground">
                Illustrative workspace preview
              </p>
            </div>
          </div>
          <p className="mt-auto hidden pt-10 text-xs text-muted-foreground lg:block">
            Built for freelancers and independent professionals.
          </p>
        </section>
        <section className="flex min-w-0 items-center justify-center px-4 pb-8 sm:px-8 lg:px-10 lg:py-10 xl:px-16">
          <div className="w-full max-w-124 rounded-lg border border-border/80 bg-card/95 px-5 py-7 shadow-[0_18px_60px_-42px_color-mix(in_oklab,var(--foreground)_25%,transparent)] sm:px-9 sm:py-9 lg:px-10 lg:py-10">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
