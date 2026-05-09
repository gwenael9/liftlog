import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function AppLayout() {
  const { t } = useTranslation()
  const logout = useLogout()
  const { pathname } = useLocation()
  const role = useAuthStore((s) => s.role)

  const navLinks = [
    { to: '/sessions', label: t('nav.sessions') },
    { to: '/templates', label: t('nav.templates') },
    { to: '/stats', label: t('nav.stats') },
  ]

  return (
    <div className="flex flex-col">
      <header className="border-b bg-card">
        <div className="px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-5">
            <Link to="/sessions" className="font-bold tracking-tight">
              LiftLog
            </Link>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm transition-colors',
                  pathname.startsWith(link.to)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
            {role === 'admin' && (
              <Link
                to="/admin"
                className={cn(
                  'text-sm transition-colors',
                  pathname.startsWith('/admin')
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('nav.admin')}
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="destructive" size="sm" onClick={logout}>
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
