import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PageContainer } from "@/shared/components/layout/PageContainer";

export function SessionDetailSkeleton() {
  return (
    <PageContainer>
      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="h-7 w-40 flex-1" />
        <Skeleton className="size-9 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 items-center px-1">
            <span />
            <Skeleton className="h-3.5 w-8" />
            <Skeleton className="h-3.5 w-12" />
            <span />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 items-center"
            >
              <Skeleton className="h-3.5 w-4 ml-auto" />
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="size-2 rounded-full" />
          ))}
        </div>
        <Skeleton className="size-9 rounded-md" />
      </div>

      <Skeleton className="h-9 w-full" />

      <div className="flex gap-2 flex-col">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-20 w-full" />
      </div>
    </PageContainer>
  );
}
