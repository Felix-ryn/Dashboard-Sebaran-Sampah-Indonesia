import { formatNumber, formatPct } from "@/lib/format";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";

export function DominantList({
  items,
  total,
  unit = "wilayah",
}: {
  items: { key: string; label: string; count: number; color: string }[];
  total: number;
  unit?: string;
}) {
  if (total === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item) => {
        const share = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <div key={item.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="text-slate-500">
                <span className="font-semibold text-slate-900">
                  {formatNumber(item.count)}
                </span>{" "}
                {unit} · {formatPct(share)}
              </span>
            </div>
            <ProgressBar value={share} color={item.color} />
          </div>
        );
      })}
    </div>
  );
}
