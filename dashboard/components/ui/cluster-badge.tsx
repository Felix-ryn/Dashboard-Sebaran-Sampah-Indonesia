import { CLUSTER_BY_ID, softBg, softText } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { ClusterId } from "@/lib/types";

export function ClusterBadge({
  cluster,
  compact = false,
  className,
}: {
  cluster: ClusterId;
  compact?: boolean;
  className?: string;
}) {
  const meta = CLUSTER_BY_ID[cluster];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold",
        className,
      )}
      style={{ backgroundColor: softBg(meta.color), color: softText(meta.color) }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {compact ? meta.short : meta.label}
    </span>
  );
}
