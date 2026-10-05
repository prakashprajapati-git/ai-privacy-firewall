import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Custom plugin to copy manifest.json and icons to dist/
const copyExtensionAssets = () => {
  return {
    name: "copy-extension-assets",
    closeBundle() {
      const distDir = path.resolve("dist");
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      if (fs.existsSync("manifest.json")) {
        fs.copyFileSync("manifest.json", path.join(distDir, "manifest.json"));
      }

      // Copy icons
      const iconsSrc = path.resolve("public/icons");
      const iconsDist = path.resolve("dist/icons");
      if (fs.existsSync(iconsSrc)) {
        if (!fs.existsSync(iconsDist)) {
          fs.mkdirSync(iconsDist, { recursive: true });
        }
        for (const file of fs.readdirSync(iconsSrc)) {
          fs.copyFileSync(path.join(iconsSrc, file), path.join(iconsDist, file));
        }
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), copyExtensionAssets()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "index.html"),
        dashboard: path.resolve(__dirname, "dashboard.html"),
        background: path.resolve(__dirname, "src/background/background-service-worker.ts"),
        content: path.resolve(__dirname, "src/content/content-script.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") return "background.js";
          if (chunkInfo.name === "content") return "content.js";
          return "[name].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
