import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  color = "#2563EB",
  className,
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-slate-100",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
