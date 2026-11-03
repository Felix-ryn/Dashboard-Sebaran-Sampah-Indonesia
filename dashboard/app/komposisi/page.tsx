"use client";

import {
  BarChart3,
  Database,
  Layers,
  PieChart,
  Tags,
  Utensils,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { InsightPanel } from "@/components/ui/insight-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { DominantList } from "@/components/ui/dominant-list";
import {
  CompositionDonut,
  CompositionStackedBar,
} from "@/components/charts/composition-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatNumber, formatPct } from "@/lib/format";

export default function CompositionPage() {
  const {
    compositionAvg,
    dominantComps,
    filteredCompositions,
    data,
  } = useDashboard();

  const topComposition = [...compositionAvg].sort(
    (a, b) => b.value - a.value,
  )[0];
  const foodShare = compositionAvg.find(
    (item) => item.key === "sisa_makanan",
  );
  const topDominant = dominantComps[0];

  return (
    <div>
      <PageHeader
        eyebrow="Komposisi sampah"
        title="Jenis material penyusun sampah"
        description="Komposisi menggambarkan persentase jenis material pada setiap wilayah. Rata-rata pada halaman ini ditimbang dengan timbulan harian agar wilayah dengan volume besar tidak tertutup oleh wilayah kecil."
      />

      {filteredCompositions.length === 0 ? (
        <EmptyState
          title="Data komposisi tidak tersedia"
          description="Wilayah yang sedang difilter tidak memiliki baris komposisi yang valid. Coba hapus filter pencarian atau pilih provinsi lain."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Utensils}
              label="Jenis dominan"
              value={topComposition?.label ?? "-"}
              helper={`${formatPct(
                topComposition?.value ?? 0,
              )} dari komposisi rata-rata`}
              tone="blue"
            />
            <KpiCard
              icon={PieChart}
              label="Porsi sisa makanan"
              value={formatPct(foodShare?.value ?? 0)}
              helper="Rata-rata tertimbang timbulan harian"
              tone="teal"
            />
            <KpiCard
              icon={Database}
              label="Wilayah dengan data"
              value={`${formatNumber(filteredCompositions.length)} wilayah`}
              helper={`${formatNumber(
                data.compositions.length,
              )} baris valid dari 330 baris mentah`}
              tone="navy"
            />
            <KpiCard
              icon={Tags}
              label="Dominasi terbanyak"
              value={topDominant?.label ?? "-"}
              helper={`${formatNumber(
                topDominant?.count ?? 0,
              )} wilayah menjadikannya jenis utama`}
              tone="sky"
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ChartCard
              icon={PieChart}
              title="Komposisi rata-rata terfilter"
              description="Sembilan jenis material yang tersedia di dataset."
              footer="Persentase komposisi tidak boleh dijumlahkan langsung dengan volume tonase."
            >
              <CompositionDonut />
            </ChartCard>
            <ChartCard
              icon={Layers}
              title="Jenis dominan per wilayah"
              description="Jumlah wilayah yang menjadikan setiap jenis sebagai komposisi terbesar."
              footer="Jenis dominan ditentukan dari persentase terbesar pada masing-masing baris."
            >
              <DominantList
                items={dominantComps}
                total={filteredCompositions.length}
              />
            </ChartCard>
          </div>

          <div className="mt-5">
            <ChartCard
              icon={BarChart3}
              title="Komposisi per provinsi"
              description="Delapan provinsi dengan cakupan komposisi terbesar. Klik batang untuk memfilter provinsi."
              footer="Setiap batang dinormalisasi menjadi 100% agar proporsi antarprovinsi dapat dibandingkan."
            >
              <CompositionStackedBar />
            </ChartCard>
          </div>

          <div className="mt-5">
            <InsightPanel title="Catatan kualitas data" tone="warning">
              Dari 330 baris komposisi mentah,{" "}
              <strong>{formatNumber(data.compositions.length)} baris</strong>{" "}
              memiliki nilai yang dapat dipakai. Sebanyak 62 baris kosong tidak
              ditampilkan. Komposisi dalam persen tidak boleh dijumlahkan
              langsung dengan timbulan dalam ton tanpa konversi yang sesuai.
            </InsightPanel>
          </div>
        </>
      )}
    </div>
  );
}
