import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/features/auth/auth-state";
import { useNotifications } from "@/providers/notification-provider";
import { useTheme } from "@/providers/use-theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { notify } = useNotifications();

  const changeTheme = (nextTheme: "light" | "dark" | "system") => {
    setTheme(nextTheme);
    if (user) {
      void updateProfile({ themePreference: nextTheme }).catch((error: unknown) => {
        notify({
          title: "Theme preference could not be saved.",
          description: error instanceof Error ? error.message : undefined,
          variant: "error",
        });
      });
    }
  };

  return <ThemeToggle onValueChange={changeTheme} value={theme} variant="segmented" />;
}
