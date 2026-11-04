"use client";

import {
  BarChart3,
  Boxes,
  Gauge,
  Network,
  PieChart,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { ChartCard } from "@/components/ui/chart-card";
import { InsightPanel } from "@/components/ui/insight-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { ClusterExamples } from "@/components/ui/cluster-examples";
import {
  ClusterDonut,
  ClusterPerKapitaBar,
  ClusterProfileBar,
  ClusterRadar,
  PcaScatter,
} from "@/components/charts/cluster-charts";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { formatNumber, formatPct } from "@/lib/format";

export default function ClusterPage() {
  const { filteredRegions, clusterSummary, profiles } = useDashboard();

  const largestCluster = [...clusterSummary].sort(
    (a, b) => b.count - a.count,
  )[0];
  const bestProfile = [...profiles].sort(
    (a, b) => b.medianPenanganan - a.medianPenanganan,
  )[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Klaster wilayah"
        title="Empat segmen capaian pengelolaan sampah"
        description="K-Means dengan k=4 mengelompokkan kabupaten/kota berdasarkan pengurangan, penanganan, dan timbulan per kapita. Klaster bersifat deskriptif, bukan hubungan sebab-akibat."
      />

      {filteredRegions.length === 0 ? (
        <EmptyState description="Tidak ada wilayah yang cocok dengan filter. Reset filter untuk melihat seluruh klaster." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Boxes}
              label="Wilayah dianalisis"
              value={`${formatNumber(filteredRegions.length)} wilayah`}
              helper="Data terfilter saat ini"
              tone="blue"
            />
            <KpiCard
              icon={Network}
              label="Klaster terbesar"
              value={largestCluster?.label ?? "-"}
              helper={`${formatNumber(
                largestCluster?.count ?? 0,
              )} wilayah dalam segmen ini`}
              tone="navy"
            />
            <KpiCard
              icon={Gauge}
              label="Median penanganan tertinggi"
              value={formatPct(bestProfile?.medianPenanganan ?? 0)}
              helper={bestProfile?.label ?? "-"}
              tone="teal"
            />
            <KpiCard
              icon={ShieldCheck}
              label="Stabilitas klaster"
              value="0,93"
              helper="ARI rata-rata dari 100 bootstrap"
              tone="sky"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard
              icon={Network}
              title="Sebaran wilayah pada ruang PCA"
              description="Dua komponen utama menjelaskan 70,3% variasi data. Warna menunjukkan klaster."
              className="lg:col-span-2"
              footer="Kedekatan titik menggambarkan kemiripan kombinasi fitur, bukan kedekatan geografis."
            >
              <PcaScatter />
            </ChartCard>
            <ChartCard
              icon={PieChart}
              title="Jumlah wilayah per klaster"
              description="Klik irisan atau label untuk memfilter dashboard."
              footer="Klaster 0 mendominasi dataset, sehingga agregat nasional banyak dipengaruhi segmen ini."
            >
              <ClusterDonut />
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              icon={BarChart3}
              title="Komposisi pengelolaan per klaster"
              description="Pembagian total tonase menjadi pengurangan, penanganan, dan tidak terkelola."
              footer="Angka dihitung dari agregasi tonase wilayah dalam setiap klaster. Klik batang untuk memfilter klaster."
            >
              <ClusterProfileBar />
            </ChartCard>
            <ChartCard
              icon={BarChart3}
              title="Median timbulan per kapita"
              description="Intensitas timbulan per orang per hari pada setiap klaster."
              footer="Nilai per kapita berasal dari estimasi timbulan dibagi jumlah penduduk."
            >
              <ClusterPerKapitaBar />
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard
              icon={Radar}
              title="Profil relatif klaster"
              description="Skor dinormalisasi terhadap nilai tertinggi pada setiap metrik."
              footer="Radar membantu melihat bentuk profil, bukan nilai absolut."
            >
              <ClusterRadar />
            </ChartCard>
            <ChartCard
              icon={Boxes}
              title="Contoh wilayah per klaster"
              description="Tiga wilayah dengan timbulan terbesar di masing-masing segmen."
              footer="Klik wilayah untuk memfilter dashboard ke kabupaten/kota tersebut."
            >
              <ClusterExamples />
            </ChartCard>
          </div>

          <div className="mt-5">
            <InsightPanel title="Catatan interpretasi">
              Silhouette 0,488 tergolong sedang: klaster cukup stabil tetapi
              tidak terpisah tegas. Klaster 1 dibentuk oleh timbulan per kapita
              tinggi, bukan oleh kinerja pengelolaan. Klaster 3 memiliki
              penanganan tinggi, sedangkan klaster 0 dan 2 perlu dibaca bersama
              konteks kebijakan dan anggaran daerah.
            </InsightPanel>
          </div>
        </>
      )}
    </div>
  );
}
