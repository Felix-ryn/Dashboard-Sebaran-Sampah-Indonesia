import type {
  ClusterId,
  CompositionKey,
  SourceKey,
} from "@/lib/types";

export const YEAR = 2025;

/** Latar pastel dan teks klaster yang ikut menyesuaikan tema terang/gelap (lihat --card-bg di globals.css). */
export const softBg = (color: string) =>
  `color-mix(in srgb, ${color} 14%, var(--card-bg))`;
export const softText = (color: string) =>
  `color-mix(in srgb, ${color} 70%, var(--ink-text))`;

export const APP_NAME = "Jejak Sampah";
export const APP_SUBTITLE = "Dashboard Pengelolaan Sampah Indonesia";

export interface ClusterMeta {
  id: ClusterId;
  label: string;
  short: string;
  color: string;
  soft: string;
  description: string;
}

export const CLUSTER_META: ClusterMeta[] = [
  {
    id: 0,
    label: "Belum terkelola",
    short: "Belum terkelola",
    color: "#D55E00",
    soft: "#FBE6D8",
    description:
      "Penanganan dan pengurangan sampah sangat rendah. Kelompok terbesar dalam dataset.",
  },
  {
    id: 1,
    label: "Timbulan per kapita tinggi",
    short: "Timbulan tinggi",
    color: "#CC79A7",
    soft: "#F5E3EC",
    description:
      "Timbulan per kapita menonjol, terutama di wilayah perkotaan dan kawasan padat penduduk.",
  },
  {
    id: 2,
    label: "Pengurangan menonjol",
    short: "Pengurangan menonjol",
    color: "#009E73",
    soft: "#D2EFE6",
    description:
      "Upaya pengurangan sampah relatif tinggi dibanding kelompok lain.",
  },
  {
    id: 3,
    label: "Penanganan tinggi",
    short: "Penanganan tinggi",
    color: "#0072B2",
    soft: "#D9EAF4",
    description:
      "Proporsi sampah yang ditangani tinggi, dengan capaian pengelolaan terbaik.",
  },
];

export const CLUSTER_BY_ID = Object.fromEntries(
  CLUSTER_META.map((item) => [item.id, item]),
) as Record<ClusterId, ClusterMeta>;

export const COMPOSITION_LABELS: Record<CompositionKey, string> = {
  sisa_makanan: "Sisa makanan",
  kayu_ranting: "Kayu/ranting",
  kertas_karton: "Kertas/karton",
  plastik: "Plastik",
  logam: "Logam",
  kain: "Kain",
  karet_kulit: "Karet/kulit",
  kaca: "Kaca",
  lainnya: "Lainnya",
};

export const COMPOSITION_COLORS: Record<CompositionKey, string> = {
  sisa_makanan: "#2563EB",
  kayu_ranting: "#0EA5E9",
  kertas_karton: "#06B6D4",
  plastik: "#14B8A6",
  logam: "#64748B",
  kain: "#8B5CF6",
  karet_kulit: "#F59E0B",
  kaca: "#38BDF8",
  lainnya: "#94A3B8",
};

export const SOURCE_LABELS: Record<SourceKey, string> = {
  rumah_tangga: "Rumah tangga",
  perkantoran: "Perkantoran",
  perniagaan: "Perniagaan",
  pasar: "Pasar",
  fasilitas_publik: "Fasilitas publik",
  kawasan: "Kawasan",
  lainnya: "Lainnya",
};

export const SOURCE_COLORS: Record<SourceKey, string> = {
  rumah_tangga: "#1E3A8A",
  perkantoran: "#2563EB",
  perniagaan: "#0EA5E9",
  pasar: "#06B6D4",
  fasilitas_publik: "#14B8A6",
  kawasan: "#8B5CF6",
  lainnya: "#94A3B8",
};

export type NavIcon =
  | "dashboard"
  | "gap"
  | "cluster"
  | "composition"
  | "source"
  | "ranking";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Ringkasan",
    icon: "dashboard",
    description: "Gambaran umum timbulan dan pengelolaan sampah nasional.",
  },
  {
    href: "/kesenjangan",
    label: "Kesenjangan",
    icon: "gap",
    description: "Selisih antara sampah yang dihasilkan dan yang terkelola.",
  },
  {
    href: "/klaster",
    label: "Klaster Wilayah",
    icon: "cluster",
    description: "Empat segmen wilayah hasil K-Means berdasarkan capaian.",
  },
  {
    href: "/komposisi",
    label: "Komposisi",
    icon: "composition",
    description: "Jenis material penyusun sampah di setiap wilayah.",
  },
  {
    href: "/sumber",
    label: "Sumber Sampah",
    icon: "source",
    description: "Asal timbulan sampah dengan penyaringan anomali data.",
  },
  {
    href: "/peringkat",
    label: "Peringkat",
    icon: "ranking",
    description: "Tabel dan peringkat kabupaten/kota yang dapat difilter.",
  },
];

export const CHART_COLORS = {
  primary: "#0072B2",
  primarySoft: "#D9EAF4",
  muted: "#CBD5E1",
  navy: "#1E3A8A",
  sky: "#0EA5E9",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  indigo: "#4F46E5",
  slate: "#94A3B8",
  amber: "#F59E0B",
  orange: "#F97316",
  warning: "#D97706",
  danger: "#E11D48",
  grid: "#E2E8F0",
};
