import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { SUPPORTED_LANGUAGES, type Language } from "@/shared/i18n";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language as Language;

  function toggle() {
    const next = SUPPORTED_LANGUAGES.find((l) => l !== current) ?? "fr";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  }

  return (
    <Button variant="outline" size="icon" onClick={toggle}>
      {current.toUpperCase()}
    </Button>
  );
}
