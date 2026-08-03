import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { SquareArrowLeft } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export function PinDialog({ open, onSuccess, onClose }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => {
        setPin("");
        setError(false);
        inputRef.current?.focus();
      }, 100);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  function handleChange(value: string) {
    if (!/^\d*$/.test(value) || value.length > 4) return;
    setError(false);
    setPin(value);

    if (value.length === 4) {
      if (value === import.meta.env.VITE_DEV_PIN) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-56 flex flex-col items-center gap-4">
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-colors ${
                error
                  ? "border-destructive bg-destructive"
                  : pin.length > i
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
              }`}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={pin}
          onChange={(e) => handleChange(e.target.value)}
          className="opacity-0 absolute w-0 h-0"
          maxLength={4}
        />

        <div className="grid grid-cols-3 gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={n}
              type="button"
              variant="outline"
              onClick={() => handleChange(pin + n)}
            >
              {n}
            </Button>
          ))}
          <div />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleChange(pin + "0")}
          >
            0
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPin((p) => p.slice(0, -1))}
          >
            <SquareArrowLeft />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
