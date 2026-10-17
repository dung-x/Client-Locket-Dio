import { defineConfig } from "vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import * as babel from "@babel/core";
import presetEnv from "@babel/preset-env";
import presetReact from "@babel/preset-react";

const manifestForPlugIn = {
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.js",
  injectRegister: "auto",
  injectManifest: {
    maximumFileSizeToCacheInBytes: 0,
  },
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "maskable-icon-512x512.png"],
  manifest: {
    name: "Locket Dio",
    short_name: "Locket Dio",
    description: "Locket Dio - Đăng ảnh & Video lên Locket",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  },
  workbox: {
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
    navigateFallbackDenylist: [/^\/assets\//],
  },
};

const safari12Babel = {
  name: "safari-12-babel",
  enforce: "pre",
  transform(code, id) {
    if (!/\.[cm]?[jt]sx?$/.test(id)) return null;
    if (id.includes("node_modules") || id.includes("/sw.js")) return null;
    let result;
    try {
      result = babel.transformSync(code, {
        filename: id,
        presets: [
          [presetEnv, { targets: { safari: "12", ios: "12" }, modules: false, useBuiltIns: false }],
          presetReact,
        ],
        babelrc: false,
        configFile: false,
        sourceMap: true,
      });
    } catch (err) {
      console.warn(`[safari-12-babel] ${id}: ${err.message}`);
      return null;
    }
    return { code: result.code, map: result.map };
  },
};

const brand = process.env.VITE_BRAND;
const publicDir = brand ? `public-${brand}` : "public";

export default defineConfig({
  publicDir,
  base: "/",
  server: { host: true },
  plugins: [safari12Babel, VitePWA(manifestForPlugIn), visualizer()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    target: "es2017",
    minify: "esbuild",
    cssTarget: "safari12",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["axios", "zustand", "dexie", "uuid", "jwt-decode", "clsx", "prop-types", "sonner", "ldrs"],
          react: ["react", "react-dom", "react-router-dom"],
          i18n: ["i18next", "react-i18next", "i18next-browser-languagedetector"],
          icons: ["lucide-react", "react-icons"],
          media: ["swiper", "react-easy-crop"],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
