import type { MuscleGroup } from "../api/exercises";
import { MUSCLE_GROUPS } from "@/shared/utils";
import { SelectContent, SelectItem, SelectTrigger, Select } from "./ui/select";
import { useTranslation } from "react-i18next";

interface SelectMuscleGroupProps {
  value: MuscleGroup | "all";
  onChange: (value: MuscleGroup | "all") => void;
}

export default function SelectMuscleGroup({
  value,
  onChange,
}: SelectMuscleGroupProps) {
  const { t } = useTranslation();

  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? value)}>
      <SelectTrigger className="w-40">
        <span className={value === "all" ? "text-muted-foreground" : ""}>
          {value === "all" ? t("admin.allMuscles") : t(`muscleGroups.${value}`)}
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("admin.allMuscles")}</SelectItem>
        {MUSCLE_GROUPS.map((g) => (
          <SelectItem key={g} value={g}>
            {t(`muscleGroups.${g}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
