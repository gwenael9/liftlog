import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { useTranslation } from "react-i18next";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  const { t } = useTranslation();
  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("common.search")}
        className="pl-8 h-8 text-sm w-full bg-red-200"
      />
    </div>
  );
}
