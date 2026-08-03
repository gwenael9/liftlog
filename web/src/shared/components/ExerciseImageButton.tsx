import { Eye } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface Props {
  exerciseSlug: string;
  children?: ReactNode;
}

export function ExerciseImageButton({ exerciseSlug, children }: Props) {
  const { t } = useTranslation();
  const [imageOpen, setImageOpen] = useState(false);
  const [imageAvailable, setImageAvailable] = useState(false);
  const imageSrc = `/exercices/${exerciseSlug}.png`;

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImageAvailable(true);
    img.onerror = () => setImageAvailable(false);
  }, [imageSrc]);

  if (!imageAvailable) return children ? <>{children}</> : null;

  return (
    <>
      <Button
        variant={children ? "link" : "ghost"}
        size={children ? "default" : "icon-sm"}
        onClick={() => setImageOpen(true)}
        title={t("exercises.viewImage")}
        className="p-0"
      >
        {children || <Eye className="size-4" />}
      </Button>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent title={t(`exercises.${exerciseSlug}`)}>
          <img
            src={imageSrc}
            alt={t(`exercises.${exerciseSlug}`)}
            className="w-full rounded-md object-contain max-h-96"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
