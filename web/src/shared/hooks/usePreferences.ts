import {
  usePreferencesStore,
  type Theme,
} from "@/shared/store/preferences.store";
import { useUpdateMe } from "@/shared/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function usePreferences() {
  const store = usePreferencesStore();
  const updateMe = useUpdateMe();
  const { t } = useTranslation();

  function setLanguage(lang: string) {
    store.setLanguage(lang);
    updateMe.mutate(
      { preferences: { language: lang } },
      { onError: () => toast.error(t("account.saveError")) },
    );
  }

  function setTheme(theme: Theme) {
    store.setTheme(theme);
    updateMe.mutate(
      { preferences: { theme } },
      { onError: () => toast.error(t("account.saveError")) },
    );
  }

  function setCouleurPrimary(color: string) {
    store.setCouleurPrimary(color);
    updateMe.mutate(
      { preferences: { couleur_primary: color } },
      { onError: () => toast.error(t("account.saveError")) },
    );
  }

  return {
    language: store.language,
    theme: store.theme,
    couleur_primary: store.couleur_primary,
    setLanguage,
    setTheme,
    setCouleurPrimary,
    isPending: updateMe.isPending,
  };
}
