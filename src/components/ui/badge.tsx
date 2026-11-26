import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-line-strong/80 bg-background-elevated text-foreground-muted",
        sage: "border-sage/30 bg-sage-tint text-sage-deep",
        clay: "border-clay/35 bg-clay-tint text-champagne-deep dark:text-clay",
        neutral: "border-line/80 bg-background-card text-foreground-muted",
        outline: "border-line-strong bg-transparent text-foreground-muted",
        success: "border-status-success/30 bg-status-success-bg text-status-success",
        warning: "border-status-warning/30 bg-status-warning-bg text-status-warning",
        error: "border-status-error/30 bg-status-error-bg text-status-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
