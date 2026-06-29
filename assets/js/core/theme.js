/**
 * Nova SVT — المظهر (الوضع الليلي)
 * ----------------------------------------------------------------------------
 * يدير ثلاث حالات: "light" فاتح، "dark" ليلي، "system" حسب تفضيل النظام.
 * يخزّن اختيار المستخدم، ويطبّق المظهر الفعلي على <html> عبر السمة
 * data-theme التي تعتمد عليها ملفات CSS. وحدة ذاتية الاكتفاء: تربط زر
 * التبديل وتتابع تغيّر تفضيل النظام بنفسها.
 *
 * ملاحظة: سكربت صغير في <head> يضبط data-theme قبل الرسم لمنع الوميض؛
 * هذه الوحدة تعيد تطبيقه وتضيف التفاعل (الزر، أيقونته، متابعة النظام).
 */

import { get, set } from "./storage.js";
import { STORAGE_KEYS, THEMES, DEFAULT_THEME } from "./config.js";
import { svg } from "./icons.js";

const MEDIA = "(prefers-color-scheme: dark)";

/** اختيار المستخدم المخزَّن: "light" | "dark" | "system". */
export function getStoredTheme() {
  const value = get(STORAGE_KEYS.theme, DEFAULT_THEME);
  return THEMES.includes(value) ? value : DEFAULT_THEME;
}

/** هل النظام يفضّل الوضع الليلي حالياً؟ */
function systemPrefersDark() {
  try {
    return window.matchMedia(MEDIA).matches;
  } catch {
    return false;
  }
}

/** يحوّل الاختيار إلى مظهر فعلي قابل للتطبيق: "light" | "dark". */
function resolveTheme(theme) {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light";
  return theme === "dark" ? "dark" : "light";
}

/** يحدّث أيقونة زر المظهر وحالته (شمس في الليلي للعودة للفاتح، وقمر في الفاتح). */
function updateToggleButton(resolved) {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  const isDark = resolved === "dark";
  btn.innerHTML = svg(isDark ? "sun" : "moon");
  btn.setAttribute("aria-pressed", String(isDark));
}

/** يطبّق المظهر الفعلي على <html> ويحدّث الزر. */
function applyResolved(resolved) {
  document.documentElement.setAttribute("data-theme", resolved);
  updateToggleButton(resolved);
}

/** يضبط مظهراً محدّداً: يخزّنه ثم يطبّقه. */
export function setTheme(theme) {
  if (!THEMES.includes(theme)) theme = DEFAULT_THEME;
  set(STORAGE_KEYS.theme, theme);
  applyResolved(resolveTheme(theme));
}

/** يبدّل صراحةً بين الفاتح والليلي حسب المظهر الفعلي الحالي. */
export function toggleTheme() {
  const current = resolveTheme(getStoredTheme());
  setTheme(current === "dark" ? "light" : "dark");
}

/**
 * التهيئة عند الإقلاع: يطبّق المظهر المخزَّن، يربط زر التبديل، ويتابع تغيّر
 * تفضيل النظام (يؤثّر فقط إذا كان الاختيار "system").
 */
export function initTheme() {
  applyResolved(resolveTheme(getStoredTheme()));

  const btn = document.getElementById("themeBtn");
  if (btn) btn.addEventListener("click", toggleTheme);

  try {
    window.matchMedia(MEDIA).addEventListener("change", () => {
      if (getStoredTheme() === "system") {
        applyResolved(resolveTheme("system"));
      }
    });
  } catch {
    /* متصفّحات قديمة لا تدعم addEventListener على matchMedia */
  }
}
