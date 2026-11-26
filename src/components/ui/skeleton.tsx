import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line/60 bg-background-card p-4 shadow-card">
      <Skeleton className="mb-4 aspect-[4/3] w-full rounded-xl" />
      <Skeleton className="mb-2 h-3 w-1/3" />
      <Skeleton className="mb-3 h-5 w-4/5" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <div className="flex items-center justify-between pt-2 border-t border-line/50">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}
