import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import type { TemplateExerciseItemDto } from "@/shared/api/templates";

export interface ExerciseRow extends TemplateExerciseItemDto {
  _key: string;
}

interface TemplateExerciseListProps {
  rows: ExerciseRow[];
  canEdit: boolean;
  getExerciseName: (id: string) => string;
  onAdd: () => void;
  onRemove: (key: string) => void;
}

export function TemplateExerciseList({
  rows,
  canEdit,
  getExerciseName,
  onAdd,
  onRemove,
}: TemplateExerciseListProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t("templates.section.exercises")}
            {rows.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ×{rows.length}
              </span>
            )}
          </CardTitle>
          {canEdit && (
            <Button variant="ghost" onClick={onAdd}>
              <Plus className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            {t("templates.noExercises")}
          </p>
        )}
        {rows.map((row) => (
          <div key={row._key} className="flex items-center gap-2">
            <GripVertical className="size-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm font-medium truncate">
              {getExerciseName(row.exercise_id)}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              {row.target_sets != null && <span>{row.target_sets}×</span>}
              {row.target_duration_sec != null ? (
                <span>{row.target_duration_sec}s</span>
              ) : (
                row.target_reps != null && <span>{row.target_reps} rép</span>
              )}
              {row.rest_seconds != null && (
                <span>{row.rest_seconds}s repos</span>
              )}
            </div>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(row._key)}
              >
                <Trash2 className="size-3" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
