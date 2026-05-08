import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

interface DialogContentProps {
  title?: string
  className?: string
  children: React.ReactNode
}

function DialogContent({ title, className, children }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[closed]:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md max-h-[90vh] overflow-y-auto',
          'bg-card border rounded-lg shadow-xl p-6',
          'transition-all data-[closed]:opacity-0 data-[closed]:scale-95',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title
            ? <DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>
            : <span />}
          <DialogPrimitive.Close className="rounded-sm opacity-60 hover:opacity-100 transition-opacity">
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export { Dialog, DialogTrigger, DialogClose, DialogContent }
