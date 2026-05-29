import { Button } from "./ui/button";
import { SUPPORTED_LANGUAGES } from "@/shared/i18n";
import { usePreferences } from "@/shared/hooks/usePreferences";

export function LanguageToggle() {
  const { language, setLanguage } = usePreferences();

  function toggle() {
    const next = SUPPORTED_LANGUAGES.find((l) => l !== language) ?? "fr";
    setLanguage(next);
  }

  return (
    <Button variant="outline" size="icon" onClick={toggle}>
      {language.toUpperCase()}
    </Button>
  );
}
