// 正規化大學官方網址: 確保有 https:// 協議前綴
// College Scorecard 的 school_url 常省略協議 (例如 "www.cpp.edu/")
// 若直接放進 <a href> 會被瀏覽器當成相對路徑
export function normalizeUrl(url) {
  if (!url) return '';
  let u = String(url).trim();
  if (!u) return '';
  // 已含協議: 直接回傳
  if (/^https?:\/\//i.test(u)) return u;
  // 補上 https://
  return 'https://' + u.replace(/^\/+/, '');
}

/** 判斷 URL 是否看起來有效 (含域名) */
export function isValidUrl(url) {
  if (!url) return false;
  return /^https?:\/\/.+\..+/.test(normalizeUrl(url));
}
