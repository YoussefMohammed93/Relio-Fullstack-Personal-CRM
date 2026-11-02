export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string;
  themePreference: "light" | "dark" | "system";
  notificationPreferences: {
    taskReminders: boolean;
    overdueTasks: boolean;
    upcomingFollowUps: boolean;
    dealWon: boolean;
    dealLost: boolean;
    approachingDealClosingDates: boolean;
  };
  defaultCurrency: "USD";
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProfileInput {
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  themePreference?: AuthUser["themePreference"];
  notificationPreferences?: Partial<AuthUser["notificationPreferences"]>;
  defaultCurrency?: "USD";
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !envelope.success || envelope.data === null) {
    throw new AuthApiError(
      envelope.error?.message ?? "Something went wrong. Please try again.",
      response.status,
    );
  }

  return envelope.data;
}

function sendJson<T>(path: string, method: string, body: unknown) {
  return request<T>(path, { method, body: JSON.stringify(body) });
}

export const authApi = {
  register: (input: RegisterInput) =>
    sendJson<AuthUser>("/auth/register", "POST", input),
  login: (input: LoginInput) => sendJson<AuthUser>("/auth/login", "POST", input),
  googleLogin: (credential: string) =>
    sendJson<AuthUser>("/auth/google", "POST", { credential }),
  currentUser: () => request<AuthUser>("/users/me"),
  logout: () => sendJson<{ message: string }>("/auth/logout", "POST", {}),
  forgotPassword: (email: string) =>
    sendJson<{ message: string }>("/auth/forgot-password", "POST", { email }),
  resetPassword: (token: string, password: string) =>
    sendJson<{ message: string }>("/auth/reset-password", "POST", {
      token,
      password,
    }),
  updateProfile: (input: ProfileInput) =>
    sendJson<AuthUser>("/users/me", "PATCH", input),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return request<{
      publicId: string;
      secureUrl: string;
      format: string;
      bytes: number;
    }>("/uploads/avatar", { method: "POST", body: formData });
  },
  changePassword: (currentPassword: string, newPassword: string) =>
    sendJson<{ message: string }>("/users/me/password", "PATCH", {
      currentPassword,
      newPassword,
    }),
  deleteAccount: (confirmation: { currentPassword?: string; confirmEmail?: string }) =>
    request<{ message: string }>("/users/me", {
      method: "DELETE",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(confirmation),
    }),
};
