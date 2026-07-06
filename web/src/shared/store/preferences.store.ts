import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/shared/i18n";

export type Theme = "light" | "dark";

export interface StoredPreferences {
  language?: string;
  theme?: string;
}

interface PreferencesState {
  language: string;
  theme: Theme;
  setLanguage: (lang: string) => void;
  setTheme: (theme: Theme) => void;
  hydrate: (prefs: StoredPreferences | null) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: "fr",
      theme: "light",
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        localStorage.setItem("lang", language);
        set({ language });
      },
      setTheme: (theme) => set({ theme }),
      hydrate: (prefs) => {
        if (!prefs) return;
        const update: Partial<Pick<PreferencesState, "language" | "theme">> =
          {};
        if (prefs.theme === "light" || prefs.theme === "dark")
          update.theme = prefs.theme;
        if (prefs.language) {
          i18n.changeLanguage(prefs.language);
          localStorage.setItem("lang", prefs.language);
          update.language = prefs.language;
        }
        if (Object.keys(update).length) set(update);
      },
    }),
    { name: "preferences" },
  ),
);
