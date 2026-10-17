import { defineConfig } from "vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import * as babel from "@babel/core";
import presetEnv from "@babel/preset-env";
import presetReact from "@babel/preset-react";

const manifestForPlugIn = {
  // ✅ Dùng đúng chiến lược cập nhật SW
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.js",

  // ✅ Auto inject code register SW
  injectRegister: "auto",
  injectManifest: {
    maximumFileSizeToCacheInBytes: 0, // ✅ TẮT HOÀN TOÀN cache tự động
  },

  // ✅ Tự kiểm tra và cập nhật SW khi có bản mới
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
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  },
};

// Safari 12.5 single-build: one bundle (no nomodule/SystemJS split).
// @babel/preset-env downlevels ?. / ?? / async-await / class fields etc.
// src/polyfills.js supplies the runtime APIs Babel doesn't polyfill.
const safari12Babel = {
  name: "safari-12-babel",
  enforce: "pre",
  transform(code, id) {
    if (!/\.[cm]?[jt]sx?$/.test(id)) return null;
    // Deps already ship ES2017+; sw.js is hand-written ES5 and built
    // separately by vite-plugin-pwa — leave both alone.
    if (id.includes("node_modules") || id.includes("/sw.js")) return null;

    let result;
    try {
      result = babel.transformSync(code, {
        filename: id,
        presets: [
          [presetEnv, {
            targets: { safari: "12", ios: "12" },
            modules: false,
            useBuiltIns: false,
          }],
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
  server: {
    host: true,
  },
  plugins: [safari12Babel, VitePWA(manifestForPlugIn), visualizer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // alias @ trỏ vào thư mục src
    },
  },
  build: {
    target: "es2017",
    minify: "esbuild",
    cssTarget: "safari12",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          ui: ["lucide-react", "sonner", "react-icons", "react-fast-marquee", "swiper"],
          crop: ["react-easy-crop"],
          vendor: ["axios", "zustand", "dexie"]
        },
      },
    },
    chunkSizeWarningLimit: 1500, // tăng giới hạn warning, đỡ spam console
  },
});
