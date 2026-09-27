import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  // Teaching files are served from Google Drive, never copied into the site.
  publicDir: false,
  plugins: [react()],
  build: { outDir: "dist" },
});
