import { useTranslation } from 'react-i18next'
import { STATUS_COLORS } from '@/utils/status'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation()
  return (
    <span className={`${STATUS_COLORS[status]} ${className ?? ''}`}>
      {t(`status.${status}`)}
    </span>
  )
}
