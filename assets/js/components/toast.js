/**
 * Nova SVT — التنبيهات المنبثقة (Toast)
 * ----------------------------------------------------------------------------
 * رسالة قصيرة تظهر أسفل الشاشة ثم تختفي تلقائياً. تُستعمل مثلاً عند بدء
 * تحميل ملف. تكتب الرسالة كنصّ (textContent) لا كـ HTML تفادياً للحقن.
 */

import { svg } from "../core/icons.js";

const DURATION = 2200;
let timer = null;

/** يعرض تنبيهاً نصّياً قصيراً. */
export function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;

  el.innerHTML = svg("check") + "<span></span>";
  el.querySelector("span").textContent = message;
  el.classList.add("show");

  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("show"), DURATION);
}
