import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="space-y-3 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <Skeleton className="h-6 w-6 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonRow, SkeletonDashboard }