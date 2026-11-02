import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { AuthApiError, authApi } from "@/features/auth/auth.api";
import { useAuth } from "./auth-state";

const registerFormSchema = z.object({
  username: z.string().trim().min(3, "Use at least 3 characters.").max(50),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});

const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Enter your password."),
});

type RegisterFields = z.infer<typeof registerFormSchema>;
type LoginFields = z.infer<typeof loginFormSchema>;

interface GoogleCredentialResponse {
  credential?: string;
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      prompt: (callback: (notification: GooglePromptNotification) => void) => void;
    };
  };
}

function PasswordInput({
  label,
  placeholder,
  error,
  registration,
  autoComplete,
}: {
  label: string;
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn<"password">;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const name = "password" as const;
  return (
    <Input
      id={name}
      label={label}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      placeholder={placeholder}
      error={error}
      leading={<LockKeyhole aria-hidden="true" />}
      trailing={
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className="grid size-8 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      }
      {...registration}
    />
  );
}

function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const continueTo = (location.state as { from?: string } | null)?.from ?? "/app";

  useEffect(() => {
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    const checkReady = () =>
      setGoogleReady(Boolean((window as Window & { google?: GoogleIdentity }).google));

    checkReady();
    script?.addEventListener("load", checkReady);
    return () => script?.removeEventListener("load", checkReady);
  }, []);

  const startGoogleSignIn = async () => {
    const google = (window as Window & { google?: GoogleIdentity }).google;
    if (!clientId || !google || !googleReady) {
      setError("Google sign-in is not ready yet. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const complete = (callback: () => void) => {
          if (settled) return;
          settled = true;
          callback();
        };

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: GoogleCredentialResponse) => {
            if (!response.credential) {
              complete(() =>
                reject(new Error("Google did not return a sign-in credential.")),
              );
              return;
            }
            void loginWithGoogle(response.credential).then(
              () => complete(resolve),
              (requestError: unknown) => complete(() => reject(requestError)),
            );
          },
        });
        google.accounts.id.prompt((notification: GooglePromptNotification) => {
          if (
            !settled &&
            (notification.isNotDisplayed() || notification.isSkippedMoment())
          ) {
            complete(() =>
              reject(new Error("Google sign-in was closed before completion.")),
            );
          }
        });
      });
      navigate(continueTo, { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Google sign-in failed.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {clientId ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          loading={isLoading}
          disabled={!googleReady || isLoading}
          className="w-full rounded-md"
          icon={<img src="/icons/google-icon.svg" alt="" className="size-4" />}
          onClick={() => void startGoogleSignIn()}
        >
          Continue with Google
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          className="w-full rounded-md"
        >
          Continue with Google
        </Button>
      )}
      <AuthError message={error} />
      {!clientId ? (
        <p className="text-center text-xs text-muted-foreground">
          Google sign-in needs a client ID in this environment.
        </p>
      ) : !googleReady ? (
        <p className="text-center text-xs text-muted-foreground">
          Loading Google sign-in…
        </p>
      ) : null}
    </div>
  );
}

function AuthDivider() {
  return (
    <div
      className="flex items-center gap-3 text-xs text-muted-foreground"
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-border" />
      or continue with email
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function RegisterPage() {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<RegisterFields>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: "", email: "", password: "" },
  });
  const continueTo = (location.state as { from?: string } | null)?.from ?? "/app";

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createAccount(values);
      navigate(continueTo, { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Account creation failed.",
      );
    }
  });

  return (
    <section aria-labelledby="auth-title">
      <h2 id="auth-title" className="text-2xl font-semibold">
        Create your account
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Join Relio and take control of your business relationships.
      </p>
      <div className="mt-6 flex flex-col gap-5">
        <GoogleSignInButton />
        <AuthDivider />
        <form
          noValidate
          onSubmit={(event) => void submit(event)}
          className="flex flex-col gap-4"
        >
          <Input
            id="username"
            label="Username"
            autoComplete="username"
            placeholder="Choose a username"
            leading={<UserRound aria-hidden="true" />}
            error={form.formState.errors.username?.message}
            {...form.register("username")}
          />
          <Input
            id="register-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leading={<Mail aria-hidden="true" />}
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            registration={form.register("password")}
          />
          <AuthError message={submitError} />
          <Button
            type="submit"
            size="lg"
            loading={form.formState.isSubmitting}
            className="mt-1 w-full rounded-md"
          >
            Create account
          </Button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<LoginFields>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const continueTo = (location.state as { from?: string } | null)?.from ?? "/app";

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values);
      navigate(continueTo, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Sign-in failed.");
    }
  });

  return (
    <section aria-labelledby="auth-title">
      <h2 id="auth-title" className="text-2xl font-semibold">
        Welcome back
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sign in to pick up where your relationships left off.
      </p>
      <div className="mt-6 flex flex-col gap-5">
        <GoogleSignInButton />
        <AuthDivider />
        <form
          noValidate
          onSubmit={(event) => void submit(event)}
          className="flex flex-col gap-4"
        >
          <Input
            id="login-email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            leading={<Mail aria-hidden="true" />}
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={form.formState.errors.password?.message}
            registration={form.register("password")}
          />
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <AuthError message={submitError} />
          <Button
            type="submit"
            size="lg"
            loading={form.formState.isSubmitting}
            className="w-full rounded-md"
          >
            Sign in
          </Button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Relio?{" "}
        <Link
          to="/auth/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({ email: z.string().trim().email("Enter a valid email address.") }),
    ),
    defaultValues: { email: "" },
  });

  const submit = form.handleSubmit(async ({ email }) => {
    setError(null);
    setMessage(null);
    try {
      const result = await authApi.forgotPassword(email);
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError instanceof AuthApiError
          ? requestError.message
          : "We couldn't request a reset link. Please try again.",
      );
    }
  });

  return (
    <section aria-labelledby="auth-title">
      <h2 id="auth-title" className="text-2xl font-semibold">
        Reset your password
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Enter the email address on your account and we’ll send a reset link.
      </p>
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="mt-6 flex flex-col gap-4"
      >
        <Input
          id="reset-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leading={<Mail aria-hidden="true" />}
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        {message ? (
          <p role="status" className="text-sm text-success">
            {message}
          </p>
        ) : null}
        <AuthError message={error} />
        <Button
          type="submit"
          size="lg"
          loading={form.formState.isSubmitting}
          className="w-full rounded-md"
        >
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          to="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </section>
  );
}

export function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(
      z
        .object({
          password: z.string().min(8, "Use at least 8 characters.").max(128),
          confirmPassword: z.string(),
        })
        .refine((value) => value.password === value.confirmPassword, {
          path: ["confirmPassword"],
          message: "Passwords do not match.",
        }),
    ),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const submit = form.handleSubmit(async ({ password }) => {
    setSubmitError(null);
    setMessage(null);
    try {
      const result = await authApi.resetPassword(token, password);
      setMessage(result.message);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Password reset failed.");
    }
  });

  return (
    <section aria-labelledby="auth-title">
      <h2 id="auth-title" className="text-2xl font-semibold">
        Choose a new password
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Create a new password for your Relio account.
      </p>
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="mt-6 flex flex-col gap-4"
      >
        {!token ? <AuthError message="This reset link is missing its token." /> : null}
        <PasswordInput
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          registration={form.register("password")}
        />
        <Input
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          leading={<LockKeyhole aria-hidden="true" />}
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
        {message ? (
          <p role="status" className="text-sm text-success">
            {message}{" "}
            <Link to="/auth/login" className="font-medium underline">
              Sign in
            </Link>
          </p>
        ) : null}
        <AuthError message={submitError} />
        <Button
          type="submit"
          size="lg"
          loading={form.formState.isSubmitting}
          disabled={!token}
          className="w-full rounded-md"
        >
          Reset password
        </Button>
      </form>
    </section>
  );
}
