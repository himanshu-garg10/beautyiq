import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-ivory-deep", className)}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-md border border-line p-4">
      <Skeleton className="mb-4 h-48 w-full" />
      <Skeleton className="mb-2 h-3 w-1/3" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
