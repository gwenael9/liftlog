import { ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface DetailHeaderProps {
  onBack: () => void;
  title: string;
  subtitle?: React.ReactNode;
  onDelete?: () => void;
  subHeader?: React.ReactNode;
}

export function DetailHeader({
  onBack,
  title,
  subtitle,
  onDelete,
  subHeader,
}: DetailHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold capitalize truncate">{title}</h2>
          {subtitle && (
            <div className="text-sm truncate text-gray-400">{subtitle}</div>
          )}
        </div>
        {onDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="text-destructive" />
          </Button>
        )}
      </div>
      <div className="flex gap-2">{subHeader}</div>
    </>
  );
}
