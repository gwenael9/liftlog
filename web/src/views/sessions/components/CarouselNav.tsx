import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CarouselNavProps {
  total: number;
  activeIndex: number;
  onChange: (index: number) => void;
}

export function CarouselNav({ total, activeIndex, onChange }: CarouselNavProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.max(0, activeIndex - 1))}
        disabled={activeIndex === 0}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`size-2 rounded-full transition-colors ${
              i === activeIndex ? "bg-foreground" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.min(total - 1, activeIndex + 1))}
        disabled={activeIndex === total - 1}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
