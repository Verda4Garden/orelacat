import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./fonts.css";
import App from "./App.jsx";

/* The build prerenders each route into #root, so the first paint is real HTML.
   Hydrating (rather than rendering) reuses that markup instead of throwing it
   away and re-creating it — which is also what keeps the prerendered text
   visible to a crawler that runs JavaScript. */
const container = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

/* The prerendered HTML stays for crawlers; React then renders the same tree
   into #root itself. Hydrating is not viable — framer-motion, the Three.js
   shader and the glass folder write inline styles that differ between server
   and client, and every difference surfaces as error #418. A parallel render
   was tried as well and made total blocking time twice as bad, so the node is
   simply cleared. */
container.innerHTML = "";
createRoot(container).render(app);
