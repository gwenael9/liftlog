import { useTranslation } from 'react-i18next'
import { Button } from './button'
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.language as Language

  function toggle() {
    const next = SUPPORTED_LANGUAGES.find((l) => l !== current) ?? 'fr'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="font-mono text-xs px-2">
      {current.toUpperCase()}
    </Button>
  )
}
