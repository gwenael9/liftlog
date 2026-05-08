import { useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function DashboardPage() {
  const logout = useLogout()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-2">
        <ThemeToggle />
        <Button variant="outline" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  )
}
