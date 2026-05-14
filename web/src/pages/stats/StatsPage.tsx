import { useTranslation } from "react-i18next";
import CalendarStats from "@/components/stats/CalendarStats";
import RecordStats from "@/components/stats/RecordStats";
import ProgressionStats from "@/components/stats/ProgressionStats";

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
