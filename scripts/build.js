import { build } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

async function runBuild() {
  console.log("🚀 Building AI Privacy Firewall Extension...\n");

  // 1. Clean dist
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 2. Build Extension Popup & Dashboard (HTML & React)
  console.log("📦 1/3 Building Popup & Dashboard UI...");
  await build({
    configFile: false,
    root: rootDir,
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(rootDir, "src") },
    },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          popup: path.resolve(rootDir, "index.html"),
          dashboard: path.resolve(rootDir, "dashboard.html"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
  });

  // 3. Build Background Service Worker (ES Module)
  console.log("📦 2/3 Building Background Service Worker...");
  await build({
    configFile: false,
    root: rootDir,
    resolve: {
      alias: { "@": path.resolve(rootDir, "src") },
    },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, "src/background/background-service-worker.ts"),
        formats: ["es"],
        fileName: () => "background.js",
      },
    },
  });

  // 4. Build Content Script (IIFE - 100% Self-Contained, NO ES Import Statements!)
  console.log("📦 3/3 Building Self-Contained Content Script (IIFE)...");
  await build({
    configFile: false,
    root: rootDir,
    resolve: {
      alias: { "@": path.resolve(rootDir, "src") },
    },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      lib: {
        entry: path.resolve(rootDir, "src/content/content-script.ts"),
        formats: ["iife"],
        name: "ContentScript",
        fileName: () => "content.js",
      },
    },
  });

  // 5. Copy manifest.json and icons to dist/
  console.log("📋 Copying manifest.json and extension icons...");
  if (fs.existsSync(path.resolve(rootDir, "manifest.json"))) {
    fs.copyFileSync(
      path.resolve(rootDir, "manifest.json"),
      path.resolve(distDir, "manifest.json")
    );
  }

  const iconsSrc = path.resolve(rootDir, "public/icons");
  const iconsDist = path.resolve(distDir, "icons");
  if (fs.existsSync(iconsSrc)) {
    if (!fs.existsSync(iconsDist)) fs.mkdirSync(iconsDist, { recursive: true });
    for (const file of fs.readdirSync(iconsSrc)) {
      fs.copyFileSync(path.join(iconsSrc, file), path.join(iconsDist, file));
    }
  }

  console.log("\n✅ Extension Build Complete! Dist folder ready at dist/\n");
}

runBuild().catch((err) => {
  console.error("❌ Build error:", err);
  process.exit(1);
});
