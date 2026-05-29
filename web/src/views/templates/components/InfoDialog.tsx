import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import { Button } from "@/shared/components/ui/button";

export interface TemplateInfoState {
  name: string;
  description: string;
  duration: string;
  isPublic: boolean;
}

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  info: TemplateInfoState;
  onChange: (patch: Partial<TemplateInfoState>) => void;
  onConfirm?: () => void;
  isConfirming?: boolean;
  infoChanged?: boolean;
}

export default function InfoDialog({
  open,
  onOpenChange,
  canEdit,
  info,
  onChange,
  onConfirm,
  isConfirming,
  infoChanged,
}: InfoDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t("templates.section.info")}>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t("templates.form.name")}</Label>
            <Input
              value={info.name}
              readOnly={!canEdit}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Push Day"
            />
          </div>
          <div className="space-y-1">
            <Label>{t("templates.form.description")}</Label>
            <Input
              value={info.description}
              readOnly={!canEdit}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder={t("common.optional")}
            />
          </div>
          <div className="space-y-1">
            <Label>{t("templates.form.duration")}</Label>
            <Input
              type="number"
              min={1}
              value={info.duration}
              readOnly={!canEdit}
              onChange={(e) => onChange({ duration: e.target.value })}
              placeholder="60"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("templates.visibility.label")}</Label>
              <p className="text-xs text-muted-foreground">
                {info.isPublic
                  ? t("templates.visibility.publicHint")
                  : t("templates.visibility.privateHint")}
              </p>
            </div>
            <Switch
              checked={info.isPublic}
              disabled={!canEdit}
              onCheckedChange={(v: boolean) => onChange({ isPublic: v })}
            />
          </div>
          {canEdit && onConfirm && (
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => onOpenChange(false)}
                disabled={!infoChanged || isConfirming}
                variant="outline"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={!infoChanged || isConfirming}
              >
                {t("common.confirm")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
