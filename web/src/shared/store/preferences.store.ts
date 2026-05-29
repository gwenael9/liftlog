import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/shared/i18n'

export type Theme = 'light' | 'dark'

export interface StoredPreferences {
  language?: string
  theme?: string
  couleur_primary?: string
}

interface PreferencesState {
  language: string
  theme: Theme
  couleur_primary: string
  setLanguage: (lang: string) => void
  setTheme: (theme: Theme) => void
  setCouleurPrimary: (color: string) => void
  hydrate: (prefs: StoredPreferences | null) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'fr',
      theme: 'light',
      couleur_primary: '#3b82f6',
      setLanguage: (language) => {
        i18n.changeLanguage(language)
        localStorage.setItem('lang', language)
        set({ language })
      },
      setTheme: (theme) => set({ theme }),
      setCouleurPrimary: (couleur_primary) => set({ couleur_primary }),
      hydrate: (prefs) => {
        if (!prefs) return
        const update: Partial<Pick<PreferencesState, 'language' | 'theme' | 'couleur_primary'>> = {}
        if (prefs.theme === 'light' || prefs.theme === 'dark') update.theme = prefs.theme
        if (prefs.language) {
          i18n.changeLanguage(prefs.language)
          localStorage.setItem('lang', prefs.language)
          update.language = prefs.language
        }
        if (prefs.couleur_primary) update.couleur_primary = prefs.couleur_primary
        if (Object.keys(update).length) set(update)
      },
    }),
    { name: 'preferences' }
  )
)
