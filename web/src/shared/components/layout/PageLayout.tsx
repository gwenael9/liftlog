import { Plus } from "lucide-react";
import Loader from "@/shared/components/Loader";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface DialogConfig {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  content: React.ReactNode;
}

interface PageLayoutProps<T> {
  title: string;
  female?: boolean;
  data: {
    isLoading: boolean;
    items: T[] | undefined;
  };
  dialog: DialogConfig;
  subContent?: React.ReactNode;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout<T>({
  title,
  female = false,
  data,
  dialog,
  subContent,
  skeleton,
  children,
}: PageLayoutProps<T>) {
  const { t } = useTranslation();
  const items = data.items ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Collé en haut du scroll container (<main>) pendant le scroll */}
      <div className="sticky top-0 z-10 bg-background px-4 pt-4 pb-2 space-y-4 mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}s</h2>
          <Button size="sm" onClick={() => dialog.onOpenChange(true)}>
            <Plus className="size-4" />
            {t(`common.new_${female ? "female" : "male"}`, {
              title: title.toLowerCase(),
            })}
          </Button>
        </div>
        {subContent}
      </div>

      <Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
        <DialogContent
          title={
            dialog.title ??
            t(`common.new_${female ? "female" : "male"}`, {
              title: title.toLowerCase(),
            })
          }
        >
          {dialog.content}
        </DialogContent>
      </Dialog>

      <div className="px-4 pb-4 space-y-2">
        {data.isLoading && !skeleton && <Loader />}

        {!data.isLoading && items.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {t("common.noData")}
          </p>
        )}

        {data.isLoading && skeleton}
        {!data.isLoading && children}
      </div>
    </div>
  );
}
