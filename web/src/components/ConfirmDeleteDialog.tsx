import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onConfirm: () => void
  isPending?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  onConfirm,
  isPending,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title}>
        <p className="text-sm text-muted-foreground mb-4">{t('common.deleteWarning')}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {t('common.delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
