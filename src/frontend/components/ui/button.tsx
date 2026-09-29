import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-[0.9rem] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:bg-sage-deep hover:text-white dark:bg-sage-deep dark:text-white dark:hover:bg-sage",
        outline:
          "border border-line bg-transparent text-foreground hover:border-line-strong hover:bg-background-elevated",
        ghost:
          "bg-transparent text-foreground-muted hover:bg-background-elevated hover:text-foreground",
        accent:
          "bg-sage-deep text-white hover:bg-foreground hover:text-background dark:bg-sage dark:hover:bg-sage-deep",
        clay:
          "bg-clay text-white hover:bg-foreground dark:bg-clay dark:hover:bg-foreground",
        danger:
          "bg-status-error text-white hover:bg-red-700 dark:bg-status-error dark:hover:bg-red-600",
        success:
          "bg-status-success text-white hover:bg-emerald-800 dark:bg-status-success",
      },
      size: {
        sm: "h-8 px-3 text-xs",
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
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
