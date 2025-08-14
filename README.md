# Aplikasi Laporan Surat Masuk/Keluar — Seksi PD Pontren Gowa

Aplikasi web sederhana (PWA) untuk mencatat, memfilter, dan mengekspor **surat masuk** dan **surat keluar**. Dapat dibuka di Android, iPhone, dan PC Windows melalui browser modern. Bisa dipasang ke layar utama dan berjalan offline. Data disimpan di perangkat (LocalStorage) dan dapat di-*backup*/*restore* (JSON).

## Fitur Utama
- Form entri **Surat Masuk** & **Surat Keluar**.
- Pencarian, filter jenis, dan rentang tanggal.
- Ekspor ke **CSV** atau **JSON** (unduh satu klik).
- *Backup* & *Restore* seluruh database (JSON).
- Edit/Hapus entri dengan cepat.
- **PWA**: bisa di-*install* dan berjalan **offline**.
- Tanpa server, cukup *static hosting*.

## Cara Pakai Cepat
1. **Ekstrak ZIP** ini.
2. Buka `index.html` di browser (Chrome/Edge/Firefox/Safari).
3. Tambahkan entri pada sisi kiri, data tampil di tabel.
4. Gunakan **Backup** untuk simpan cadangan (`.json`) dan **Pulihkan** untuk memuat kembali.
5. Gunakan **Unduh CSV/JSON** di panel Filter untuk laporan.

> Catatan: Data tersimpan **lokal di perangkat**. Untuk dipakai banyak perangkat, unggah folder ini ke hosting (Netlify, GitHub Pages, Cloudflare Pages, Vercel, dsb) atau ke server internal agar semua bisa mengakses alamat yang sama. Bila ingin satu database bersama (terpusat), perlu versi lanjutan dengan backend (mis. Firebase/Supabase/MySQL + API).

## Struktur
- `index.html` — antarmuka utama
- `app.js` — logika aplikasi (penyimpanan, filter, ekspor)
- `manifest.webmanifest`, `sw.js` — PWA/offline
- `icon-192.png`, `icon-512.png` — ikon

## Keamanan & Keterbatasan
- Tidak ada login/otorisasi. Jangan memasukkan data rahasia/bernilai tinggi.
- Lampiran berkas tidak disimpan (disarankan menyimpan di Drive/server dan mencantumkan tautan pada kolom Catatan).
- Untuk pencatatan volume besar dan multi-pengguna, gunakan versi backend.

Selamat memakai! 🙌
