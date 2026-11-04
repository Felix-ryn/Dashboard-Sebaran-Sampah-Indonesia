import { CLUSTER_META, COMPOSITION_LABELS, SOURCE_LABELS } from "@/lib/constants";
import { getDashboardData } from "@/lib/data";
import {
  aggregateNational,
  aggregateProfiles,
  aggregateProvinces,
  compositionAverage,
  rankRegions,
  type RegionMetric,
} from "@/lib/metrics";
import { COMPOSITION_KEYS, SOURCE_KEYS, type Region } from "@/lib/types";

/**
 * Fungsi data untuk chatbot. Semua angka dihitung dari data SIPSN yang sama
 * dengan dashboard (logika di lib/metrics.ts), sehingga jawaban chatbot dan
 * grafik tidak pernah berbeda. Hasil dikembalikan sebagai objek JSON polos.
 */

const round = (value: number, digits = 1) => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

const METRIC_LABEL: Record<RegionMetric, string> = {
  timbulanTahunan: "timbulan tahunan (ton)",
  tidakTerkelolaTon: "sampah tidak terkelola (ton/tahun)",
  pctTidakTerkelola: "persentase tidak terkelola (%)",
  pctTerkelola: "persentase terkelola (%)",
  perKapita: "timbulan per kapita (kg/orang/hari)",
  penduduk: "jumlah penduduk (jiwa)",
  pctPengurangan: "persentase pengurangan (%)",
  pctPenanganan: "persentase penanganan (%)",
};

const METRICS = Object.keys(METRIC_LABEL) as RegionMetric[];

function brief(region: Region) {
  return {
    wilayah: region.kabKota,
    provinsi: region.provinsi,
    klaster: region.labelCluster,
    penduduk_jiwa: Math.round(region.penduduk),
    timbulan_ton_per_tahun: Math.round(region.timbulanTahunan),
    persen_terkelola: round(region.pctTerkelola),
    persen_tidak_terkelola: round(region.pctTidakTerkelola),
    tidak_terkelola_ton_per_tahun: Math.round(region.tidakTerkelolaTon),
    persen_pengurangan: round(region.pctPengurangan, 2),
    persen_penanganan: round(region.pctPenanganan),
    kg_per_orang_per_hari: round(region.perKapita, 2),
  };
}

const norm = (text: string) =>
  text.toLowerCase().replace(/\b(kab|kota|kabupaten|adm)\.?\s*/g, "").replace(/[^a-z0-9 ]/g, "").trim();

function findRegions(name: string): Region[] {
  const { regions } = getDashboardData();
  const q = name.toLowerCase().trim();
  const exact = regions.filter((r) => r.kabKota.toLowerCase() === q);
  if (exact.length) return exact;
  const nq = norm(name);
  if (!nq) return [];
  const partial = regions.filter((r) => norm(r.kabKota).includes(nq));
  return partial;
}

function findProvince(name: string): string | undefined {
  const { regions } = getDashboardData();
  const q = name.toLowerCase().trim();
  const all = [...new Set(regions.map((r) => r.provinsi))];
  return (
    all.find((p) => p.toLowerCase() === q) ??
    all.find((p) => p.toLowerCase().includes(q)) ??
    all.find((p) => q.includes(p.toLowerCase()))
  );
}

function findCluster(value: string | number | undefined) {
  if (value === undefined || value === "") return undefined;
  const q = String(value).toLowerCase();
  return CLUSTER_META.find(
    (c) =>
      String(c.id) === q ||
      c.label.toLowerCase().includes(q) ||
      c.short.toLowerCase().includes(q),
  );
}

export interface ToolResult {
  [key: string]: unknown;
}

export function ringkasanNasional(args: { provinsi?: string }): ToolResult {
  const data = getDashboardData();
  let regions = data.regions;
  let cakupan = "seluruh data (327 kabupaten/kota)";
  if (args.provinsi) {
    const prov = findProvince(args.provinsi);
    if (!prov) return { galat: `Provinsi "${args.provinsi}" tidak ditemukan di data.` };
    regions = regions.filter((r) => r.provinsi === prov);
    cakupan = `${prov} (${regions.length} kabupaten/kota di data)`;
  }
  const n = aggregateNational(regions);
  const komposisi = compositionAverage(data.compositions, regions)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
    .map((item) => ({ jenis: item.label, persen: round(item.value) }));
  return {
    cakupan,
    jumlah_wilayah: n.nWilayah,
    timbulan_ton_per_tahun: Math.round(n.timbulan),
    terkelola_ton_per_tahun: Math.round(n.terkelola),
    tidak_terkelola_ton_per_tahun: Math.round(n.tidakTerkelola),
    persen_terkelola: round(n.pctTerkelola),
    persen_tidak_terkelola: round(n.pctTidakTerkelola),
    penduduk_jiwa: Math.round(n.penduduk),
    kg_per_orang_per_hari: round(n.perKapita, 2),
    komposisi_teratas: komposisi,
  };
}

export function cariWilayah(args: {
  provinsi?: string;
  klaster?: string | number;
  urut_berdasarkan?: string;
  arah?: string;
  batas?: number;
}): ToolResult {
  let regions = getDashboardData().regions;
  const filter: string[] = [];
  if (args.provinsi) {
    const prov = findProvince(args.provinsi);
    if (!prov) return { galat: `Provinsi "${args.provinsi}" tidak ditemukan di data.` };
    regions = regions.filter((r) => r.provinsi === prov);
    filter.push(`provinsi ${prov}`);
  }
  if (args.klaster !== undefined && args.klaster !== "") {
    const cluster = findCluster(args.klaster);
    if (!cluster) return { galat: `Klaster "${args.klaster}" tidak dikenal.` };
    regions = regions.filter((r) => r.cluster === cluster.id);
    filter.push(`klaster ${cluster.label}`);
  }
  const metric = (METRICS.includes(args.urut_berdasarkan as RegionMetric)
    ? args.urut_berdasarkan
    : "tidakTerkelolaTon") as RegionMetric;
  const limit = Math.min(Math.max(Math.round(args.batas ?? 5), 1), 15);
  const direction = args.arah === "naik" ? "asc" : "desc";
  const hasil = rankRegions(regions, metric, limit, direction).map(brief);
  return {
    filter: filter.length ? filter.join(", ") : "tanpa filter",
    diurutkan_berdasarkan: METRIC_LABEL[metric],
    arah: direction === "asc" ? "terkecil dulu" : "terbesar dulu",
    total_wilayah_cocok: regions.length,
    hasil,
  };
}

export function profilWilayah(args: { nama: string }): ToolResult {
  if (!args.nama) return { galat: "Nama wilayah wajib diisi." };
  const matches = findRegions(args.nama);
  if (matches.length === 0) {
    return { galat: `Wilayah "${args.nama}" tidak ditemukan. Data hanya mencakup 327 dari ±514 kabupaten/kota.` };
  }
  if (matches.length > 4) {
    return {
      galat: "Nama terlalu umum, ada banyak kecocokan.",
      kandidat: matches.slice(0, 10).map((r) => `${r.kabKota} (${r.provinsi})`),
    };
  }
  const data = getDashboardData();
  return {
    hasil: matches.map((region) => {
      const comp = data.compositions.find(
        (row) => row.kabKota === region.kabKota && row.provinsi === region.provinsi,
      );
      const src = data.sources.find(
        (row) => row.kabKota === region.kabKota && row.provinsi === region.provinsi,
      );
      return {
        ...brief(region),
        komposisi_persen: comp
          ? Object.fromEntries(
              COMPOSITION_KEYS.map((key) => [COMPOSITION_LABELS[key], round(comp.values[key])]),
            )
          : "tidak tersedia",
        sumber_ton_per_hari: src && !src.isAnomaly
          ? Object.fromEntries(SOURCE_KEYS.map((key) => [SOURCE_LABELS[key], round(src.values[key])]))
          : "tidak tersedia atau diragukan (anomali satuan)",
      };
    }),
  };
}

export function daftarProvinsi(args: {
  nama?: string;
  urut_berdasarkan?: string;
  batas?: number;
}): ToolResult {
  const { regions } = getDashboardData();
  const all = aggregateProvinces(regions).map((p) => ({
    provinsi: p.provinsi,
    jumlah_wilayah_di_data: p.nWilayah,
    timbulan_ton_per_tahun: Math.round(p.timbulan),
    tidak_terkelola_ton_per_tahun: Math.round(p.tidakTerkelola),
    persen_tidak_terkelola: round(p.pctTidakTerkelola),
    persen_terkelola: round(p.pctTerkelola),
    kg_per_orang_per_hari: round(p.perKapita, 2),
  }));
  if (args.nama) {
    const prov = findProvince(args.nama);
    const row = all.find((p) => p.provinsi === prov);
    return row ? { hasil: row } : { galat: `Provinsi "${args.nama}" tidak ditemukan.` };
  }
  const key = (
    ["timbulan_ton_per_tahun", "tidak_terkelola_ton_per_tahun", "persen_tidak_terkelola", "persen_terkelola", "kg_per_orang_per_hari"].includes(
      args.urut_berdasarkan ?? "",
    )
      ? args.urut_berdasarkan
      : "tidak_terkelola_ton_per_tahun"
  ) as keyof (typeof all)[number];
  const limit = Math.min(Math.max(Math.round(args.batas ?? 5), 1), 20);
  return {
    diurutkan_berdasarkan: key,
    catatan: "Jumlah wilayah per provinsi di data bisa lebih sedikit dari kenyataan (cakupan 327 dari ±514).",
    hasil: [...all].sort((a, b) => Number(b[key]) - Number(a[key])).slice(0, limit),
  };
}

export function profilKlaster(): ToolResult {
  const { regions } = getDashboardData();
  const profiles = aggregateProfiles(regions);
  return {
    metode: "K-Means k=4 pada % pengurangan (log), % penanganan, dan timbulan per kapita. Bersifat deskriptif, bukan sebab-akibat. Silhouette 0,49 (sedang).",
    klaster: profiles.map((p) => {
      const meta = CLUSTER_META.find((c) => c.id === p.cluster);
      return {
        id: p.cluster,
        nama: p.label,
        jumlah_wilayah: p.jumlahWilayah,
        median_persen_penanganan: round(p.medianPenanganan),
        median_persen_pengurangan: round(p.medianPengurangan, 2),
        median_persen_tidak_terkelola: round(p.medianTidakTerkelola),
        median_kg_per_orang_per_hari: round(p.medianPerKapita, 2),
        deskripsi: meta?.description,
      };
    }),
  };
}

/** Deklarasi fungsi untuk model (skema JSON, format Gemini function calling). */
export const TOOL_DECLARATIONS = [
  {
    name: "ringkasan_nasional",
    description:
      "Ringkasan total: timbulan, terkelola, tidak terkelola, persen, per kapita, komposisi teratas. Bisa untuk satu provinsi.",
    parameters: {
      type: "OBJECT",
      properties: { provinsi: { type: "STRING", description: "Nama provinsi (opsional)" } },
    },
  },
  {
    name: "cari_wilayah",
    description:
      "Cari dan urutkan kabupaten/kota. Pakai untuk 'wilayah mana yang paling/terendah ...', dengan filter provinsi atau klaster.",
    parameters: {
      type: "OBJECT",
      properties: {
        provinsi: { type: "STRING", description: "Filter provinsi (opsional)" },
        klaster: { type: "STRING", description: "Filter klaster: id 0-3 atau nama (opsional)" },
        urut_berdasarkan: { type: "STRING", enum: METRICS, description: "Metrik pengurutan" },
        arah: { type: "STRING", enum: ["turun", "naik"], description: "turun = terbesar dulu" },
        batas: { type: "INTEGER", description: "Jumlah hasil, maksimal 15" },
      },
    },
  },
  {
    name: "profil_wilayah",
    description: "Detail satu kabupaten/kota: angka pengelolaan, klaster, komposisi, dan sumber sampah.",
    parameters: {
      type: "OBJECT",
      properties: { nama: { type: "STRING", description: "Nama kabupaten/kota, contoh: Surabaya" } },
      required: ["nama"],
    },
  },
  {
    name: "daftar_provinsi",
    description: "Peringkat provinsi atau detail satu provinsi (agregat dari kabupaten/kota yang ada di data).",
    parameters: {
      type: "OBJECT",
      properties: {
        nama: { type: "STRING", description: "Nama provinsi untuk detail satu provinsi (opsional)" },
        urut_berdasarkan: {
          type: "STRING",
          enum: [
            "timbulan_ton_per_tahun",
            "tidak_terkelola_ton_per_tahun",
            "persen_tidak_terkelola",
            "persen_terkelola",
            "kg_per_orang_per_hari",
          ],
        },
        batas: { type: "INTEGER", description: "Jumlah hasil, maksimal 20" },
      },
    },
  },
  {
    name: "profil_klaster",
    description: "Karakteristik empat klaster hasil K-Means beserta jumlah wilayah dan nilai median.",
    parameters: { type: "OBJECT", properties: {} },
  },
];

export function runTool(name: string, args: Record<string, unknown>): ToolResult {
  try {
    switch (name) {
      case "ringkasan_nasional":
        return ringkasanNasional(args as { provinsi?: string });
      case "cari_wilayah":
        return cariWilayah(args as Parameters<typeof cariWilayah>[0]);
      case "profil_wilayah":
        return profilWilayah(args as { nama: string });
      case "daftar_provinsi":
        return daftarProvinsi(args as Parameters<typeof daftarProvinsi>[0]);
      case "profil_klaster":
        return profilKlaster();
      default:
        return { galat: `Fungsi "${name}" tidak dikenal.` };
    }
  } catch (error) {
    return { galat: error instanceof Error ? error.message : "Terjadi kesalahan saat membaca data." };
  }
}
