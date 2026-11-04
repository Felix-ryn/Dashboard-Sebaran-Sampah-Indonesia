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
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow, PageGrid, Panels } from "@/components/ui/page-grid";
import { DominantBar } from "@/components/charts/dominant-bar";
import {
  CompositionBars,
  CompositionHeatTable,
} from "@/components/charts/composition-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatNumber, formatPct } from "@/lib/format";

export default function CompositionPage() {
  const { compositionAvg, dominantComps, filteredCompositions, data } =
    useDashboard();

  const topComposition = [...compositionAvg].sort(
    (a, b) => b.value - a.value,
  )[0];
  const foodShare = compositionAvg.find((item) => item.key === "sisa_makanan");
  const topDominant = dominantComps[0];

  if (filteredCompositions.length === 0) {
    return (
      <PageGrid>
        <PageHeader
          eyebrow="Komposisi sampah"
          title="Jenis material penyusun sampah"
          description="Wilayah yang sedang difilter tidak memiliki baris komposisi yang valid."
          className="lg:col-span-12"
        />
        <div className="lg:col-span-12">
          <EmptyState
            title="Data komposisi tidak tersedia"
            description="Coba hapus filter pencarian atau pilih provinsi lain."
          />
        </div>
      </PageGrid>
    );
  }

  return (
    <PageGrid>
      <PageHeader
        className="lg:col-span-4"
        eyebrow="Komposisi sampah"
        title={
          topComposition
            ? `${topComposition.label} menyusun ${formatPct(topComposition.value, 0)} sampah, jenis terbesar`
            : "Jenis material penyusun sampah"
        }
        description="Rata-rata ditimbang dengan timbulan harian agar wilayah besar tidak tertutup wilayah kecil. Persen komposisi tidak boleh dijumlahkan langsung dengan tonase."
      />

      <KpiRow>
        <KpiCard
          dark
          icon={Utensils}
          label="Jenis dominan"
          value={topComposition?.label ?? "-"}
          helper={`${formatPct(topComposition?.value ?? 0)} komposisi rata-rata`}
        />
        <KpiCard
          icon={PieChart}
          label="Porsi sisa makanan"
          value={formatPct(foodShare?.value ?? 0)}
          helper="Rata-rata tertimbang timbulan"
        />
        <KpiCard
          icon={Database}
          label="Wilayah dengan data"
          value={`${formatNumber(filteredCompositions.length)} wilayah`}
          helper={`${formatNumber(data.compositions.length)} valid dari 330 baris (62 kosong)`}
          tone="amber"
        />
        <KpiCard
          icon={Tags}
          label="Dominasi terbanyak"
          value={topDominant?.label ?? "-"}
          helper={`${formatNumber(topDominant?.count ?? 0)} wilayah`}
        />
      </KpiRow>

      <Panels>
        <ChartCard
          className="lg:col-span-3"
          icon={PieChart}
          title="Komposisi rata-rata"
          description="Sembilan jenis material, dari terbesar."
        >
          <CompositionBars />
        </ChartCard>
        <ChartCard
          className="lg:col-span-3"
          icon={Layers}
          title="Jenis dominan per wilayah"
          description="Jumlah wilayah per jenis terbesar."
          footer="Dominan = persentase terbesar pada baris wilayah itu."
        >
          <DominantBar items={dominantComps} total={filteredCompositions.length} />
        </ChartCard>
        <ChartCard
          className="lg:col-span-6"
          icon={BarChart3}
          title="Komposisi per provinsi"
          description="Delapan provinsi dengan cakupan terbesar. Klik baris untuk memfilter."
          footer="Angka = persen komposisi rata-rata provinsi; warna dibandingkan antarprovinsi pada tiap jenis."
        >
          <CompositionHeatTable />
        </ChartCard>
      </Panels>
    </PageGrid>
  );
}
