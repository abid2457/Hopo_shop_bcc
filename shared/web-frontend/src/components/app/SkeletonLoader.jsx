import { Skeleton } from "@/components/ui/skeleton";
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <div className="space-y-1.5 px-1">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
      <div className="lg:col-span-6 space-y-4">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-20 w-16 rounded-lg" />
          <Skeleton className="h-20 w-16 rounded-lg" />
          <Skeleton className="h-20 w-16 rounded-lg" />
        </div>
      </div>
      <div className="lg:col-span-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-12 rounded-xl" />
            <Skeleton className="h-10 w-12 rounded-xl" />
            <Skeleton className="h-10 w-12 rounded-xl" />
            <Skeleton className="h-10 w-12 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
