/**
 * Nova SVT — المحمّل الموحّد للدروس (Lesson Loader)
 * ----------------------------------------------------------------------------
 * يفصل بيانات الدرس عن محتواه وفق المعمارية:
 *   data/lessons/{id}/meta.json  → البيانات المنظّمة + الاختبار (يُجلب عند فتح الدرس).
 *   data/lessons/{id}/ar.html    → محتوى الدرس بالعربية (Fragment HTML).
 *   data/lessons/{id}/fr.html    → محتوى الدرس بالفرنسية (نسخة احتياطية: العربية).
 *
 * يوفّر:
 *   loadLessonMeta(id)            → يجلب meta.json (مع تخزين مؤقّت في الذاكرة).
 *   loadLessonBody(id, lang)      → يجلب المحتوى باللغة المطلوبة (fallback: ar).
 *   hydrateLessonBody(root, id)   → يحوّل عناصر <figure data-fig> إلى خطاطات
 *                                   علمية مشتركة قابلة للتحميل، بعد حقن المحتوى.
 *
 * كل النتائج تُخزَّن مؤقّتاً فلا يُعاد الجلب عند تبديل اللغة أو الرجوع للدرس.
 */

import { lessonMetaUrl, lessonBodyUrl } from "./config.js";
import { figFor, svg } from "./icons.js";
import { ui } from "./i18n.js";
import { esc } from "./dom.js";
import { downloadFigure } from "../components/downloads.js";

/* ── تخزين مؤقّت ─────────────────────────────────────────────────────────── */
const _metaCache = new Map(); // id            → meta object
const _bodyCache = new Map(); // `${id}:${lang}` → html string

/** يجلب بيانات درس (meta.json) مع تخزينها مؤقّتاً؛ يعيد null عند الفشل. */
export async function loadLessonMeta(id) {
  if (_metaCache.has(id)) return _metaCache.get(id);
  try {
    const res = await fetch(lessonMetaUrl(id));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const meta = await res.json();
    _metaCache.set(id, meta);
    return meta;
  } catch (err) {
    console.warn(`تعذّر تحميل بيانات الدرس "${id}":`, err.message);
    return null;
  }
}

/**
 * يجلب محتوى الدرس باللغة المطلوبة (Fragment HTML). بالفرنسية يجرّب fr ثم
 * يعود إلى ar عند غيابها؛ بالعربية يجرّب ar فقط. يعيد "" عند تعذّر الجميع.
 */
export async function loadLessonBody(id, lang) {
  const tryLangs = lang === "ar" ? ["ar"] : [lang, "ar"];
  for (const l of tryLangs) {
    const key = `${id}:${l}`;
    if (_bodyCache.has(key)) return _bodyCache.get(key);
    try {
      const res = await fetch(lessonBodyUrl(id, l));
      if (res.ok) {
        const html = await res.text();
        _bodyCache.set(key, html);
        return html;
      }
    } catch {
      /* نجرّب اللغة التالية */
    }
  }
  return "";
}

/**
 * يُفعّل المحتوى بعد حقنه: يحوّل كل <figure class="lesson-fig" data-fig="key">
 * إلى خطاطة علمية مشتركة (SVG) مع تسمية وزرّ تحميل، ويربط أزرار التحميل.
 * المحتوى نفسه يبقى خالياً من أي SVG أو سكربت (فصل تام بين المحتوى والعرض).
 */
export function hydrateLessonBody(root, lessonId) {
  if (!root) return;
  root.querySelectorAll("figure.lesson-fig[data-fig]").forEach((fig, i) => {
    const key = fig.getAttribute("data-fig") || "cell";
    const title = fig.querySelector(".fig-t")?.textContent || "";
    const cap = fig.querySelector(".fig-c")?.textContent || "";
    const name = `NovaSVT_${lessonId}_fig${i + 1}`;
    fig.classList.add("fig");
    fig.innerHTML = `
      <div class="fig-canvas">${figFor(key)}</div>
      <div class="fig-cap">
        <span class="t">${esc(title)}</span>
        <button class="fig-dl" data-fig="${esc(key)}" data-name="${esc(name)}">${svg("download")}${ui("fig_dl")}</button>
      </div>
      ${cap ? `<p class="fig-note">${esc(cap)}</p>` : ""}`;
  });

  root.querySelectorAll(".fig-dl[data-fig]").forEach((btn) => {
    btn.addEventListener("click", () => downloadFigure(btn.dataset.fig, btn.dataset.name));
  });
}
