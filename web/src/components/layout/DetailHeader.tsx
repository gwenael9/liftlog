import { ChevronLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DetailHeaderProps {
  onBack: () => void
  title: string
  subtitle?: React.ReactNode
  onDelete: () => void
}

export function DetailHeader({ onBack, title, subtitle, onDelete }: DetailHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ChevronLeft />
      </Button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold capitalize truncate">{title}</h1>
        {subtitle && <div className="text-sm">{subtitle}</div>}
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  )
}
