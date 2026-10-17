const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });

const cors = require("cors");
const { logInfo } = require("./src/utils/logEventUtils.js");

// Routers
const routes = require("./src/routes/index.js");
const errorHandler = require("./src/helpers/error-handler.js");

const app = express();

// === CORS: cho phép origin cấu hình qua .env (phần riêng tư) ===
// Mặc định chỉ localhost:5173. Khi chạy trên LAN/preview server từ thiết bị
// khác (vd http://192.168.1.10:5173), browser sẽ block mọi request nếu
// không khai báo ALLOWED_ORIGINS.
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // curl / same-server / Health check không có Origin
      if (!origin) return callback(null, true);
      if (
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      // Log để dễ debug cấu hình
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false); // reject theo chuẩn CORS (không crash)
    },
    methods: ["GET", "POST", "OPTIONS"],

    // Nhằm cho phép client gửi cookie lên server
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Nạp các route vào ứng dụng
routes(app);

// Middleware xử lý lỗi
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logInfo("SERVER", `Server backend is running at localhost:${PORT}`);
});
