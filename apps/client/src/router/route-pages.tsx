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

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <div className="w-full max-w-sm">
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
      <Link
        to="/app"
        className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Open the workspace
      </Link>
    </section>
  );
}

export function AuthPlaceholder({ title }: { title: string }) {
  return (
    <section className="space-y-3 py-10">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Authentication screens will be implemented in the authentication phase.
      </p>
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
