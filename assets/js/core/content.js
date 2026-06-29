/**
 * Nova SVT — المحتوى (تحميل البيانات)
 * ----------------------------------------------------------------------------
 * يحمّل المستويات من data/levels.json ثم دروس كل مستوى من
 * data/lessons/{levelId}.json بالتوازي، ويوفّر دوال وصول للبيانات.
 *
 * فلسفة التصميم: المحتوى منفصل عن الكود تماماً. لإضافة درس يكفي تعديل ملف
 * JSON الخاص بالمستوى؛ ولإضافة مستوى جديد: سطر في levels.json + ملف دروسه.
 * لا حاجة لأي تعديل برمجي.
 */

import { LEVELS_URL, lessonsUrl } from "./config.js";

/* ── المخزن الداخلي (يُملأ مرّة عند الإقلاع) ─────────────────────────────── */
let _levels = [];
let _lessons = [];
let _byId = new Map();
let _ready = false;

/** يجلب ملف JSON ويعيد محتواه، ويرمي خطأً عند فشل الطلب. */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

/**
 * يحمّل كل المحتوى: المستويات أولاً، ثم دروس كل مستوى بالتوازي.
 * إن تعذّر تحميل دروس مستوى معيّن، يُتجاهل ذلك المستوى (قائمة فارغة) دون
 * إيقاف بقية المنصة. أمّا فشل تحميل المستويات نفسها فيُرمى ليعالجه المتصل.
 */
export async function loadContent() {
  _levels = await fetchJSON(LEVELS_URL);

  const lists = await Promise.all(
    _levels.map((lvl) =>
      fetchJSON(lessonsUrl(lvl.id)).catch((err) => {
        console.warn(`تعذّر تحميل دروس المستوى "${lvl.id}":`, err.message);
        return [];
      })
    )
  );

  _lessons = lists.flat();
  _byId = new Map(_lessons.map((lesson) => [lesson.id, lesson]));
  _ready = true;

  return { levels: _levels, lessons: _lessons };
}

/* ── دوال الوصول ────────────────────────────────────────────────────────── */

/** هل اكتمل تحميل المحتوى؟ */
export const isReady = () => _ready;

/** كل المستويات بالترتيب. */
export const getLevels = () => _levels;

/** كل الدروس (من جميع المستويات). */
export const getAllLessons = () => _lessons;

/** مستوى واحد بمعرّفه، أو null. */
export const findLevel = (id) => _levels.find((lvl) => lvl.id === id) || null;

/** دروس مستوى معيّن. */
export const lessonsForLevel = (levelId) =>
  _lessons.filter((lesson) => lesson.level === levelId);

/** درس واحد بمعرّفه، أو null. */
export const findLesson = (id) => _byId.get(id) || null;

/**
 * يجمّع المستويات حسب السلك (college / lycee) مع الحفاظ على ترتيبها،
 * لاستعماله في شريط المستويات بصفحة الدروس.
 * @returns {Object<string, Array>} مثال: { college: [...], lycee: [...] }
 */
export function levelsByStage() {
  const groups = {};
  for (const lvl of _levels) {
    (groups[lvl.stage] ||= []).push(lvl);
  }
  return groups;
}
