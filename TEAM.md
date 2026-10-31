# Orelacat — tim & pembagian kerja

Empat agent, satu website. Setiap bagian dikerjakan terpisah lalu digabung di `App.jsx`.
Nama dipilih sesuai peran, bukan hiasan — tiap agent punya satu bidang dan satu keluaran.

| Agent | Bidang | Tanggung jawab | Keluaran |
|---|---|---|---|
| **Kuro** | Art direction & identitas | Menurunkan palet, tipografi, dan tekstur dari logo. Memutuskan bahwa logo monokrom berarti website tidak boleh berwarna. | `styles.css` (token), keputusan palet |
| **Naomi** | UX & struktur informasi | Urutan cerita: masalah → bukti → produk → harga → ajakan. Menentukan bahwa tiga preview perangkat harus bisa dibandingkan, bukan ditumpuk. | `App.jsx` (urutan section), `DeviceShowcase` |
| **Rafi** | UI & motion | Mengadopsi komponen animasi 21st.dev, menyesuaikan easing dan jarak agar cocok dengan nada tenang logo. Menjaga semua animasi di bawah 16px offset. | `anim.jsx`, seluruh motion |
| **Sena** | Isi & data | Menulis copy dari fitur yang benar-benar ada di aplikasi, bukan mengarang. Angka diambil dari build nyata (versi, jumlah fitur, izin). | `content.js`, seluruh teks |

## Aturan yang disepakati bersama

1. **Warna ditentukan logo, bukan tren.** Skill UI/UX menyarankan indigo + hijau; ditolak karena logo-nya hitam-putih hasil etsa.
2. **Satu aksen hangat saja** (`--ember`), dipakai kurang dari 5% permukaan.
3. **Animasi tidak boleh menunda bacaan.** Offset maksimum 16px, durasi 550–700ms, easing `cubic-bezier(0.16,1,0.3,1)`.
4. **Hormati `prefers-reduced-motion`.** Semua gerak dimatikan, konten langsung terlihat.
5. **Tanpa emoji sebagai ikon.** Semua ikon SVG inline.
6. **Kontras teks minimum 4.5:1** di atas latar gelap.
7. **Tidak ada klaim palsu.** Fitur yang belum terverifikasi di perangkat nyata ditandai di catatan, tidak disembunyikan.

## Sumber

- Animasi: 21st.dev (BlurReveal, BlurFade, TextShimmer, NumberTicker, Marquee, MagneticButton, SpotlightCard) — MIT, framer-motion.
- Panduan desain: ui-ux-pro-max-skill (pola *Feature-Rich Showcase*, batasan aksesibilitas, anti-pattern).
- Logo & tautan: milik FahrillAS.
