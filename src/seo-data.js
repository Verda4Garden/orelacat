/* SEO metadata, one entry per public page.

   The build reads this file three times: `scripts/prerender.mjs` writes each
   page's <head>, sitemap.xml and robots directives; `src/App.jsx` reads it at
   runtime so client-side navigation keeps <head> in step; and the nav/footer
   build their links from it.

   The `ready` flag is the single switch for a page's visibility:

     ready: false  → <meta robots="noindex, follow">, not in sitemap.xml,
                     not linked from nav or footer. The page still renders, so
                     the URL is not a dead end, but Google is told to ignore it.
     ready: true   → indexable, in sitemap.xml, linked from nav and footer.

   To publish a page after writing its content, change that one flag.

   Rules followed here:
   - title ≤ 60 characters, description ≤ 155.
   - every page has its own canonical on the official domain.
   - no aggregateRating / review: there is no real rating data to cite.
*/

export const SITE = {
  origin: "https://www.orelacat.my.id",
  name: "Orelacat",
  lang: "id",
  locale: "id_ID",
  themeColor: "#060606",
  ogImage: "/og-image.png",
  twitter: "@fahril29124",
};

export const pages = {
  "/": {
    ready: true,
    title: "Orelacat — Pemutar Musik Tanpa Iklan",
    description:
      "Orelacat: pemutar musik gratis tanpa iklan dengan dynamic island yang mengikuti lagumu. Ada di HP, tablet, dan desktop. Dukung komunitas lewat membership.",
    h1: "Musik tanpa kebisingan",
    changefreq: "weekly",
    priority: 1.0,
  },
  "/fitur": {
    ready: false,
    title: "Fitur Orelacat — Dynamic Island & Lirik",
    description:
      "Dynamic island yang mengikuti lagu, lirik per kata, equalizer, unduhan, dan pemutaran tanpa iklan di HP, tablet, dan desktop.",
    h1: "Fitur Orelacat",
    changefreq: "monthly",
    priority: 0.9,
  },
  "/unduh": {
    ready: false,
    title: "Unduh Orelacat — Android & Windows",
    description:
      "Unduh Orelacat untuk Android (APK) dan Windows. Gratis, tanpa iklan, tanpa akun. Versi terbaru selalu di halaman Releases.",
    h1: "Unduh Orelacat",
    changefreq: "weekly",
    priority: 0.9,
  },
  "/membership": {
    ready: false,
    title: "Membership Orelacat — Dukung Komunitas",
    description:
      "Membership Orelacat bersifat sukarela. Pemutar musiknya tetap gratis; membership memberi badge dan mendukung biaya komunitas.",
    h1: "Membership",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/tentang": {
    ready: false,
    title: "Tentang Orelacat — Kenapa Dibuat Tanpa Iklan",
    description:
      "Cerita di balik Orelacat: pemutar musik yang dibuat karena musik seharusnya tidak terpotong iklan.",
    h1: "Tentang Orelacat",
    changefreq: "yearly",
    priority: 0.7,
  },
  "/faq": {
    ready: false,
    title: "FAQ Orelacat — Gratis, Aman, Perangkat",
    description:
      "Pertanyaan umum soal Orelacat: apakah gratis, izin notifikasi untuk apa, perangkat apa saja yang didukung, dan cara membership.",
    h1: "Pertanyaan umum",
    changefreq: "monthly",
    priority: 0.8,
  },
  "/komunitas": {
    ready: false,
    title: "Komunitas Orelacat — WhatsApp & Media Sosial",
    description:
      "Gabung komunitas Orelacat: saluran WhatsApp, Instagram, TikTok, dan Linktree untuk kabar rilis terbaru.",
    h1: "Komunitas",
    changefreq: "monthly",
    priority: 0.7,
  },
  "/blog": {
    ready: false,
    title: "Blog Orelacat — Catatan soal Musik & Iklan",
    description:
      "Tulisan soal mendengarkan musik tanpa iklan, dynamic island, dan hal-hal teknis di balik Orelacat.",
    h1: "Blog",
    changefreq: "weekly",
    priority: 0.7,
  },
  "/blog/mendengarkan-musik-tanpa-iklan": {
    ready: false,
    title: "Cara Mendengarkan Musik Tanpa Iklan di HP",
    description:
      "Langkah praktis mengurangi iklan saat mendengarkan musik di HP, dan alasan kenapa pemutar lokal masih relevan.",
    h1: "Cara mendengarkan musik tanpa iklan di HP",
    changefreq: "yearly",
    priority: 0.6,
  },
  "/blog/kenapa-orelacat-tanpa-iklan": {
    ready: false,
    title: "Kenapa Orelacat Dibuat Tanpa Iklan",
    description:
      "Alasan di balik keputusan tidak memasang iklan di Orelacat, dan apa yang dipakai sebagai gantinya untuk membiayai proyek.",
    h1: "Kenapa Orelacat dibuat tanpa iklan",
    changefreq: "yearly",
    priority: 0.6,
  },
  "/blog/apa-itu-dynamic-island": {
    ready: false,
    title: "Apa Itu Dynamic Island di Pemutar Musik",
    description:
      "Penjelasan dynamic island: apa yang ditampilkan, kenapa posisinya menyesuaikan kamera depan, dan apa bedanya dengan notifikasi biasa.",
    h1: "Apa itu dynamic island di pemutar musik",
    changefreq: "yearly",
    priority: 0.6,
  },
  "/changelog": {
    ready: false,
    title: "Changelog Orelacat — Riwayat Pembaruan",
    description:
      "Riwayat pembaruan Orelacat untuk Android dan Windows. Versi terbaru dan catatan rilis lengkap ada di GitHub Releases.",
    h1: "Riwayat pembaruan",
    changefreq: "weekly",
    priority: 0.6,
  },
  "/privasi": {
    ready: false,
    title: "Kebijakan Privasi Orelacat",
    description:
      "Kebijakan privasi Orelacat: data apa yang tidak dikumpulkan, izin notifikasi dipakai untuk apa, dan hak kamu sebagai pengguna.",
    h1: "Kebijakan privasi",
    changefreq: "yearly",
    priority: 0.4,
  },
  "/syarat": {
    ready: false,
    title: "Syarat Layanan Orelacat",
    description:
      "Syarat layanan Orelacat: ketentuan pemakaian aplikasi dan situs, batasan tanggung jawab, dan lisensi pihak ketiga.",
    h1: "Syarat layanan",
    changefreq: "yearly",
    priority: 0.4,
  },
};

/** Pages that may be indexed and listed. Everything else is noindex + hidden. */
export const readyPages = Object.entries(pages)
  .filter(([, p]) => p.ready)
  .map(([path, p]) => ({ path, ...p }));

/** The nav link set: only pages that are actually finished. */
export const navPages = readyPages.filter((p) => p.path !== "/").slice(0, 5);

/** The footer link set: the same rule, but it can hold every ready page. */
export const footerPages = readyPages.filter((p) => p.path !== "/");

export const isReady = (path) => Boolean(pages[path]?.ready);
