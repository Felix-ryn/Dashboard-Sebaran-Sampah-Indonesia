import { Lightbulb, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function InsightPanel({
  title = "Insight",
  children,
  tone = "info",
  className,
}: {
  title?: string;
  children: ReactNode;
  tone?: "info" | "warning";
  className?: string;
}) {
  const isWarning = tone === "warning";
  const Icon = isWarning ? TriangleAlert : Lightbulb;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        isWarning
          ? "border-amber-200 bg-amber-50/70"
          : "border-blue-200/70 bg-blue-50/60",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isWarning
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-700",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              isWarning ? "text-amber-800" : "text-blue-800",
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              "mt-1 text-sm leading-6",
              isWarning ? "text-amber-900" : "text-slate-700",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
