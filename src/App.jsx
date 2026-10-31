import { useEffect } from "react";
import { Faq, Features, Footer, Hero, Nav, Pricing, Privacy, Strip } from "./components/Sections.jsx";
import DeviceShowcase from "./components/DeviceShowcase.jsx";
import { faq, loadLiveVersions } from "./content.js";
import "./styles.css";
import "./app.css";

export default function App() {
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
  }, []);

  return (
    <div className="grain">
      <Nav />
      <main>
        <Hero />
        <Strip />
        <DeviceShowcase />
        <Features />
        <Privacy />
        <Pricing />
        <Faq items={faq} />
      </main>
      <Footer />
    </div>
  );
}
