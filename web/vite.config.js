import { defineConfig } from "vite";

export default defineConfig({
  root: "web",
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});
