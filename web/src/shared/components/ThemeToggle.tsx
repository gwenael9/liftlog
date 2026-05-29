import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { usePreferences } from "@/shared/hooks/usePreferences";

export function ThemeToggle() {
  const { theme, setTheme } = usePreferences();

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
