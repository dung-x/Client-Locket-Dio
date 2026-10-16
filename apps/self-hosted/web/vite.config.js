import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

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

const brand = process.env.VITE_BRAND;
const publicDir = brand ? `public-${brand}` : "public";

export default defineConfig({
  publicDir,
  server: {
    host: true,
  },
  plugins: [
    react(),
    // Safari 12.5 legacy build: transpile ?. / ?? / modern syntax + nomodule fallback.
    // modernTargets pinned to exclude Safari 12 so iOS 12 loads the legacy chunk.
    legacy({
      targets: ["safari >= 12", "ios >= 12", "chrome >= 63", "firefox >= 67"],
      modernTargets: [
        "safari >= 16.4",
        "chrome >= 107",
        "edge >= 107",
        "firefox >= 104",
      ],
      polyfills: true,
      additionalLegacyPolyfills: [
        "regenerator-runtime/runtime",
        "core-js/stable",
      ],
      renderLegacyChunks: true,
      modernPolyfills: true,
    }),
    VitePWA(manifestForPlugIn),
    visualizer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // alias @ trỏ vào thư mục src
    },
  },
  build: {
    // Modern bundle floor; legacy plugin downlevels to ES5/SystemJS for Safari 12.
    target: "es2017",
    // esbuild cannot emit ES5 — terser is required for the legacy chunk.
    minify: "terser",
    terserOptions: {
      ecma: 2017,
      safari10: true,
    },
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
