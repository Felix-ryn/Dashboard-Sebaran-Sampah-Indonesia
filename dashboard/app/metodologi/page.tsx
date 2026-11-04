"use client";

import {
  AlertTriangle,
  Boxes,
  BrainCircuit,
  CircleCheck,
  Database,
  FileSpreadsheet,
  GitBranch,
  Layers,
  ShieldAlert,
  Target,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";

const STEPS = [
  {
    icon: Database,
    title: "Validasi data",
    description:
      "Data capaian dan timbulan SIPSN 2025 dicocokkan per kabupaten/kota, lalu dihitung indikator turunan.",
  },
  {
    icon: Layers,
    title: "Pemilihan fitur",
    description:
      "Fitur clustering: log1p(pct_pengurangan), pct_penanganan, dan timbulan per kapita. Semua distandardisasi.",
  },
  {
    icon: Boxes,
    title: "Clustering K-Means",
    description:
      "k=4 dipilih dari silhouette dan Davies-Bouldin. Random state 42 agar hasil dapat direproduksi.",
  },
  {
    icon: Target,
    title: "Interpretasi",
    description:
      "Profil klaster dibaca dari median fitur, lalu diuji stabilitas bootstrap dan dibandingkan dengan Ward.",
  },
];

const FILES = [
  {
    file: "sampah_2025_bersih.csv",
    role: "Tabel utama 327 kabupaten/kota",
    status: "Dipakai",
  },
  {
    file: "hasil_clustering_sampah_2025.csv",
    role: "Label klaster dan koordinat PCA",
    status: "Dipakai",
  },
  {
    file: "komposisi_bersih.csv",
    role: "Komposisi jenis sampah, 268 baris valid",
    status: "Dipakai dengan filter",
  },
  {
    file: "sumber_bersih.csv",
    role: "Sumber sampah, hanya baris konsisten",
    status: "Dipakai dengan filter",
  },
  {
    file: "ringkasan_provinsi.csv",
    role: "Referensi agregasi provinsi",
    status: "Referensi",
  },
];

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Metodologi"
        title="Cara analisis ini dibangun"
        description="Halaman ini merangkum metode, kualitas data, dan keterbatasan yang perlu disebut saat presentasi. Dashboard bersifat deskriptif dan tidak dimaksudkan untuk menyimpulkan sebab-akibat."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Workflow className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Alur analisis
              </h2>
              <p className="text-sm text-slate-500">
                Dari data mentah sampai segmen wilayah
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    {index < STEPS.length - 1 ? (
                      <span className="mt-1 h-full w-px bg-slate-200" />
                    ) : null}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Boxes className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Clustering K-Means
              </h2>
              <p className="text-sm text-slate-500">
                k=4, random_state=42, fitur distandardisasi
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Silhouette
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">0,488</p>
              <p className="text-xs text-slate-500">Tergolong sedang</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Davies-Bouldin
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">0,808</p>
              <p className="text-xs text-slate-500">Terendah di k=4</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Stabilitas ARI
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">0,93</p>
              <p className="text-xs text-slate-500">100 bootstrap</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Variasi PCA 2D
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">70,3%</p>
              <p className="text-xs text-slate-500">Dua komponen utama</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">Stabilitas bootstrap</span>
                <span className="font-semibold text-slate-800">93%</span>
              </div>
              <ProgressBar value={93} color="#2563EB" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">Variasi terjelaskan PCA</span>
                <span className="font-semibold text-slate-800">70,3%</span>
              </div>
              <ProgressBar value={70.3} color="#0EA5E9" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-500">Silhouette (skala 0-1)</span>
                <span className="font-semibold text-slate-800">48,8%</span>
              </div>
              <ProgressBar value={48.8} color="#14B8A6" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm leading-6 text-slate-600">
            Set fitur B (pengurangan, penanganan, per kapita) dipilih secara
            sengaja meskipun silhouette lebih rendah dari set A, karena
            menghasilkan segmen yang lebih informatif untuk bercerita.
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <BrainCircuit className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Klasifikasi pelengkap
              </h2>
              <p className="text-sm text-slate-500">
                Bukan model prediksi utama
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="font-semibold text-base text-slate-900">
                Decision Tree (kedalaman 3)
              </p>
              <p className="mt-1">
                Akurasi 97,6% terhadap label klaster. Angka ini hanya untuk
                interpretasi aturan, bukan kemampuan prediksi ke wilayah baru.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="font-semibold text-base text-slate-900">
                Random Forest dengan penduduk dan jenis wilayah
              </p>
              <p className="mt-1">
                Akurasi 55,7% berbanding baseline 53,8%. Jumlah penduduk dan
                status kota/kabupaten tidak menjelaskan kualitas pengelolaan.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Karena itu, clustering menjadi model utama dan klasifikasi hanya
                dipakai sebagai alat bantu membaca aturan.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Keterbatasan yang wajib disebut
              </h2>
              <p className="text-sm text-slate-500">
                Konteks penting saat presentasi
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
            {[
              "Data hanya satu tahun (2025), sehingga tidak ada analisis tren atau forecasting.",
              "Cakupan 327 kabupaten/kota dari sekitar 514 wilayah; beberapa provinsi hanya diwakili 1-3 wilayah.",
              "Timbulan per kapita membulat pada 31 wilayah (tepat 0,40 atau 0,50).",
              "Silhouette 0,488 tergolong sedang; klaster stabil tetapi tidak terpisah tegas.",
              "Clustering bersifat deskriptif, bukan bukti hubungan sebab-akibat.",
              "Komposisi memiliki 62 baris kosong; sumber sampah memiliki anomali satuan.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileSpreadsheet className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Sumber data dan perlakuan
            </h2>
            <p className="text-sm text-slate-500">
              File yang dipakai dashboard
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">File</th>
                <th className="py-2 pr-3 font-semibold">Peran</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {FILES.map((row) => (
                <tr
                  key={row.file}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2.5 pr-3 font-medium text-slate-800">
                    {row.file}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-500">{row.role}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      <CircleCheck className="h-3 w-3" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">
          <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          Sumber utama: Sistem Informasi Pengelolaan Sampah Nasional (SIPSN)
          KLHK 2025. Data penduduk digunakan sebagai penyebut indikator per
          kapita dan perlu diperlakukan sebagai estimasi.
        </p>
      </section>
    </div>
  );
}
