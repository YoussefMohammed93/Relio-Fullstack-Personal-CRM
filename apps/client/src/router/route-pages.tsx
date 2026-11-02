import { Link, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <Link to="/" className="text-lg font-semibold text-foreground">
          Relio
        </Link>
        <Outlet />
      </div>
    </main>
  );
}

export function PublicHome() {
  return (
    <section className="space-y-4 py-16">
      <h1 className="text-3xl font-semibold tracking-normal">
        Every relationship, well managed.
      </h1>
      <p className="max-w-prose text-sm leading-6 text-muted-foreground">
        The public product site is planned for a later phase.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          to="/auth/register"
          className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create account
        </Link>
        <Link
          to="/auth/login"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}

export function RoutePlaceholder({ message }: { message: string }) {
  return <p className="py-4 text-sm leading-6 text-muted-foreground">{message}</p>;
}

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <section className="max-w-md space-y-3 text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The page you requested does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Return to Relio
        </Link>
      </section>
    </main>
  );
}
