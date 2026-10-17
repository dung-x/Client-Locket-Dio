require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const { logGroupWrapper, logInfo } = require("./src/utils/logEventUtils");

const app = express();

// ✅ Cấu hình CORS: cho phép origin cấu hình qua .env (phần riêng tư)
// Mặc định localhost:*; thêm các origin khác qua ALLOWED_ORIGINS.
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/, // localhost:*
  /^http:\/\/127\.0\.0\.1:\d+$/,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => new RegExp(`^${o.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`))
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Cho phép request từ cùng server (ex: curl)
      if (allowedOrigins.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false); // reject theo chuẩn CORS
    },
    credentials: true, // Nếu bạn cần gửi cookie/authorization
  }),
);

// Các middleware khác
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logGroupWrapper);

// Nạp các route vào ứng dụng
routes(app);

// Khởi động server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  logInfo("SERVER", `🚀 Backend đang chạy tại http://localhost:${PORT}`);
});
