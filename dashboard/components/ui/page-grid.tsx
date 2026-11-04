import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Kerangka halaman satu layar: baris atas (judul + 4 KPI) setinggi tetap,
 * baris bawah (grafik) mengisi sisa tinggi. Di layar kecil menjadi tumpukan biasa.
 */
export function PageGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:h-full lg:grid-cols-12 lg:grid-rows-[144px_minmax(0,1fr)]">
      {children}
    </div>
  );
}

export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:col-span-8 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function Panels({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-0 grid-cols-1 gap-3 lg:col-span-12 lg:grid-cols-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
