# Konteks Proyek: Modeling Dashboard Sampah 2025 (Tugas Kelompok)

> Ringkasan dari percakapan sebelumnya supaya Claude Code bisa melanjutkan tanpa mengulang analisis.
> Sumber kebenaran hasil modeling: `Modeling_Clustering_Sampah_2025.ipynb` (sudah dijalankan penuh, tanpa error).

## 1. Peran dan cara kerja
- Pengguna: **Toriq**, bagian **modeling** (pilih clustering atau klasifikasi) pada tugas kelompok dashboard.
- Pembagian tugas kelompok: Genda = cari data; Moo = EDA + cleaning; **Toriq = modeling**; Rapopo = dashboard; Fatih = makalah; PPT = bersama.
- Preferensi kerja: bahasa Indonesia; **berpikir kritis dan langsung mengoreksi** kalau pernyataan pengguna keliru atau ada metode yang jauh lebih baik; untuk bug, **minta informasi dulu untuk menemukan akar masalah**, jangan asal beri solusi; beri kode lengkap yang berjalan, bukan petunjuk sepotong-sepotong.
- Format tugas kuliah: notebook Jupyter, satu cell per langkah, analisis singkat setelah tiap output, kode sederhana dan mudah dibaca, visualisasi bila berguna.

## 2. Data
Folder `Output/` (hasil cleaning Moo, kemungkinan besar data SIPSN KLHK 2025, per kab/kota):

| File | Isi | Status |
|---|---|---|
| `sampah_2025_bersih.csv` | **Tabel utama**: 327 kab/kota, 37 provinsi, 26 kolom, tanpa missing dan duplikat | **Dipakai** |
| `komposisi_bersih.csv` | Persentase jenis sampah (sisa makanan, plastik, dst.), 330 baris | Tidak dipakai: 62 baris kosong total |
| `sumber_bersih.csv` | Asal sampah (rumah tangga, pasar, dst.), 330 baris | Tidak dipakai: 103 baris kosong, anomali satuan |
| `ringkasan_provinsi.csv` | Agregasi per provinsi (37 baris) | Tidak dipakai |
| `log_cleaning.csv`, `sampah_2025_perlu_dicek.csv` | Log proses; file `perlu_dicek` kosong | Tidak dipakai |

Hubungan kolom utama: `terkelola = pengurangan + penanganan`; `tidak_terkelola = timbulan - terkelola`; `timbulan_tahunan = harian x 365`; `timbulan_per_kapita = harian x 1000 / penduduk` (kg/orang/hari, kisaran wajar 0,4-0,5).

## 3. Masalah kualitas data (belum diperbaiki, perlu disampaikan ke Moo)
- Semua kolom `flag_*` bernilai `False` dan `perlu_dicek` kosong, padahal ada anomali nyata.
- `sumber_bersih`: dari 227 baris yang bisa dibandingkan dengan timbulan harian, 30 baris tidak cocok (selisih lebih dari 5x atau kurang dari 0,2x). Contoh: Aceh Tenggara 13.992 ton/hari vs Aceh Selatan 20 ton/hari. Jangan dipakai di dashboard sebelum dicek.
- `timbulan_per_kapita`: 31 wilayah (9,5%) bernilai tepat 0,40 atau 0,50 (kemungkinan angka asumsi); ekstrem Denpasar 1,53 dan Kab. Padang Pariaman 0,05.
- Cakupan 327 dari sekitar 514 kab/kota; beberapa provinsi hanya 1-3 wilayah (Papua Tengah, Papua Selatan, Gorontalo, dll.).

## 4. Uji kelayakan yang sudah dilakukan (jangan diulang)
Prediksi supervised `pct_terkelola` dengan GroupKFold per provinsi (fitur: penduduk, kota/kab, timbulan per kapita, komposisi): **gagal**.

| Percobaan | Hasil |
|---|---|
| Baseline rata-rata | R2 = -0,03 |
| Ridge / Random Forest | R2 = 0,00 / -0,05 |
| + komposisi sampah | R2 = -0,02 |
| Klasifikasi rendah/sedang/tinggi | akurasi 38,8% = baseline mayoritas |

Penyebab: fitur tidak menjelaskan target (faktor penentu kemungkinan kebijakan, anggaran, fasilitas), hanya 1 tahun (tidak bisa forecasting), n kecil, target timpang (108 wilayah di bawah 5% terkelola). **Kesimpulan: pakai clustering sebagai model utama; klasifikasi hanya pelengkap.**

## 5. Keputusan modeling (sudah dieksekusi di notebook)
**Clustering K-Means, k = 4**, `random_state=42`.
- Fitur: `log1p(pct_pengurangan)`, `pct_penanganan`, `timbulan_per_kapita`, di-standardisasi.
- Tidak dipakai: `pct_terkelola` dan `pct_tidak_terkelola` (redundan), `jumlah_penduduk`.
- Perbandingan set fitur (silhouette k=3 / k=4): A (pengurangan + penanganan) 0,650 / 0,630; **B (A + per kapita, dipilih)** 0,461 / 0,488; C (B + log penduduk) 0,330 / 0,350. B dipilih sengaja walau skor lebih rendah dari A demi segmen yang lebih informatif.
- Pemilihan k: silhouette tertinggi di k=4 (0,488), Davies-Bouldin terendah di k=4 (0,808).
- Stabilitas: bootstrap ARI 100x rata-rata 0,93 (minimum 0,79); K-Means vs Ward ARI 0,89. PCA 2D menjelaskan 70,3% variasi.
- Silhouette 0,49 = sedang: stabil, tetapi tidak terpisah tegas.

Hasil segmen (nomor cluster diurutkan naik berdasarkan median penanganan):

| Cluster | Label | n | Median penanganan | Median pengurangan | Median per kapita | Contoh |
|---|---|---|---|---|---|---|
| 0 | Belum terkelola | 176 | 2,9% | 0,01% | 0,45 | Jember, Cirebon, Brebes |
| 1 | Timbulan per kapita tinggi | 36 | 17,9% | 0,04% | 0,73 | Jakarta (semua 6 wilayah), Bekasi, Depok |
| 2 | Pengurangan menonjol | 38 | 22,8% | 12,0% | 0,42 | Banyumas, Semarang, Kediri |
| 3 | Penanganan tinggi | 77 | 64,9% | 0,05% | 0,41 | Surabaya (99,2%), Kab. Malang, Sidoarjo |

Catatan penamaan: cluster 1 awalnya dinamai "Timbulan tinggi, pengelolaan rendah", diganti karena penanganannya menyebar 0-99%; cluster ini dibentuk oleh per kapita tinggi, bukan kinerja pengelolaan. Nama cluster dibuat otomatis di kode dari ciri paling menonjol.

Temuan wilayah: Jawa Timur dan Jawa Tengah memuat keempat segmen; provinsi dengan proporsi "Belum terkelola" tertinggi (minimal 5 wilayah): Sulawesi Barat 100%, Lampung dan Kep. Bangka Belitung 83%, Kalimantan Barat 82%.

**Klasifikasi (target = `label_cluster`, bukan label dari luar):**
- B1 Decision Tree (`max_depth=3`, `min_samples_leaf=10`) pada `pct_pengurangan`, `pct_penanganan`, `timbulan_per_kapita`: akurasi 97,6%, **hanya untuk interpretasi**, bukan kemampuan prediksi. Aturan: penanganan > 38,7% dan pengurangan < sekitar 3% = Penanganan tinggi; penanganan <= 38,7% dan pengurangan < sekitar 3% = Belum terkelola; pengurangan > sekitar 3% = Pengurangan menonjol; per kapita > sekitar 0,62-0,70 = Timbulan per kapita tinggi.
- B2 Random Forest pada `log_penduduk` dan `is_kota` (GroupKFold 5 per provinsi): akurasi 55,7% vs baseline 53,8% (F1 macro 0,349 vs 0,175); versi `class_weight=balanced` turun ke 35,2%. Recall per cluster: Belum terkelola 0,90, Timbulan tinggi 0,53 (78% anggotanya kota), Pengurangan menonjol 0,00, Penanganan tinggi 0,06. **Penduduk dan jenis wilayah tidak menjelaskan kualitas pengelolaan.**

## 6. Output yang sudah ada
- `Modeling_Clustering_Sampah_2025.ipynb`: 14 bagian (load data, eksplorasi, pilih fitur, bandingkan set fitur, pilih k, model final, stabilitas, visualisasi PCA dan boxplot, sebaran per provinsi, contoh anggota, decision tree, uji prediksi RF, ekspor, kesimpulan). `DATA_PATH = "Output/sampah_2025_bersih.csv"` (relatif; sesuaikan bila perlu).
- `hasil_clustering_sampah_2025.csv` (327 baris) untuk Rapopo: `provinsi, kab_kota, cluster, label_cluster, jumlah_penduduk, timbulan_harian, timbulan_per_kapita, pct_pengurangan, pct_penanganan, pct_terkelola, pct_tidak_terkelola, pca1, pca2`.
- `profil_cluster_sampah_2025.csv` (ringkasan 4 cluster).

## 7. Yang masih perlu dikerjakan
1. Tempel cell Markdown "Data yang Digunakan" (tabel data untuk clustering dan klasifikasi, serta data yang tidak dipakai) tepat di bawah cell "Tujuan" di notebook.
2. Beri tahu Moo soal anomali `sumber_bersih` dan flag kualitas yang tidak menangkap apa pun.
3. Serahkan CSV hasil ke Rapopo untuk dashboard; berikan ringkasan temuan dan keterbatasan ke Fatih untuk makalah.
4. Konfirmasi ke dosen apakah komponen modeling wajib; jika ya, clustering adalah satu-satunya yang bisa dipertanggungjawabkan.
5. Saat presentasi wajib sebut keterbatasan: 1 tahun data, cakupan 327 wilayah, angka per kapita yang membulat, silhouette sedang, clustering bersifat deskriptif (bukan sebab-akibat).

## 8. Lingkungan
Python 3, `pandas numpy matplotlib seaborn scikit-learn`, Jupyter. Gunakan `random_state=42` agar hasil cluster identik.
