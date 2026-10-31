import { useEffect, useState } from "react";
import { Faq, Features, Footer, Hero, Nav, Pricing, Privacy, Strip } from "./components/Sections.jsx";
import DeviceShowcase from "./components/DeviceShowcase.jsx";
import { faq, loadLiveVersions } from "./content.js";
import { isReady, pages, SITE } from "./seo-data.js";
import "./styles.css";
import "./app.css";

/* ---------------------------------------------------------------------------
   Routing.

   The site is prerendered per route at build time (scripts/prerender.mjs), so
   each page ships its own HTML. This router only needs to make in-page
   navigation work: it reads the path, renders the matching page, and keeps the
   document title, description and canonical in step. No router library: there
   are a dozen static paths and the browser's own History API does the rest.
   --------------------------------------------------------------------------- */

const pathOf = () => {
  const p = window.location.pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
};

function usePath() {
  const [path, setPath] = useState(() => (typeof window === "undefined" ? "/" : pathOf()));

  useEffect(() => {
    const onPop = () => setPath(pathOf());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return path;
}

/** Intercept clicks on internal links so navigation does not reload the page. */
function useLinkInterception() {
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || a.target === "_blank") return;
      e.preventDefault();
      if (href === pathOf()) return;
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

/** Keeps <head> in step with the route. The build already wrote the right tags;
    this only matters after a client-side navigation. */
function useHead(path) {
  useEffect(() => {
    const page = pages[path] || pages["/"];
    const url = path === "/" ? `${SITE.origin}/` : `${SITE.origin}${path}`;
    document.title = page.title;

    const set = (sel, content) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", content);
    };
    set('meta[name="description"]', page.description);
    set('meta[property="og:title"]', page.title);
    set('meta[property="og:description"]', page.description);
    set('meta[property="og:url"]', url);
    set('meta[name="twitter:title"]', page.title);
    set('meta[name="twitter:description"]', page.description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);

    // Same rule the build applies: unfinished pages and unknown routes are
    // noindex. Without this, a client-side navigation to /fitur would keep the
    // indexable robots tag it inherited from the home page.
    const known = Boolean(pages[path]);
    set(
      'meta[name="robots"]',
      known && isReady(path) ? "index, follow, max-image-preview:large" : "noindex, follow",
    );
  }, [path]);
}

export default function App({ path: initialPath }) {
  const routed = usePath();
  // On the server there is no window: the build passes the route in.
  const path = initialPath ?? routed;
  useLinkInterception();
  useHead(path);

  // Ask the update feed what is current. Failure is silent by design: the page
  // renders its static copy first and simply keeps the "—" placeholders.
  useEffect(() => {
    loadLiveVersions();
  }, []);

  // The blur-fade reveal for static blocks, driven by IntersectionObserver rather
  // than a per-element framer subscription: one observer for the page is cheaper
  // and works for markup the animation components do not wrap.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "-8% 0px", threshold: 0.05 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  return (
    <div className="grain">
      <Nav path={path} />
      <main>{path === "/" ? <Home /> : <Page path={path} />}</main>
      <Footer />
    </div>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <Strip />
      <DeviceShowcase />
      <Features />
      <Privacy />
      <Pricing />
      <Faq items={faq} />
    </>
  );
}

/* Placeholder body for routes that FASE 3 has not written yet. It still renders
   real text and a real H1 so the page is not an empty shell for a crawler. */
function Page({ path }) {
  const page = pages[path];
  if (!page || path === "/404") {
    // Rendered for an unknown route. In production that request never reaches
    // React: Vercel answers it from dist/404.html with status 404. This branch
    // covers the client-side case (a link to a typo, or pushState by hand).
    return (
      <section className="section" style={{ paddingTop: 160 }}>
        <div className="shell">
          <div className="eyebrow">404</div>
          <h1 className="display sec-title">Halaman tidak ditemukan</h1>
          <p className="lede">
            Alamat ini tidak ada di situs Orelacat.{" "}
            <a href="/">Kembali ke beranda</a> atau lihat{" "}
            <a href="/#devices">pratinjau aplikasinya</a>.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="section" style={{ paddingTop: 150 }}>
      <div className="shell">
        <div className="eyebrow">{path.slice(1)}</div>
        <h1 className="display sec-title">{page.h1}</h1>
        <p className="lede">{page.description}</p>
      </div>
    </section>
  );
}
