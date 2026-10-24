// api/_validate.js
// 各APIで共通の入力チェック（ファイル名が「_」始まりなのでVercelのAPIルートにはならない）。
// 大きすぎる入力や想定外の画像形式を、Geminiに送る前に400で断る（費用・悪用対策）。

const MAX_IMAGE_CHARS = 8 * 1024 * 1024; // base64で約8MB ≒ 元画像で約6MB
const MAX_TEXT_CHARS = 2000;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic"];

// imageFields: 画像（base64 または data URL）が入るキー。mimeField: mimeTypeを別で受け取るキー。
// 問題があればエラーメッセージ、なければ null を返す。
export function validateBody(body, { imageFields = [], mimeField = null } = {}) {
  const b = body || {};
  for (const [key, value] of Object.entries(b)) {
    if (value == null) continue;
    if (imageFields.includes(key)) {
      if (typeof value !== "string") return `${key} は文字列である必要があります`;
      if (value.length > MAX_IMAGE_CHARS) return "画像が大きすぎます（約6MBまで）";
      const m = /^data:([^;,]+);base64,/.exec(value);
      if (m && !ALLOWED_MIME.includes(m[1].toLowerCase())) return "対応していない画像形式です（JPEG/PNG/WebP/HEICのみ）";
      continue;
    }
    if (typeof value === "string" && value.length > MAX_TEXT_CHARS) return `${key} が長すぎます（${MAX_TEXT_CHARS}文字まで）`;
  }
  if (mimeField && b[mimeField] != null && !ALLOWED_MIME.includes(String(b[mimeField]).toLowerCase())) {
    return "対応していない画像形式です（JPEG/PNG/WebP/HEICのみ）";
  }
  return null;
}
