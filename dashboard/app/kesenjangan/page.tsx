"use client";

import {
  ArrowDownRight,
  BarChart3,
  MapPin,
  Percent,
  ScatterChart,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { InsightPanel } from "@/components/ui/insight-panel";
import { EmptyState } from "@/components/ui/empty-state";
import {
  GapRanking,
  GapScatter,
  ProvinceGapBar,
} from "@/components/charts/gap-charts";
import { GapDistribution } from "@/components/charts/distribution-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import {
  formatCompactTon,
  formatNumber,
  formatPct,
  formatPerKapita,
} from "@/lib/format";

export default function GapPage() {
  const { national, filteredRegions, provinces } = useDashboard();
  const highGapCount = filteredRegions.filter(
    (region) => region.pctTidakTerkelola > 50,
  ).length;
  const worstProvince = [...provinces].sort(
    (a, b) => b.pctTidakTerkelola - a.pctTidakTerkelola,
  )[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kesenjangan pengelolaan"
        title="Sampah yang belum tercatat terkelola"
        description="Halaman ini memisahkan dua pertanyaan yang berbeda: seberapa besar volume sampah yang tidak terkelola, dan seberapa besar proporsinya terhadap timbulan di wilayah tersebut."
      />

      {filteredRegions.length === 0 ? (
        <EmptyState description="Tidak ada wilayah yang cocok dengan filter. Reset filter untuk melihat kesenjangan nasional." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={ArrowDownRight}
              label="Volume tidak terkelola"
              value={formatCompactTon(national.tidakTerkelola)}
              helper="Selisih timbulan tahunan dengan sampah terkelola"
              tone="amber"
            />
            <KpiCard
              icon={Percent}
              label="Proporsi tidak terkelola"
              value={formatPct(national.pctTidakTerkelola)}
              helper={`Dari total ${formatCompactTon(national.timbulan)}`}
              tone="rose"
            />
            <KpiCard
              icon={TriangleAlert}
              label="Wilayah di atas 50%"
              value={`${formatNumber(highGapCount)} wilayah`}
              helper="Proporsi tidak terkelola lebih dari separuh timbulan"
              tone="navy"
            />
            <KpiCard
              icon={MapPin}
              label="Provinsi dengan proporsi tertinggi"
              value={worstProvince?.provinsi ?? "-"}
              helper={`${formatPct(
                worstProvince?.pctTidakTerkelola ?? 0,
              )} tidak terkelola`}
              tone="sky"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              icon={ScatterChart}
              title="Timbulan vs persentase terkelola"
              description="Ukuran gelembung menunjukkan jumlah penduduk. Warna menunjukkan klaster wilayah."
              className="lg:col-span-2"
              footer="Garis putus-putus menandai capaian 50% terkelola. Klik titik untuk memfilter klaster."
            >
              <GapScatter />
            </ChartCard>
            <ChartCard
              icon={BarChart3}
              title="Provinsi dengan volume tidak terkelola terbesar"
              description="Klik batang untuk memfilter provinsi."
              footer="Volume besar belum tentu berarti proporsi yang besar. Bandingkan dengan grafik peringkat di bawah."
            >
              <ProvinceGapBar />
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              icon={Percent}
              title="Sebaran proporsi tidak terkelola"
              description="Jumlah wilayah berdasarkan tingkat kesenjangan relatif terhadap timbulan masing-masing."
              footer="Semakin ke kanan, semakin besar proporsi timbulan yang belum tercatat terkelola."
            >
              <GapDistribution />
            </ChartCard>
            <ChartCard
              icon={BarChart3}
              title="Peringkat 10 wilayah"
              description="Ganti metrik antara volume dan persentase untuk melihat dua sisi kesenjangan."
              className="lg:col-span-2"
              footer="Peringkat volume menjawab skala masalah; peringkat persentase menjawab tingkat keparahan relatif."
            >
              <GapRanking />
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <InsightPanel title="Cara membaca" className="lg:col-span-2">
              Volume tidak terkelola yang besar dapat berasal dari wilayah
              berpenduduk banyak. Persentase membantu melihat keparahan
              relatif tanpa terpengaruh ukuran wilayah.
            </InsightPanel>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Ringkasan terfilter
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Wilayah dianalisis</span>
                  <span className="font-semibold text-slate-900">
                    {formatNumber(filteredRegions.length)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Terkelola</span>
                  <span className="font-semibold text-slate-900">
                    {formatPct(national.pctTerkelola)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Tidak terkelola</span>
                  <span className="font-semibold text-slate-900">
                    {formatPct(national.pctTidakTerkelola)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Per kapita</span>
                  <span className="font-semibold text-slate-900">
                    {formatPerKapita(national.perKapita)}
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
