import { Plus } from 'lucide-react'
import Loader from '../Loader'
import { Button } from '../ui/button'
import { Dialog, DialogContent } from '../ui/dialog'
import { useTranslation } from 'react-i18next'

interface DialogConfig {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  content: React.ReactNode
}

interface PageLayoutProps<T> {
  title: string
  female?: boolean
  data: {
    isLoading: boolean
    items: T[] | undefined
  }
  dialog: DialogConfig
  subContent?: React.ReactNode
  children: React.ReactNode
}

export default function PageLayout<T>({
  title,
  female = false,
  data,
  dialog,
  subContent,
  children,
}: PageLayoutProps<T>) {
  const { t } = useTranslation()
  const items = data.items ?? []

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}s</h1>
        <Button size="sm" onClick={() => dialog.onOpenChange(true)}>
          <Plus className="size-4" />
          {t(`common.new_${female ? 'female' : 'male'}`, { title: title.toLowerCase() })}
        </Button>
      </div>

      <Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
        <DialogContent title={dialog.title ?? t(`common.new_${female ? 'female' : 'male'}`, { title: title.toLowerCase()})}>
          {dialog.content}
        </DialogContent>
      </Dialog>

      {subContent}

      {data.isLoading && <Loader />}

      {!data.isLoading && items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {t('common.noData')}
        </p>
      )}

      <div className="space-y-2">{children}</div>
    </div>
  )
}
