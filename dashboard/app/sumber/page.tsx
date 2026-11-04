"use client";

import {
  BarChart3,
  Database,
  Layers,
  PieChart,
  Store,
  Truck,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { InsightPanel } from "@/components/ui/insight-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { DominantBar } from "@/components/charts/dominant-bar";
import {
  SourceDonut,
  SourceStackedBar,
} from "@/components/charts/source-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatNumber, formatPct, formatTon } from "@/lib/format";

export default function SourcePage() {
  const {
    sourceAvg,
    dominantSources,
    filteredSources,
    excludedSourceCount,
    data,
  } = useDashboard();

  const topSource = [...sourceAvg].sort((a, b) => b.value - a.value)[0];
  const topDominant = dominantSources[0];
  const totalTon = sourceAvg.reduce((sum, item) => sum + item.ton, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sumber sampah"
        title="Dari mana sampah berasal"
        description="Data sumber sampah membantu mengarahkan strategi pengelolaan. Halaman ini hanya memakai baris yang konsisten dengan timbulan harian wilayah agar anomali satuan tidak mendistorsi grafik."
      />

      {filteredSources.length === 0 ? (
        <EmptyState
          title="Data sumber tidak tersedia"
          description="Tidak ada baris sumber yang lolos penyaringan anomali pada filter saat ini. Coba pilih provinsi lain atau reset filter."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Store}
              label="Sumber dominan"
              value={topSource?.label ?? "-"}
              helper={`${formatPct(
                topSource?.value ?? 0,
              )} dari total sumber terfilter`}
              tone="blue"
            />
            <KpiCard
              icon={Truck}
              label="Total sumber"
              value={formatTon(totalTon, 0)}
              helper="Ton per hari dari baris yang lolos filter"
              tone="teal"
            />
            <KpiCard
              icon={Database}
              label="Wilayah dengan data"
              value={`${formatNumber(filteredSources.length)} wilayah`}
              helper={`${formatNumber(
                data.sources.length,
              )} baris sumber tidak kosong di dataset`}
              tone="navy"
            />
            <KpiCard
              icon={TriangleAlert}
              label="Baris dikecualikan"
              value={`${formatNumber(excludedSourceCount)} baris`}
              helper="Rasio total sumber di luar 0,2-5x timbulan harian"
              tone="amber"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              icon={PieChart}
              title="Proporsi sumber terfilter"
              description="Perbandingan kontribusi rumah tangga, pasar, perkantoran, dan sumber lain."
              footer="Nilai dihitung dari penjumlahan ton/hari pada baris yang lolos penyaringan."
            >
              <SourceDonut />
            </ChartCard>
            <ChartCard
              icon={Layers}
              title="Sumber dominan per wilayah"
              description="Jumlah wilayah yang menjadikan setiap sumber sebagai kontributor terbesar."
              footer="Sumber dominan ditentukan dari nilai terbesar pada masing-masing baris."
            >
              <DominantBar
                items={dominantSources}
                total={filteredSources.length}
              />
            </ChartCard>
          </div>

          <div>
            <ChartCard
              icon={BarChart3}
              title="Proporsi sumber per provinsi"
              description="Delapan provinsi dengan total sumber terbesar. Klik batang untuk memfilter provinsi."
              footer="Setiap batang dinormalisasi menjadi 100% untuk membandingkan proporsi antarprovinsi."
            >
              <SourceStackedBar />
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <InsightPanel title="Penyaringan anomali" tone="warning">
              Sebanyak <strong>{formatNumber(excludedSourceCount)} baris</strong>{" "}
              pada filter saat ini dikecualikan karena total sumber berada di
              luar rentang 0,2-5x timbulan harian. Contoh anomali pada data
              mentah: nilai ribuan ton/hari untuk wilayah yang timbulannya hanya
              puluhan ton/hari.
            </InsightPanel>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ringkasan sumber
              </p>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Sumber terbesar</span>
                  <span className="font-semibold text-slate-900">
                    {topSource?.label ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Porsi sumber terbesar</span>
                  <span className="font-semibold text-slate-900">
                    {formatPct(topSource?.value ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Dominasi terbanyak</span>
                  <span className="font-semibold text-slate-900">
                    {topDominant?.label ?? "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Jumlah wilayah</span>
                  <span className="font-semibold text-slate-900">
                    {formatNumber(filteredSources.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
