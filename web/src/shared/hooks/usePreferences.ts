import {
  usePreferencesStore,
  type Theme,
} from "@/shared/store/preferences.store";
import { useUpdateMe } from "@/shared/hooks/useAuth";
import { useAuthStore } from "@/shared/store/auth.store";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function usePreferences() {
  const store = usePreferencesStore();
  const updateMe = useUpdateMe();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();

  function setLanguage(lang: string) {
    store.setLanguage(lang);
    if (!isAuthenticated) return;
    updateMe.mutate(
      { preferences: { language: lang } },
      { onError: () => toast.error(t("account.saveError")) },
    );
  }

  function setTheme(theme: Theme) {
    store.setTheme(theme);
    if (!isAuthenticated) return;
    updateMe.mutate(
      { preferences: { theme } },
      { onError: () => toast.error(t("account.saveError")) },
    );
  }

  return {
    language: store.language,
    theme: store.theme,
    setLanguage,
    setTheme,
    isPending: updateMe.isPending,
  };
}
