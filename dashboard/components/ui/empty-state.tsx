import { SearchX } from "lucide-react";

export function EmptyState({
  title = "Tidak ada data",
  description = "Coba ubah atau reset filter untuk menampilkan data.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <SearchX className="h-5 w-5" />
      </span>
      <p className="mt-3 text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
