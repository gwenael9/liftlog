import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
  Trash2,
  CalendarDays,
} from "lucide-react";
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
  formatSessionDateRow,
  formatWeekRange,
  toDateString,
  toMonthString,
} from "@/shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";

function getWeekStartStr(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return toDateString(monday);
}

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

  const groupedByWeek = useMemo(() => {
    if (!sorted) return [];
    const weekMap = new Map<string, typeof sorted>();
    for (const session of sorted) {
      const key = getWeekStartStr(session.scheduled_date);
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(session);
    }
    return Array.from(weekMap.entries()).map(([weekStart, sessions]) => ({
      weekStart,
      sessions,
    }));
  }, [sorted]);

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
    <div className="space-y-4">
      {[0, 1].map((w) => (
        <div key={w} className="space-y-1">
          <Skeleton className="h-4 w-40 mb-2" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-2">
              <div className="flex flex-col items-center w-8 gap-1">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-5 w-5" />
              </div>
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const buttonToday = (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setCurrentMonth(new Date())}
    >
      <CalendarDays className="size-4" />
    </Button>
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
        extraHeaderButton={buttonToday}
      >
        <div className="space-y-6">
          {groupedByWeek.map(({ weekStart, sessions }) => (
            <div key={weekStart}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {formatWeekRange(weekStart)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="rounded-lg overflow-hidden border divide-y">
                {sessions.map((session) => {
                  const sets = session.session_sets ?? [];
                  const exerciseCount = new Set(sets.map((s) => s.exercise_id))
                    .size;
                  const templateName = session.template_id
                    ? templates?.find((t) => t.id === session.template_id)?.name
                    : null;
                  const { weekday, day } = formatSessionDateRow(
                    session.scheduled_date,
                  );
                  return (
                    <div
                      key={session.id}
                      className="group flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/sessions/${session.id}`)}
                    >
                      <div className="flex flex-col items-center w-8 shrink-0 text-muted-foreground">
                        <span className="text-[10px] capitalize">
                          {weekday}
                        </span>
                        <span className="text-base font-semibold leading-none text-foreground">
                          {day}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {templateName && (
                          <Badge variant="secondary">{templateName}</Badge>
                        )}
                        {exerciseCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {t("common.exerciseCount", {
                              count: exerciseCount,
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 md:opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(session.id);
                          }}
                        >
                          <Trash2 className="text-destructive size-3.5" />
                        </Button>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
