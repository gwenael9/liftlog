import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import type { TemplateExerciseItemDto } from "@/shared/api/templates";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface ExerciseRow extends TemplateExerciseItemDto {
  _key: string;
}

interface SortableRowProps {
  row: ExerciseRow;
  canEdit: boolean;
  getExerciseName: (id: string) => string;
  onRemove: (key: string) => void;
}

function SortableExerciseRow({ row, canEdit, getExerciseName, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row._key,
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <GripVertical
        className={`size-4 shrink-0 ${canEdit ? "text-muted-foreground cursor-grab active:cursor-grabbing" : "text-muted-foreground/30"}`}
        {...(canEdit ? { ...attributes, ...listeners } : {})}
      />
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
  );
}

interface TemplateExerciseListProps {
  rows: ExerciseRow[];
  canEdit: boolean;
  getExerciseName: (id: string) => string;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onReorder: (activeKey: string, overKey: string) => void;
}

export function TemplateExerciseList({
  rows,
  canEdit,
  getExerciseName,
  onAdd,
  onRemove,
  onReorder,
}: TemplateExerciseListProps) {
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rows.map((r) => r._key)} strategy={verticalListSortingStrategy}>
            {rows.map((row) => (
              <SortableExerciseRow
                key={row._key}
                row={row}
                canEdit={canEdit}
                getExerciseName={getExerciseName}
                onRemove={onRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
