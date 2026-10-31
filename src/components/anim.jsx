import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ============================================================
   Animation primitives, adopted from 21st.dev components.
   Each one names the component it came from so the provenance
   is auditable. All are MIT, all run on framer-motion.
   ============================================================ */

/**
 * BlurReveal — from 21st.dev/@tom_ui/components/blur-reveal
 *
 * Characters resolve out of a blur one after another. Kept to
 * headlines under ~8 words: splitting creates one span per
 * character, and the cost is only worth paying for display type.
 */
export function BlurReveal({ text, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  /* One text node. No per-character spans, no hidden duplicate.
     Earlier versions split the headline so each character could blur in; that
     made a crawler read "M u s i c", and the hidden copy I added to fix it put
     the phrase in the h1 twice. The reveal is now a CSS animation on the whole
     line (`.blur-reveal`, in styles.css) — same feel, one clean string, and no
     hydration surface for framer-motion to disagree about. */
  return (
    <span
      ref={ref}
      className={`blur-reveal ${className}`}
      data-in={inView ? "1" : undefined}
      style={{ animationDelay: `${delay}s` }}
    >
      {text}
    </span>
  );
}

/**
 * BlurFade — from 21st.dev/@dillionverma/components/blur-fade
 *
 * The block-level sibling of the above: a small rise out of blur,
 * used for everything that is not display type. Offset stays
 * under 16px so it reads as a fade rather than a slide.
 */
export function BlurFade({ children, delay = 0, y = 12, className = "", once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-10% 0px" });
  // Same reasoning as BlurReveal: no animation style until after mount, so the
  // prerendered HTML and the client's first render match.
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(true), []);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={armed ? { opacity: 0, filter: "blur(8px)", y } : false}
      animate={armed && inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * TextShimmer — from 21st.dev/@edwinvakayil/components/shimmer-text
 *
 * A highlight travelling across a line, used here only for the
 * "live" label. It signals motion without adding a spinner.
 */
export function TextShimmer({ children, className = "" }) {
  return (
    <motion.span
      className={className}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--ink-faint) 0%, var(--ink) 45%, var(--ink) 55%, var(--ink-faint) 100%)",
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      animate={{ backgroundPosition: ["120% 0%", "-20% 0%"] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

/**
 * NumberTicker — from 21st.dev (Number Ticker, Magic UI lineage)
 *
 * Counts up once when scrolled into view. Uses a spring so the
 * final digits settle rather than snapping.
 */
export function NumberTicker({ value, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 34, stiffness: 90 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));
  // Start at the real number, not zero: the counter is decoration, and a
  // prerendered page must state "155 MB", not "0 MB". The animation only
  // replays on the client after hydration.
  const [shown, setShown] = useState(() => value.toFixed(decimals));

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => display.on("change", (v) => setShown(v)), [display]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {shown}
      {suffix}
    </span>
  );
}

/**
 * Marquee — from 21st.dev community marquee components
 *
 * Two copies of the track, translated by -50%, so the loop has no
 * seam. Pauses on hover: reading a moving line should be possible.
 */
export function Marquee({ children, speed = 32, className = "", reverse = false }) {
  return (
    <div className={`marquee ${className}`} data-reverse={reverse}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        <div className="marquee-inner">{children}</div>
        <div className="marquee-inner" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

/**
 * MagneticButton — from 21st.dev cursor/magnetic components
 *
 * The button leans toward the pointer. Capped at 6px so it feels
 * responsive rather than rubbery, and disabled for touch, where
 * there is no pointer to lean toward.
 */
export function MagneticButton({ children, className = "", href, onClick, strength = 6 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 18, stiffness: 220 });
  const sy = useSpring(y, { damping: 18, stiffness: 220 });

  function move(e) {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * strength * 2);
    y.set(((e.clientY - r.top) / r.height - 0.5) * strength * 2);
  }

  function leave() {
    x.set(0);
    y.set(0);
  }

  const Tag = href ? "a" : "button";

  return (
    <motion.div style={{ x: sx, y: sy, display: "inline-block" }}>
      <Tag
        ref={ref}
        href={href}
        onClick={onClick}
        className={className}
        onPointerMove={move}
        onPointerLeave={leave}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

/**
 * SpotlightCard — from 21st.dev card components
 *
 * A soft light follows the pointer across a card's surface. The
 * gradient is drawn from the pointer position rather than animated
 * across time, so it costs nothing when the pointer is still.
 */
export function SpotlightCard({ children, className = "", style }) {
  const ref = useRef(null);
  // The glow is written only after the first pointer event. Rendering it on the
  // server meant the prerendered HTML carried `opacity:0` and a gradient at
  // 50%/0%, while the client's first render produced different inline styles —
  // a hydration mismatch React reports as error #418.
  const [glow, setGlow] = useState(null);

  function move(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setGlow({
      opacity: 1,
      background: `radial-gradient(340px circle at ${x}% ${y}%, rgba(242,239,233,0.07), transparent 70%)`,
    });
  }

  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
      style={style}
      onPointerMove={move}
      onPointerLeave={() => setGlow(null)}
    >
      <div className="spotlight-glow" style={glow ?? undefined} />
      {children}
    </div>
  );
}
