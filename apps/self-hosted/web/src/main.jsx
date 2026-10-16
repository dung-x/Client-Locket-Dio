import "./polyfills";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/legacy-safari12.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/pages/ErrorBoundary";

// Service Worker is unreliable on iOS 12 (no Push API, buggy skipWaiting /
// clients.claim). Only register on browsers with real SW support and skip
// the known-broken iOS 12 WebKit. Never block first render on SW.
var isOldIOS12 = /OS 12_|Version\/12\./.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);
var supportsSW =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  !isOldIOS12;

if (supportsSW) {
  import("virtual:pwa-register").then(function (mod) {
    var registerSW = mod.registerSW;
    var updateSW = registerSW({
      onNeedRefresh: function () {
        console.log("🔄 Có bản mới, đang cập nhật...");
        updateSW(true); // ✅ Gọi để skipWaiting và reload
      },
      onOfflineReady: function () {
        console.log("✅ Đã sẵn sàng để dùng offline!");
      },
    });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
