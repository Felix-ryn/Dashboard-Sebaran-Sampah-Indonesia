import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Kartu pembuka halaman: judul takeaway + satu-dua baris penjelasan. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-anim="card"
      className={cn(
        "flex min-w-0 flex-col justify-center overflow-hidden rounded-[28px] border border-black/[0.05] bg-white p-4",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F6C21B]" />
          {eyebrow}
        </p>
      ) : null}
      <h1 className="line-clamp-2 text-lg font-semibold leading-[22px] tracking-tight text-[#16181D]">
        {title}
      </h1>
      <p
        title={description}
        className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500"
      >
        {description}
      </p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
