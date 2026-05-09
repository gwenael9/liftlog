import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/sessions', label: 'Séances' },
  { to: '/templates', label: 'Templates' },
  { to: '/stats', label: 'Stats' },
]

export function AppLayout() {
  const logout = useLogout()
  const { pathname } = useLocation()
  const role = useAuthStore((s) => s.role)

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
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="destructive" size="sm" onClick={logout}>
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
