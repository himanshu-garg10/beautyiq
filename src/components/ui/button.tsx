import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[0.9rem] font-medium tracking-wide transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[image:var(--gradient-gold)] text-[#1A1510] font-semibold shadow-card hover:shadow-card-hover hover:brightness-[1.03]",
        primary:
          "bg-foreground text-background shadow-subtle hover:bg-sage-deep hover:text-white hover:shadow-card dark:bg-sage-deep dark:text-white dark:hover:bg-sage",
        outline:
          "border border-line-strong/80 bg-background-card/70 text-foreground shadow-xs hover:border-champagne/60 hover:bg-background-elevated hover:shadow-subtle",
        ghost:
          "bg-transparent text-foreground-muted hover:bg-background-elevated/80 hover:text-foreground",
        "ghost-gold":
          "bg-transparent text-champagne-deep dark:text-champagne hover:text-foreground underline-offset-4 hover:underline hover:decoration-champagne",
        accent:
          "bg-[image:var(--gradient-gold)] text-[#1A1510] font-semibold shadow-card hover:shadow-card-hover hover:brightness-[1.03]",
        clay:
          "bg-clay text-white shadow-subtle hover:bg-foreground hover:text-background hover:shadow-card dark:bg-clay dark:hover:bg-foreground",
        danger:
          "bg-status-error text-white shadow-subtle hover:bg-red-700 dark:bg-status-error dark:hover:bg-red-600",
        success:
          "bg-status-success text-white shadow-subtle hover:bg-emerald-800 dark:bg-status-success",
      },
      size: {
        sm: "h-8 px-3.5 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base font-semibold",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isBusy = isLoading || loading;
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isBusy}
        {...props}
      >
        {isBusy ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isBusy && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
