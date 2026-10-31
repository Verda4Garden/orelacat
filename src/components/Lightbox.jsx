import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

/* A full-screen viewer for the screenshots inside a folder.

   The folder's files are buttons; clicking one opens this. It is a real
   lightbox rather than a link to the raw PNG: the image scales to fit any
   window, Escape or a click outside closes it, and the picture keeps its
   own aspect ratio — a phone capture is tall, a desktop one is wide. */
export default function Lightbox({ shot, onClose, onPrev, onNext, index, total }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!shot) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowLeft") onPrev?.();
      else if (e.key === "ArrowRight") onNext?.();
    };
    document.addEventListener("keydown", onKey, true);
    rootRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [shot, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {shot && (
        <motion.div
          ref={rootRef}
          tabIndex={-1}
          className="lb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={shot.name}
          style={{ outline: "none" }}
        >
          <motion.figure
            className="lb-figure"
            initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={shot.image} alt={shot.name} className="lb-img" />
            <figcaption className="lb-cap">
              <span>{shot.name}</span>
              {shot.meta ? <span className="lb-meta">{shot.meta}</span> : null}
              {total > 1 ? (
                <span className="lb-count">
                  {index + 1} / {total}
                </span>
              ) : null}
            </figcaption>

            {total > 1 && (
              <>
                <button className="lb-nav lb-nav--prev" onClick={onPrev} aria-label="Previous">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="lb-nav lb-nav--next" onClick={onNext} aria-label="Next">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            <button className="lb-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
