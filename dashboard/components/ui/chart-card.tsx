import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChartCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  footer?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn("flex-1 px-4 py-4 sm:px-5", bodyClassName)}>
        {children}
      </div>
      {footer ? (
        <div className="border-t border-slate-100 px-5 py-3 text-xs leading-5 text-slate-500">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
