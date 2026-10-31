import { renderToStaticMarkup } from "react-dom/server";
import App from "./App.jsx";

/* Build-time entry. Renders the page to static HTML so the served document
   already contains the headline, the copy and the links — Google sees the
   content without running JavaScript. */
export function render(path = "/") {
  /* renderToStaticMarkup, not renderToString: the latter emits React's hydration
     boundary comments and, in React 19, seeds the document-level resource
     stream. We are injecting this string into the body of a plain HTML file
     that the client will hydrate itself, so the static markup is what belongs
     here. */
  return renderToStaticMarkup(<App path={path} />);
}
