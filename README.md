# 📋 Planner Pro + Budget Tracker

Dashboard produktivitas all-in-one buat ngatur jadwal pelajaran, tugas/PR, workout, nabung, koleksi donghua, budget, dan grafik statistik.  
Bisa diakses online, di-install sebagai aplikasi Android (PWA), dan **offline**!

![Planner Pro](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![PWA](https://img.shields.io/badge/PWA-ready-purple) ![offline](https://img.shields.io/badge/offline-yes-green)

---

## ✨ Fitur Utama

- **📚 Belajar & Tugas**  
  Jadwal pelajaran 5 hari (Senin–Jumat) + manajemen tugas/PR (deadline, mapel, filter selesai/belum) + catatan belajar.

- **💪 Workout**  
  Jadwal latihan per hari, set/reps/kg, muscle group focus, history 7 hari, streak tracker, volume total.

- **💰 Nabung**  
  Target tabungan dengan progress bar, input nominal auto-format rupiah (titik setiap 3 digit).

- **🎬 Donghua Tracker**  
  Pantau episode, status (watching/finished/waiting), rating, favorit, filter, sorting, search, statistik.

- **📊 Grafik Statistik**  
  6 jenis chart (tugas selesai, distribusi mapel, tren harian, workout harian, volume, hari aktif) pake Chart.js.

- **💸 Budget Tracker**  
  Catat pemasukan & pengeluaran, saldo otomatis, riwayat transaksi.

- **🤖 AI Assistant**  
  Perintah suara/teks sederhana (contoh: "Tambah donghua Solo Leveling episode 12", "Tugas Matematika deadline besok").

- **🎨 4 Tema Kustom**  
  Light, Dark, Blue Light, Blue Dark – ganti tema dengan satu klik, ikon berbeda tiap mode.

- **📱 PWA & Offline**  
  Bisa di-install di HP/PC, akses penuh meski tanpa internet (service worker caching).

- **📥 Ekspor Data**  
  Unduh jadwal pelajaran dan workout dalam format teks.

---

## 🚀 Demo Langsung

Coba langsung di:  
🔗 **[https://username.github.io/planner-pro/](https://username.github.io/planner-pro/)**  
_(ganti `username` dan `planner-pro` sesuai repo kamu)_

---

## 🛠️ Teknologi

- HTML5 + CSS3 (Inter font, Font Awesome 6)
- Vanilla JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) untuk grafik
- Service Worker & Web App Manifest (PWA)
- LocalStorage untuk penyimpanan data

---

## 📂 Struktur Proyek

---

## 🔧 Cara Pakai (Lokal)

1. Clone repo ini atau download ZIP.
2. Buka `index.html` di browser (disarankan pakai Live Server biar service worker aktif).
3. Semua data otomatis tersimpan di localStorage browser.

---

## 📱 Instal sebagai Aplikasi (PWA)

1. Hosting di **GitHub Pages** (aktifkan di Settings > Pages).
2. Buka situs di Chrome Android/PC.
3. Akan muncul pop-up “Add to Home Screen” atau klik menu browser > “Install”.
4. Aplikasi akan terpasang dan bisa dibuka **offline**!

---

## 📦 Bikin APK (Android)

1. Buka [pwabuilder.com](https://www.pwabuilder.com/).
2. Masukkan URL GitHub Pages kamu.
3. Klik “Start”, lalu di bagian **Android** pilih “Store Package”.
4. Download APK, transfer ke HP, install.
5. Planner Pro siap jadi aplikasi Android **tanpa internet**!

---

## 🎨 Kustomisasi Tema

Klik tombol palet (🎨) di sidebar bawah untuk mengganti tema secara live.  
Ikon tema akan berubah sesuai mode:
- 🌞 Light
- 🌙 Dark
- ⛅ Blue Light
- ☁️ Blue Dark

---

## 🤖 AI Assistant (Tips)

Ketik perintah di panel AI (kanan) atau klik robot di topbar. Contoh:
- `Tambah donghua Solo Leveling episode 12`
- `Tugas Matematika deadline besok`
- `Jadwal Senin 07:00 Fisika`
- `Target nabung beli sepatu 500000`
- `Catat langkah 5000`

---

## 📝 Lisensi

Proyek ini open-source di bawah [MIT License](LICENSE).  
Bebas dipakai, dimodifikasi, dan disebarluaskan.

---

Dikembangkan dengan ❤️ oleh [Nama Kamu]  
⭐ Jangan lupa kasih bintang ya!
