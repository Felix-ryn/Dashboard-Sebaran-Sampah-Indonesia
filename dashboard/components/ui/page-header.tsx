import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
