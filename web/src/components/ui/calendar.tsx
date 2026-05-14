import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarProps = DayPickerProps

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={fr}
      className={cn('relative p-3', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'space-y-3',
        month_caption: 'flex justify-center relative items-center h-7',
        caption_label: 'text-sm font-medium capitalize',
        nav: 'flex items-center justify-between absolute inset-x-3 top-3 z-10',
        button_previous:
          'size-7 flex items-center justify-center rounded-lg border border-input bg-transparent hover:bg-muted transition-colors',
        button_next:
          'size-7 flex items-center justify-center rounded-lg border border-input bg-transparent hover:bg-muted transition-colors',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-muted-foreground w-9 font-normal text-xs text-center pb-1',
        weeks: '',
        week: 'flex w-full',
        day: 'flex items-center justify-center p-0 w-9 h-9',
        day_button: cn(
          'size-9 p-0 text-sm rounded-lg font-normal',
          'hover:bg-accent hover:text-accent-foreground transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        ),
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
        today: '[&>button]:font-semibold',
        outside: '[&>button]:text-muted-foreground [&>button]:opacity-40',
        disabled: '[&>button]:text-muted-foreground [&>button]:opacity-30 [&>button]:pointer-events-none',
        hidden: 'invisible',
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left'
            ? <ChevronLeft className="size-4" />
            : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  )
}
