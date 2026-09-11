import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "mb-3 flex items-center gap-2 text-sm text-sage-deep",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-balance font-display text-3xl leading-[1.15] text-ink md:text-[2.5rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
    </div>
  );
}
