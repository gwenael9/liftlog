import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navLinks = [{ to: '/sessions', label: 'Séances' }]

export function AppLayout() {
  const logout = useLogout()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
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
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              Déconnexion
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
