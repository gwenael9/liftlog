import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useExercises } from "@/shared/hooks/useSessions";
import { useAdminUsers, useAdminTemplates } from "@/views/admin/hooks/useAdmin";
import TemplatesTable from "@/views/admin/components/TemplatesTable";
import UsersTable from "@/views/admin/components/UsersTable";
import ExercicesTable from "@/views/admin/components/ExercicesTable";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

type Tab = "exercises" | "users" | "templates";

type TabsType = {
  key: Tab;
  label: string;
};

export function AdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("exercises");

  const { data: exercises = [] } = useExercises();
  const { data: users = [] } = useAdminUsers();
  const { data: templates = [] } = useAdminTemplates();

  const TABS: TabsType[] = [
    {
      key: "exercises",
      label: t("admin.tabs.exercises", { count: exercises.length }),
    },
    { key: "users", label: t("admin.tabs.users", { count: users.length }) },
    {
      key: "templates",
      label: t("admin.tabs.templates", { count: templates.length }),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">{t("admin.title")}</h2>

      <Tabs defaultValue="exercises">
        <TabsList variant="line">
          {TABS.map(({ key, label }) => (
            <TabsTrigger key={key} value={key} onClick={() => setTab(key)}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "exercises" && <ExercicesTable data={exercises} />}
      {tab === "users" && <UsersTable data={users} />}
      {tab === "templates" && <TemplatesTable data={templates} />}
    </div>
  );
}
