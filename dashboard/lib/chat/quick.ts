import { formatCompactTon, formatNumber } from "@/lib/format";
import { cariWilayah, daftarProvinsi, profilKlaster, ringkasanNasional } from "@/lib/chat/tools";
import type { ChatAction, ChatReply } from "@/lib/chat/types";

type Row = Record<string, unknown>;
const num = (value: unknown) => Number(value ?? 0);
const pct = (value: unknown) =>
  `${num(value).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

function regionActions(rows: Row[]): ChatAction[] {
  return rows.slice(0, 3).map((r) => ({
    label: String(r.wilayah),
    search: String(r.wilayah),
    href: "/peringkat",
  }));
}

/**
 * Pertanyaan contoh yang dijawab langsung dari data (tanpa AI), sehingga selalu
 * tersedia walau kuota API habis atau koneksi bermasalah.
 */
export const QUICK_QUESTIONS: { id: string; label: string; answer: () => ChatReply }[] = [
  {
    id: "persen",
    label: "Berapa persen sampah yang terkelola?",
    answer: () => {
      const n = ringkasanNasional({}) as Row;
      return {
        source: "cepat",
        reply:
          `Dari ${formatNumber(num(n.jumlah_wilayah))} kabupaten/kota yang tercatat, ` +
          `**${pct(n.persen_terkelola)}** timbulan sampah terkelola (${formatCompactTon(num(n.terkelola_ton_per_tahun))}) ` +
          `dan **${pct(n.persen_tidak_terkelola)}** belum terkelola (${formatCompactTon(num(n.tidak_terkelola_ton_per_tahun))}). ` +
          `Total timbulan ${formatCompactTon(num(n.timbulan_ton_per_tahun))} per tahun.\n\n` +
          `Catatan: "tidak terkelola" adalah selisih timbulan dengan sampah yang tercatat terkelola, bukan bukti dibuang sembarangan.`,
        actions: [{ label: "Lihat ringkasan", href: "/" }],
      };
    },
  },
  {
    id: "wilayah-terbesar",
    label: "5 wilayah dengan sampah tak terkelola terbesar",
    answer: () => {
      const r = cariWilayah({ urut_berdasarkan: "tidakTerkelolaTon", batas: 5 }) as {
        hasil: Row[];
      };
      const lines = r.hasil.map(
        (x, i) =>
          `${i + 1}. **${x.wilayah}** (${x.provinsi}): ${formatCompactTon(num(x.tidak_terkelola_ton_per_tahun))} tidak terkelola, ${pct(x.persen_tidak_terkelola)} dari timbulannya`,
      );
      return {
        source: "cepat",
        reply: `Lima wilayah dengan volume sampah tidak terkelola terbesar:\n${lines.join("\n")}`,
        actions: [
          { label: "Buka halaman Kesenjangan", href: "/kesenjangan" },
          ...regionActions(r.hasil),
        ],
      };
    },
  },
  {
    id: "provinsi",
    label: "Provinsi mana yang paling banyak sampah tak terkelola?",
    answer: () => {
      const r = daftarProvinsi({
        urut_berdasarkan: "tidak_terkelola_ton_per_tahun",
        batas: 5,
      }) as { hasil: Row[] };
      const lines = r.hasil.map(
        (x, i) =>
          `${i + 1}. **${x.provinsi}**: ${formatCompactTon(num(x.tidak_terkelola_ton_per_tahun))} (${pct(x.persen_tidak_terkelola)} dari timbulannya)`,
      );
      return {
        source: "cepat",
        reply: `Provinsi dengan volume sampah tidak terkelola terbesar:\n${lines.join("\n")}\n\nVolume besar belum tentu berarti proporsi besar; angka provinsi hanya mencakup kabupaten/kota yang ada di data.`,
        actions: [
          { label: "Buka halaman Kesenjangan", href: "/kesenjangan" },
          ...r.hasil.slice(0, 2).map((x) => ({
            label: String(x.provinsi),
            provinsi: String(x.provinsi),
            href: "/kesenjangan",
          })),
        ],
      };
    },
  },
  {
    id: "klaster",
    label: "Jelaskan empat klaster wilayah",
    answer: () => {
      const r = profilKlaster() as { klaster: Row[] };
      const lines = r.klaster.map(
        (k) =>
          `- **${k.nama}** (${k.jumlah_wilayah} wilayah): median penanganan ${pct(k.median_persen_penanganan)}, pengurangan ${pct(k.median_persen_pengurangan)}, ${num(k.median_kg_per_orang_per_hari).toLocaleString("id-ID")} kg/orang/hari`,
      );
      return {
        source: "cepat",
        reply: `Wilayah dikelompokkan dengan K-Means (k=4) berdasarkan pengurangan, penanganan, dan timbulan per kapita:\n${lines.join("\n")}\n\nKlaster bersifat deskriptif, bukan sebab-akibat.`,
        actions: [{ label: "Buka halaman Klaster", href: "/klaster" }],
      };
    },
  },
  {
    id: "per-kapita",
    label: "Wilayah dengan sampah per orang tertinggi",
    answer: () => {
      const r = cariWilayah({ urut_berdasarkan: "perKapita", batas: 5 }) as { hasil: Row[] };
      const lines = r.hasil.map(
        (x, i) =>
          `${i + 1}. **${x.wilayah}** (${x.provinsi}): ${num(x.kg_per_orang_per_hari).toLocaleString("id-ID")} kg/orang/hari`,
      );
      return {
        source: "cepat",
        reply: `Timbulan per kapita tertinggi:\n${lines.join("\n")}\n\nSekitar 9,5% wilayah memiliki angka tepat 0,40 atau 0,50 yang kemungkinan berupa asumsi, jadi bandingkan dengan hati-hati.`,
        actions: [
          { label: "Buka halaman Peringkat", href: "/peringkat" },
          ...regionActions(r.hasil),
        ],
      };
    },
  },
];
