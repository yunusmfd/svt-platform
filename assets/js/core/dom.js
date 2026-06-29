/**
 * Nova SVT — أدوات DOM مشتركة
 * ----------------------------------------------------------------------------
 * مساعدات صغيرة تستعملها كل صفحات العرض: الوصول إلى حاوية التطبيق، وتهريب
 * النصوص قبل حقنها في HTML (دفاعياً، رغم أن المحتوى من الأستاذ وموثوق).
 */

/** حاوية عرض الصفحات. */
export const app = () => document.getElementById("app");

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** يهرّب الرموز الخاصة في نصّ عادي ليُحقن بأمان داخل HTML أو سمة. */
export const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

/**
 * يعلن رسالة لقارئات الشاشة عبر منطقة #srLive الحيّة المخفية.
 * يُفرَّغ النص أولاً ثم يُضبط في الإطار التالي لضمان إعلان النص نفسه مكرّراً.
 */
export function announce(message) {
  const region = document.getElementById("srLive");
  if (!region) return;
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
