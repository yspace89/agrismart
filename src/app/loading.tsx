import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl pb-28 px-4 md:px-0 pt-4">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-64 md:w-80 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-48 md:w-96 rounded-md" />
      </div>

      {/* Top Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[120px] rounded-2xl md:rounded-3xl" />
        <Skeleton className="h-[120px] rounded-2xl md:rounded-3xl" />
        <Skeleton className="h-[120px] rounded-2xl md:rounded-3xl hidden lg:block" />
      </div>

      {/* Main Content Areas Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 mt-4 md:mt-8">
        <Skeleton className="h-[300px] md:h-[400px] rounded-2xl md:rounded-3xl" />
        <Skeleton className="h-[300px] md:h-[400px] rounded-2xl md:rounded-3xl" />
      </div>
    </div>
  );
}
