import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PageContainer } from "@/shared/components/layout/PageContainer";

export function TemplateDetailSkeleton() {
  return (
    <PageContainer>
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 shrink-0 rounded-md" />
        <Skeleton className="h-7 flex-1" />
        <Skeleton className="size-9 shrink-0 rounded-md" />
      </div>

      {/* Description */}
      <div className="-mt-2 pl-11">
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Stats + save */}
      <div className="border-t border-b py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Exercise list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-4 shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
