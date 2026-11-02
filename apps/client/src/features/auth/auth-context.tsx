import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import {
  authApi,
  AuthApiError,
  type AuthUser,
  type LoginInput,
  type ProfileInput,
  type RegisterInput,
} from "@/features/auth/auth.api";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from "@/features/auth/auth-state";
import { useTheme } from "@/providers/use-theme";

export function AuthProvider({ children }: PropsWithChildren) {
  const { setTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const current = await authApi.currentUser();
      setUser(current);
      setTheme(current.themePreference);
      setStatus("authenticated");
      setError(null);
      return current;
    } catch (requestError) {
      setUser(null);
      if (requestError instanceof AuthApiError && requestError.status === 401) {
        setStatus("unauthenticated");
        setError(null);
        return null;
      }
      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't restore your session.",
      );
      return null;
    }
  }, [setTheme]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const establishSession = async (operation: Promise<AuthUser>) => {
    setError(null);
    try {
      const nextUser = await operation;
      setUser(nextUser);
      setTheme(nextUser.themePreference);
      setStatus("authenticated");
      return nextUser;
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unable to sign in.";
      setError(message);
      throw requestError;
    }
  };

  const login = (input: LoginInput) => establishSession(authApi.login(input));
  const register = (input: RegisterInput) => establishSession(authApi.register(input));
  const loginWithGoogle = (credential: string) =>
    establishSession(authApi.googleLogin(credential));

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  const updateProfile = async (input: ProfileInput) => {
    const updatedUser = await authApi.updateProfile(input);
    setUser(updatedUser);
    if (input.themePreference) setTheme(updatedUser.themePreference);
    return updatedUser;
  };

  const value: AuthContextValue = {
    user,
    status,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
    updateProfile,
    clearAuthError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
