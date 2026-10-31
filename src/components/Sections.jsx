import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BlurFade, BlurReveal, MagneticButton, Marquee, NumberTicker, SpotlightCard, TextShimmer } from "./anim.jsx";
import { activities, features, links, live, stats, subscribeLive } from "../content.js";
import { footerPages, navPages } from "../seo-data.js";
import { lazy, Suspense } from "react";

/* The shader is a Three.js scene. It is worth its weight on a desktop but it is
   decoration, so it loads as its own chunk after first paint instead of sitting
   in the entry bundle — Lighthouse measured 25 s of total blocking time on a
   throttled phone, most of it this library parsing before anything rendered. */
const ShaderAnimation = lazy(() => import("./ui/shader-animation.jsx"));


/** Re-renders when the update feed answers. Returns the live version map. */
function useLiveVersions() {
  const [v, setV] = useState({ android: live.android, desktop: live.desktop });
  useEffect(() => subscribeLive(setV), []);
  return v;
}

/* ---------- nav ---------- */

function Nav({ path }) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${solid ? "nav--solid" : ""}`}>
      <div className="nav-inner shell">
        <a className="nav-brand" href="#top">
          <img src="/logo-128.webp" alt="" className="nav-logo" width="26" height="26" decoding="async" />
          <span className="nav-word">orelacat</span>
        </a>
        <nav className="nav-links" aria-label="Halaman">
          {navPages.length > 0 ? (
            navPages.map((p) => (
              <a key={p.path} href={p.path} aria-current={path === p.path ? "page" : undefined}>
                {p.label}
              </a>
            ))
          ) : (
            // No page is finished yet. Link to the sections that do exist rather
            // than showing an empty nav or advertising pages that are noindex.
            <>
              <a href="#devices">Pratinjau</a>
              <a href="#features">Fitur</a>
              <a href="#privacy">Privasi</a>
              <a href="#pricing">Membership</a>
            </>
          )}
        </nav>
        <MagneticButton href={links.linktree} className="btn btn--ghost nav-cta" strength={4}>
          Links
        </MagneticButton>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  const versions = useLiveVersions();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* The scroll-linked transform is attached only after mount. On the server the
     style would be written as `opacity:1;transform:none`, and the client's first
     render produces the same values but through a different path — enough for
     React to see a mismatch and re-render the subtree. */
  const [parallax, setParallax] = useState(false);
  useEffect(() => setParallax(true), []);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-shader" aria-hidden="true">
        {/* A static glow is the prerendered state: it costs nothing, and it is
            what the page shows until the shader chunk arrives (or forever, if
            the visitor has JavaScript off). */}
        <div className="hero-shader-static" />
        <Suspense fallback={null}>
          <ShaderAnimation speed={0.05} opacity={0.8} tint={[0.72, 0.66, 0.58]} />
        </Suspense>
      </div>
      <div className="hero-grid" aria-hidden="true" />
      <motion.div className="shell hero-inner" style={parallax ? { y, opacity } : undefined}>
        <div className="hero-top">
          <span className="eyebrow">
            <span className="dot" />{" "}
            {versions.android?.versionName ? `v${versions.android.versionName}` : "v6.0.57"} · Android,
            tablet, Windows
          </span>
          <span className="eyebrow hero-top-right">
            <TextShimmer>free forever</TextShimmer>
          </span>
        </div>

        <h1 className="display hero-title">
          <BlurReveal text="Music without" />
          <br />
          <em>
            <BlurReveal text="the noise." delay={0.22} />
          </em>
        </h1>

        <div className="hero-cols">
          <BlurFade delay={0.5} className="hero-copy">
            <p className="lede">
              Orelacat plays your music and nothing else. No ads between tracks, no account to
              listen, no telemetry watching what you replay at 2am. The only thing it adds is a
              small island around the camera that tells you what is playing.
            </p>
            <div className="hero-actions">
              <MagneticButton
                href={versions.android?.downloadUrl || links.download}
                className="btn btn--solid"
              >
                Download for Android
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </MagneticButton>
              <MagneticButton
                href={versions.desktop?.installerUrl || links.downloadDesktop}
                className="btn btn--ghost"
              >
                Download for Windows
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path
                    d="M4 6.5 10.5 5.5v6H4zM13 5.2 20 4v7.5h-7zM4 13h6.5v6L4 18zM13 13h7v7l-7-1.2z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
              </MagneticButton>
              <MagneticButton href={links.linktree} className="btn btn--ghost">
                All links
              </MagneticButton>
            </div>
          </BlurFade>

          {/* Not wrapped in BlurFade: this crest is the largest element above
              the fold, and starting it at opacity 0 held the paint back until
              the animation began — Lighthouse attributed ~1.2 s of LCP to that
              render delay. It now shows immediately. */}
          <div className="hero-mark">
            <div className="hero-mark-frame">
              <img
                src="/logo.webp"
                alt="Orelacat crest: a warrior flanked by two cats beneath a crest"
                width="560"
                height="560"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="hero-mark-cap">
              The crest, drawn for the player — a warrior between two cats.
            </div>
          </div>
        </div>

        <BlurFade delay={0.75}>
          <div className="hero-stats">
            {stats.map((s) => (
              <div className="hero-stat" key={s.label}>
                <div className="hero-stat-num">
                  <NumberTicker value={s.value} suffix={s.suffix} />
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </BlurFade>
      </motion.div>
    </section>
  );
}

/* ---------- marquee strip ---------- */

function Strip() {
  return (
    <div className="strip">
      <Marquee speed={38}>
        <div className="strip-track">
          {activities.map((a) => (
            <span className="strip-item" key={a}>
              <svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
              {a}
            </span>
          ))}
        </div>
      </Marquee>
    </div>
  );
}

/* ---------- features ---------- */

function Features() {
  return (
    <section className="section" id="features">
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow">What it does</div>
          <h2 className="display sec-title">
            Six things it does,
            <br />
            <em>and one it refuses to.</em>
          </h2>
          <p className="lede sec-lede">
            It refuses to sell your listening. Everything below is in the build you can download
            today.
          </p>
        </div>

        <div className="feat-grid">
          {features.map((f, i) => (
            <BlurFade key={f.key} delay={i * 0.06}>
              <SpotlightCard className="feat">
                <div className="feat-top">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-tag">{f.tag}</span>
                </div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-body">{f.body}</p>
              </SpotlightCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- privacy ---------- */

function Privacy() {
  const rows = [
    { k: "Writes to disk", v: "never" },
    { k: "Writes to logs", v: "never" },
    { k: "Network calls in the listener", v: "zero" },
    { k: "Analytics SDKs", v: "none" },
    { k: "Build fails if any of the above changes", v: "yes" },
  ];
  return (
    <section className="section privacy" id="privacy">
      <div className="shell privacy-inner">
        <BlurFade className="privacy-copy">
          <div className="eyebrow">The permission people ask about</div>
          <h2 className="display sec-title">
            It can read your
            <br />
            notifications. <em>It doesn't keep them.</em>
          </h2>
          <p className="lede">
            A notification listener is the one permission that can see everything the phone
            notifies about. Orelacat holds each one in memory for the few seconds it is on screen
            and drops it. There is no HTTP client, socket or URL in that file — and a test reads
            the source and fails the build if anyone adds one.
          </p>
        </BlurFade>

        <BlurFade delay={0.12} className="privacy-table">
          {rows.map((r) => (
            <div className="privacy-row" key={r.k}>
              <span className="privacy-k">{r.k}</span>
              <span className="privacy-v">{r.v}</span>
            </div>
          ))}
        </BlurFade>
      </div>
    </section>
  );
}

/* ---------- pricing ---------- */

function Pricing() {
  const tiers = [
    { name: "Free", price: "Rp0", note: "everything above", items: ["All features", "No ads", "No account"] },
    { name: "Basic", price: "Rp5.000", note: "per month", items: ["Community badge", "Public stats, opt-in"] },
    { name: "Premium", price: "Rp15.000", note: "per month", items: ["Verified badge", "Priority support"] },
    { name: "Exclusive", price: "Rp25.000", note: "per month", items: ["Verified badge", "Early builds"] },
  ];
  return (
    <section className="section" id="pricing">
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow">Membership, if you want one</div>
          <h2 className="display sec-title">
            The player is free.
            <br />
            <em>The badge is not.</em>
          </h2>
          <p className="lede sec-lede">
            Nothing is locked behind these. They buy a badge beside your name and a place on the
            community board — that is the whole list.
          </p>
        </div>
        <div className="tiers">
          {tiers.map((t, i) => (
            <BlurFade key={t.name} delay={i * 0.07}>
              <div className={`tier ${i === 0 ? "tier--free" : ""}`}>
                <div className="tier-name">{t.name}</div>
                <div className="tier-price">{t.price}</div>
                <div className="tier-note">{t.note}</div>
                <ul className="tier-list">
                  {t.items.map((it) => (
                    <li key={it}>
                      <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                        <path
                          d="M4 12.5 9.5 18 20 6.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- faq ---------- */

function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq">
      <div className="shell faq-inner">
        <div className="eyebrow">Questions</div>
        <div className="faq-list">
          {items.map((it, i) => (
            <div className={`faq-item ${open === i ? "open" : ""}`} key={it.q}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{it.q}</span>
                <motion.span
                  className="faq-plus"
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="faq-a-wrap"
                  >
                    <p className="faq-a">{it.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  const versions = useLiveVersions();
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logo-128.webp" alt="" className="footer-logo" width="40" height="40" loading="lazy" decoding="async" />
            <div>
              <div className="footer-word">orelacat</div>
              <div className="footer-tag">Free music, no noise.</div>
            </div>
          </div>
          <nav className="footer-links" aria-label="Peta situs">
            {footerPages.map((p) => (
              <a key={p.path} href={p.path}>
                {p.label}
              </a>
            ))}
            <a href={links.linktree} rel="me">
              Linktree
            </a>
            <a href={links.whatsapp}>Saluran WhatsApp</a>
            <a href={links.instagram} rel="me">
              Instagram
            </a>
            <a href={links.tiktok} rel="me">
              TikTok
            </a>
            <a href={links.trakteer}>Trakteer</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            Built by FahrillAS ·{" "}
            {versions.android?.versionName ? `v${versions.android.versionName}` : "v6.0.57"}
          </span>
          <span className="footer-fine">
            Based on Riff by rootscripts (MIT). Icons drawn inline; no emoji.
          </span>
        </div>
      </div>
    </footer>
  );
}

export { Hero, Strip, Features, Privacy, Pricing, Faq, Footer, Nav };
