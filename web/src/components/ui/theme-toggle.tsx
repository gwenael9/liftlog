import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/theme.store'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
