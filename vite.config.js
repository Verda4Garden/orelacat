import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    // Lighthouse flags a large first-party bundle with no source map. They cost
    // nothing at runtime (browsers only fetch them when DevTools is open) and
    // make a production stack trace readable.
    sourcemap: true,
  },
  plugins: [react()],
  server: { port: 5173, host: true },
});
