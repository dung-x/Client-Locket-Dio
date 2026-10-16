import axios from "axios";
import { CONFIG } from "@/config";

// Kiểm tra kết nối tới backend (api / storage).
// Cả hai server đều trả về 200 cho GET "/" ({ message: "Server is running!" }),
// nên chỉ cần ping root. Không throw — trả về true/false.
// (Safari 12-safe: không dùng ?. / ??, axios + async/await đã có polyfill.)

export function getApiBaseUrl() {
  if (CONFIG && CONFIG.api) return CONFIG.api.authUrl || CONFIG.api.baseUrl || "";
  return "";
}

export function getStorageBaseUrl() {
  if (CONFIG && CONFIG.api) return CONFIG.api.storage || "";
  return "";
}

export async function isServerUp(baseUrl, timeoutMs) {
  if (!baseUrl) return false;
  var timeout = timeoutMs || 15000;
  try {
    var response = await axios.get(baseUrl + "/", { timeout: timeout });
    return response && response.status === 200;
  } catch (error) {
    return false;
  }
}

export function isApiUp(timeoutMs) {
  return isServerUp(getApiBaseUrl(), timeoutMs);
}

export function isStorageUp(timeoutMs) {
  return isServerUp(getStorageBaseUrl(), timeoutMs);
}

// Kiểm tra cả hai song song: { api: bool, storage: bool }
export async function checkBackends(timeoutMs) {
  var results = await Promise.all([isApiUp(timeoutMs), isStorageUp(timeoutMs)]);
  return { api: results[0], storage: results[1] };
}
