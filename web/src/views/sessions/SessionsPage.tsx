import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import PageLayout from "@/shared/components/layout/PageLayout";
import {
  useSessions,
  useCreateSession,
  useDeleteSession,
} from "@/shared/hooks/useSessions";
import { useTemplates } from "@/shared/hooks/useTemplates";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { sessionsApi, type CreateSetDto } from "@/shared/api/sessions";
import {
  formatMonth,
  formatSessionDate,
  toDateString,
  toMonthString,
} from "@/shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function SessionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const monthStr = toMonthString(currentMonth);
  const { data: sessions, isLoading } = useSessions(monthStr);
  const { data: templates } = useTemplates();
  const createSession = useCreateSession(monthStr);
  const deleteSession = useDeleteSession();

  async function handleCreate() {
    setIsCreating(true);
    try {
      const result = await createSession.mutateAsync({
        scheduled_date: toDateString(selectedDate),
        template_id: selectedTemplateId || undefined,
      });

      const sessionId = result.id;
      if (!sessionId) return;

      if (selectedTemplateId && templates) {
        const template = templates.find((t) => t.id === selectedTemplateId);
        const exercises = (template?.template_exercises ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index);

        const setsToCreate: CreateSetDto[] = [];
        for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
          const ex = exercises[exIdx];
          const setCount = ex.target_sets ?? 1;
          for (let i = 1; i <= setCount; i++) {
            setsToCreate.push({
              exercise_id: ex.exercise_id,
              set_index: i,
              exercise_order: exIdx,
            });
          }
        }
        if (setsToCreate.length > 0) {
          await sessionsApi.bulkUpdateSets(sessionId, {
            updates: [],
            creates: setsToCreate,
          });
        }
      }

      toast.success(t("sessions.created"));
      navigate(`/sessions/${sessionId}`);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteSession.mutateAsync(deleteId);
    toast.success(t("sessions.deleted"));
    setDeleteId(null);
  }

  const sorted = sessions
    ?.slice()
    .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));

  const dialogContent = (
    <div className="flex flex-col items-center gap-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(d) => d && setSelectedDate(d)}
      />

      {templates && templates.length > 0 && (
        <div className="w-full space-y-1">
          <Label>{t("sessions.templateOptional")}</Label>
          <Select
            value={selectedTemplateId}
            onValueChange={(v) =>
              setSelectedTemplateId(v && v !== "__none__" ? v : "")
            }
          >
            <SelectTrigger className="w-full">
              {selectedTemplateId ? (
                <span>
                  {templates.find((t) => t.id === selectedTemplateId)?.name}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {t("sessions.noTemplate")}
                </span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                {t("sessions.noTemplate")}
              </SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button className="w-full" onClick={handleCreate} disabled={isCreating}>
        {isCreating ? t("sessions.creating") : t("sessions.create")}
      </Button>
    </div>
  );

  const monthNav = (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
        }
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm font-medium capitalize">
        {formatMonth(currentMonth)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
        }
      >
        <ChevronRight />
      </Button>
    </div>
  );

  const sessionSkeleton = (
    <>
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-1/2" />
            <div className="ml-auto">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </>
  );

  return (
    <>
      <PageLayout
        title={t("sessions.title")}
        female
        data={{ isLoading, items: sorted }}
        skeleton={sessionSkeleton}
        dialog={{
          open,
          onOpenChange: setOpen,
          title: t("sessions.newSession"),
          content: dialogContent,
        }}
        subContent={monthNav}
      >
        {sorted?.map((session) => {
          const sets = session.session_sets ?? [];
          const exerciseCount = new Set(sets.map((s) => s.exercise_id)).size;
          const templateName = session.template_id
            ? templates?.find((t) => t.id === session.template_id)?.name
            : null;
          return (
            <Card
              key={session.id}
              className="group cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
              onClick={() => navigate(`/sessions/${session.id}`)}
            >
              <CardHeader>
                <CardTitle className="capitalize text-base">
                  {formatSessionDate(session.scheduled_date)}
                </CardTitle>
                <CardAction className="flex items-center gap-2">
                  {templateName && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {templateName}
                    </span>
                  )}
                </CardAction>
              </CardHeader>
              <CardContent className="flex items-center">
                {exerciseCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("common.exerciseCount", { count: exerciseCount })}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(session.id);
                  }}
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </PageLayout>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t("sessions.deleteConfirm")}
        onConfirm={handleDelete}
        isPending={deleteSession.isPending}
      />
    </>
  );
}
