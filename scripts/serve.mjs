/* A static server that behaves like Vercel does for this build:
   - a request for /fitur serves dist/fitur/index.html
   - a request for a missing path serves dist/404.html with status 404
   - a request for /assets/... serves the file

   `vite preview` cannot be used to verify this: it is an SPA server and answers
   every unknown route with the root index.html, which hides both the prerender
   and the 404 behaviour. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const root = process.argv[2] || "dist";
const port = Number(process.argv[3] || 4301);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

const isFile = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const clean = normalize(url).replace(/^(\.\.[/\\])+/, "");
  const candidates = [
    join(root, clean),
    join(root, clean, "index.html"),
    join(root, `${clean}.html`),
  ];

  for (const file of candidates) {
    if (await isFile(file)) {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
      return res.end(body);
    }
  }

  const nf = join(root, "404.html");
  const body = await isFile(nf) ? await readFile(nf) : "Not found";
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
