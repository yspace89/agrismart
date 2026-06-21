import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6 w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[180px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
