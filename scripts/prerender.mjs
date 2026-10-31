import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pages, SITE, readyPages } from "../src/seo-data.js";

/* ---------------------------------------------------------------------------
   Prerender.

   Vite builds the client into dist/ as usual. This script then renders the app
   once per public route with react-dom/server and writes each result into its
   own dist/<route>/index.html, replacing the `<!--app-html-->` marker in the
   built template. Vercel serves those files directly, so the first byte a
   crawler gets already contains the headline, the copy and the links.

   Three things this script is careful about:

   1. A page whose `ready` flag is false gets <meta robots="noindex, follow">
      and is left out of sitemap.xml. It is still rendered, so the URL is not a
      dead end for a visitor who has the link.
   2. dist/404.html is a real not-found page, and vercel.json maps unmatched
      paths to it with a 404 status — not a rewrite to the home page, which
      would be a soft 404.
   3. Every page carries its own title, description, canonical and JSON-LD.
   --------------------------------------------------------------------------- */

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = join(root, "dist");

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Replace a <meta> by property/name, inserting it if absent. */
function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function setTitle(html, title) {
  return /<title>.*?<\/title>/i.test(html)
    ? html.replace(/<title>.*?<\/title>/i, `<title>${esc(title)}</title>`)
    : html.replace("</head>", `    <title>${esc(title)}</title>\n  </head>`);
}

function setCanonical(html, url) {
  const tag = `<link rel="canonical" href="${esc(url)}" />`;
  return /<link\s+rel="canonical"[^>]*>/i.test(html)
    ? html.replace(/<link\s+rel="canonical"[^>]*>/i, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

/** JSON-LD for the site and the app. No ratings: there is no real data. */
function structuredData(page, url) {
  const org = {
    "@type": "Organization",
    "@id": `${SITE.origin}/#organization`,
    name: SITE.name,
    url: SITE.origin,
    logo: `${SITE.origin}/icon-512.png`,
    sameAs: [
      "https://linktr.ee/FahrillAS",
      "https://www.instagram.com/fahril29124",
      "https://www.tiktok.com/@fahril29124",
    ],
  };

  const site = {
    "@type": "WebSite",
    "@id": `${SITE.origin}/#website`,
    url: SITE.origin,
    name: SITE.name,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE.origin}/#organization` },
  };

  const app = {
    "@type": "SoftwareApplication",
    "@id": `${SITE.origin}/#app`,
    name: SITE.name,
    url: SITE.origin,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Music player",
    operatingSystem: "Android, Windows",
    inLanguage: ["id", "en"],
    description:
      "Pemutar musik gratis tanpa iklan dengan dynamic island yang mengikuti lagu yang sedang diputar.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
    featureList: [
      "Dynamic island yang mengikuti lagu",
      "Lirik per kata",
      "Tanpa iklan",
      "Equalizer dan crossfade",
      "Unduhan offline",
      "Android, tablet, dan Windows",
    ],
    publisher: { "@id": `${SITE.origin}/#organization` },
  };

  const graph = [org, site, app];

  if (page.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function injectJsonLd(html, data) {
  const tag = `<script type="application/ld+json">${data}</script>`;
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function buildSitemap(routes) {
  const now = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${SITE.origin}${r.path === "/" ? "/" : r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `# Orelacat — https://www.orelacat.my.id
User-agent: *
Allow: /

# No crawl-delay: the site is static and small.
Sitemap: ${SITE.origin}/sitemap.xml
`;
}

/** Apply the per-page <head> to the built template. */
function renderPage(template, route) {
  const url = route.path === "/" ? `${SITE.origin}/` : `${SITE.origin}${route.path}`;

  let html = template;
  // A function replacer, not a string: String.replace reads "$&" and "$'" in
  // the replacement as patterns, and the app's inline CSS contains those
  // sequences — which silently truncated the markup to a few hundred bytes.
  html = html.replace("<!--app-html-->", () => route.body);
  html = setTitle(html, route.title);
  html = setMeta(html, "name", "description", route.description);
  html = setMeta(html, "property", "og:title", route.title);
  html = setMeta(html, "property", "og:description", route.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", route.title);
  html = setMeta(html, "name", "twitter:description", route.description);
  html = setCanonical(html, url);
  html = setMeta(
    html,
    "name",
    "robots",
    route.ready ? "index, follow, max-image-preview:large" : "noindex, follow",
  );
  html = injectJsonLd(html, structuredData(route, url));
  return html;
}

async function main() {
  const template = await readFile(join(dist, "index.html"), "utf8");

  // Built once, outside the loop: the SSR bundle is the same for every route.
  // pathToFileURL matters on Windows: a bare "D:\..." path is read as the "d:"
  // URL scheme and the ESM loader refuses it.
  const { render } = await import(pathToFileURL(join(root, "ssr-out", "entry-server.js")).href);

  const routes = Object.entries(pages).map(([path, page]) => ({ path, ...page }));

  for (const route of routes) {
    const html = renderPage(template, { ...route, body: render(route.path) });
    const out =
      route.path === "/" ? join(dist, "index.html") : join(dist, route.path.slice(1), "index.html");
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html, "utf8");
    const flag = route.ready ? "index" : "noindex";
    console.log(
      `  prerendered ${route.path.padEnd(42)} ${String(html.length).padStart(7)} B  ${flag}`,
    );
  }

  // A real 404 page. vercel.json routes unmatched paths here with status 404,
  // so this is not a rewrite of the home page (which would be a soft 404).
  const notFound = {
    path: "/404",
    ready: false,
    title: "Halaman tidak ditemukan — Orelacat",
    description: "Alamat ini tidak ada di situs Orelacat.",
    changefreq: "yearly",
    priority: 0.0,
  };
  const notFoundHtml = renderPage(template, {
    ...notFound,
    body: render("/404"),
  }).replace(/<link rel="canonical"[^>]*>/, "");
  await writeFile(join(dist, "404.html"), notFoundHtml, "utf8");
  console.log(`  prerendered /404${" ".repeat(38)} ${String(notFoundHtml.length).padStart(7)} B  noindex`);

  // Only finished pages belong in the sitemap.
  const listed = readyPages;
  await writeFile(join(dist, "sitemap.xml"), buildSitemap(listed), "utf8");
  await writeFile(join(dist, "robots.txt"), buildRobots(), "utf8");
  console.log(`  sitemap.xml (${listed.length} of ${routes.length} urls) + robots.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
