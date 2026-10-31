import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/providers/use-theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return <ThemeToggle onValueChange={setTheme} value={theme} variant="segmented" />;
}
