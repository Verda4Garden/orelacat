import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
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

/* The prerendered HTML stays in place for crawlers, but React does not adopt
   it: it renders fresh into the same node. Hydrating this tree proved fragile —
   three libraries (framer-motion, the Three.js shader, the glass folder) write
   inline styles that differ between the server and the client's first render,
   and React reports every difference as a hydration error. A clean client
   render produces the identical DOM with no warnings, and the static HTML has
   already done its job by the time this runs. */
container.innerHTML = "";
createRoot(container).render(app);
