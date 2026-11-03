export type ClusterId = 0 | 1 | 2 | 3;

export interface Region {
  provinsi: string;
  kabKota: string;
  cluster: ClusterId;
  labelCluster: string;
  penduduk: number;
  timbulanHarian: number;
  timbulanTahunan: number;
  penguranganTon: number;
  pctPengurangan: number;
  penangananTon: number;
  pctPenanganan: number;
  terkelolaTon: number;
  pctTerkelola: number;
  tidakTerkelolaTon: number;
  pctTidakTerkelola: number;
  perKapita: number;
  pca1: number;
  pca2: number;
}

export const COMPOSITION_KEYS = [
  "sisa_makanan",
  "kayu_ranting",
  "kertas_karton",
  "plastik",
  "logam",
  "kain",
  "karet_kulit",
  "kaca",
  "lainnya",
] as const;

export type CompositionKey = (typeof COMPOSITION_KEYS)[number];

export interface CompositionRow {
  provinsi: string;
  kabKota: string;
  values: Record<CompositionKey, number>;
  totalPct: number;
  jenisDominan: CompositionKey;
}

export const SOURCE_KEYS = [
  "rumah_tangga",
  "perkantoran",
  "perniagaan",
  "pasar",
  "fasilitas_publik",
  "kawasan",
  "lainnya",
] as const;

export type SourceKey = (typeof SOURCE_KEYS)[number];

export interface SourceRow {
  provinsi: string;
  kabKota: string;
  values: Record<SourceKey, number>;
  totalTonHari: number;
  sumberDominan: SourceKey;
  ratioToTimbulan: number;
  isAnomaly: boolean;
}

export interface ClusterProfile {
  cluster: ClusterId;
  label: string;
  jumlahWilayah: number;
  medianPenduduk: number;
  medianPerKapita: number;
  medianPengurangan: number;
  medianPenanganan: number;
  medianTidakTerkelola: number;
}

export interface ProvinceAggregate {
  provinsi: string;
  nWilayah: number;
  timbulan: number;
  terkelola: number;
  tidakTerkelola: number;
  pctTerkelola: number;
  pctTidakTerkelola: number;
  penduduk: number;
  perKapita: number;
}

export interface NationalAggregate {
  timbulan: number;
  terkelola: number;
  tidakTerkelola: number;
  pctTerkelola: number;
  pctTidakTerkelola: number;
  penduduk: number;
  perKapita: number;
  nWilayah: number;
}

export interface DashboardData {
  regions: Region[];
  compositions: CompositionRow[];
  sources: SourceRow[];
  profiles: ClusterProfile[];
}

export interface CompositionAverage {
  key: CompositionKey;
  label: string;
  value: number;
  color: string;
}

export interface SourceAverage {
  key: SourceKey;
  label: string;
  ton: number;
  value: number;
  color: string;
}
