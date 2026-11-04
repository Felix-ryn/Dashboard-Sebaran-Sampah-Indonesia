"use client";

import { cn } from "@/lib/cn";
import { TipBody, useHoverTip } from "@/components/ui/hover-tip";

export interface HeatColumn {
  key: string;
  label: string;
  format: (value: number) => string;
}

export interface HeatRow {
  key: string | number;
  label: string;
  swatch?: string;
  values: number[];
}

/**
 * Tabel dengan heatmap satu warna: angka tetap tertulis, kepekatan warna
 * dinormalisasi per kolom supaya pola mudah dipindai tanpa legenda warna ganda.
 */
export function HeatTable({
  columns,
  rows,
  rowHeader,
  activeKey = null,
  onSelect,
  rgb = "0, 114, 178",
}: {
  columns: HeatColumn[];
  rows: HeatRow[];
  rowHeader: string;
  activeKey?: string | number | null;
  onSelect?: (key: string | number) => void;
  rgb?: string;
}) {
  const ranges = columns.map((_, index) => {
    const column = rows.map((row) => row.values[index] ?? 0);
    return { min: Math.min(...column), max: Math.max(...column) };
  });
  const filtering = activeKey !== null && activeKey !== "all";
  const { bind, node } = useHoverTip();

  return (
    <div className="max-h-full overflow-auto">
      <div>
        <table className="w-full border-separate border-spacing-y-1 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold leading-tight text-slate-500">
              <th className="py-1 pr-3 font-semibold">{rowHeader}</th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-1.5 py-1 text-right font-semibold"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="group/body">
            {rows.map((row) => {
              const dimmed = filtering && String(activeKey) !== String(row.key);
              return (
                <tr
                  key={row.key}
                  onClick={onSelect ? () => onSelect(row.key) : undefined}
                  className={cn(
                    "transition-opacity duration-200 group-hover/body:opacity-55 hover:opacity-100!",
                    onSelect && "cursor-pointer",
                    dimmed && "opacity-45",
                  )}
                >
                  <th className="py-1.5 pr-2 text-left text-sm font-medium leading-tight text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      {row.swatch ? (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: row.swatch }}
                        />
                      ) : null}
                      {row.label}
                    </span>
                  </th>
                  {columns.map((column, index) => {
                    const { min, max } = ranges[index];
                    const t =
                      max > min ? (row.values[index] - min) / (max - min) : 0;
                    const rank =
                      rows.filter((other) => other.values[index] > row.values[index])
                        .length + 1;
                    return (
                      <td
                        key={column.key}
                        {...bind(
                          <TipBody
                            title={row.label}
                            swatch={row.swatch}
                            rows={[
                              { label: column.label, value: column.format(row.values[index] ?? 0) },
                              { label: "Peringkat kolom", value: `${rank} dari ${rows.length}` },
                            ]}
                            note={onSelect ? "Klik baris untuk memfilter" : undefined}
                          />,
                        )}
                        className="rounded-sm px-1.5 py-1.5 text-right tabular-nums text-slate-900 transition-shadow duration-150 hover:shadow-[inset_0_0_0_2px_#16181D]"
                        style={{
                          backgroundColor: `rgba(${rgb}, ${0.05 + 0.42 * t})`,
                        }}
                      >
                        {column.format(row.values[index] ?? 0)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span
          className="h-2.5 w-14 shrink-0 rounded-sm"
          style={{
            background: `linear-gradient(to right, rgba(${rgb}, 0.05), rgba(${rgb}, 0.47))`,
          }}
        />
        Warna lebih pekat = nilai lebih tinggi dibanding baris lain pada kolom
        yang sama.
      </p>
      {node}
    </div>
  );
}
