import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-line-strong bg-background-elevated text-foreground-muted",
        sage: "border-sage/30 bg-sage-tint text-sage-deep font-semibold",
        clay: "border-clay/30 bg-clay-tint text-clay font-semibold",
        neutral: "border-line bg-background-card text-foreground-muted",
        outline: "border-line-strong bg-transparent text-foreground-muted",
        success: "border-status-success/30 bg-status-success-bg text-status-success font-semibold",
        warning: "border-status-warning/30 bg-status-warning-bg text-status-warning font-semibold",
        error: "border-status-error/30 bg-status-error-bg text-status-error font-semibold",
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
