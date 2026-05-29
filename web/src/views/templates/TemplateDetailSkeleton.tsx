import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PageContainer } from "@/shared/components/layout/PageContainer";

export function TemplateDetailSkeleton() {
  return (
    <PageContainer>
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex-1 min-w-0 space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="size-9 rounded-md" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-20" />
      </div>

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
