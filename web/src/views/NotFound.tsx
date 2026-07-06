import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="relative flex items-center justify-center">
        <span className="text-8xl font-bold text-muted-foreground/20 select-none">
          404
        </span>
        <Dumbbell className="absolute size-10 -rotate-45 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("notFound.title")}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("notFound.description")}
        </p>
      </div>

      <Button onClick={() => navigate("/sessions")}>
        <ArrowLeft className="size-4" />
        {t("notFound.backHome")}
      </Button>
    </div>
  );
}
