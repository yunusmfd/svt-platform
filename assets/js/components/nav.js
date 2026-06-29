/**
 * Nova SVT — التنقّل (Nav)
 * ----------------------------------------------------------------------------
 * يبرز الرابط النشط في شريط التنقّل، ويربط مبدّل اللغة وأزرار التنقّل
 * البرمجية ([data-nav]). تبديل اللغة يستدعي setLanguage ثم دالة إعادة العرض
 * التي يمرّرها main.js (لأن إعادة رسم الصفحة الحالية من مسؤوليته).
 */

import { setLanguage } from "../core/i18n.js";
import { navigate } from "../core/router.js";

/** يضيف الصنف active لروابط التنقّل المطابقة للصفحة الحالية. */
export function updateNavActive(view) {
  document.querySelectorAll(".nav-link[data-route]").forEach((link) => {
    const isActive = link.getAttribute("data-route") === view;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

/**
 * يربط عناصر التنقّل العامّة:
 * - أزرار مبدّل اللغة: تبدّل اللغة ثم تعيد العرض عبر onLanguageChange.
 * - أي عنصر يحمل [data-nav]: ينتقل إلى المسار المذكور (للأزرار البرمجية).
 */
export function initNav(onLanguageChange) {
  document.querySelectorAll(".lang-toggle [data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.getAttribute("data-lang"));
      if (typeof onLanguageChange === "function") onLanguageChange();
    });
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-nav]");
    if (!el) return;
    e.preventDefault();
    navigate(el.getAttribute("data-nav"));
  });
}
