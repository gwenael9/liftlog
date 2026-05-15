import { useTranslation } from "react-i18next";
import CalendarStats from "@/views/stats/components/CalendarStats";
import RecordStats from "@/views/stats/components/RecordStats";
import ProgressionStats from "@/views/stats/components/ProgressionStats";

export function StatsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">{t("stats.title")}</h2>

      <RecordStats />

      <div className="grid md:grid-cols-2 gap-4">
        <CalendarStats />
        <ProgressionStats />
      </div>
    </div>
  );
}
