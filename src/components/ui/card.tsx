import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-white/60 transition-colors duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
