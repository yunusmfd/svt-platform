/**
 * Nova SVT — المحتوى (تحميل البيانات)
 * ----------------------------------------------------------------------------
 * يحمّل المستويات من data/levels.json وفهرس الدروس الخفيف من
 * data/lessons/index.json (بيانات البطاقات فقط). أمّا التفاصيل الكاملة لكل
 * درس (الاختبار والمحتوى) فتُجلب كسولاً عند فتح الدرس عبر lessonLoader.js.
 *
 * فلسفة التصميم: فصل تام بين البيانات والمحتوى. كل درس مجلّد مستقل
 * (meta.json + ar.html + fr.html)، والفهرس يمنح صفحة المستويات ما يلزمها
 * لعرض البطاقات دون تحميل كل الدروس مسبقاً.
 */

import { LEVELS_URL, LESSONS_INDEX_URL, BLOG_URL, EXPERIMENTS_URL } from "./config.js";

/* ── المخزن الداخلي (يُملأ مرّة عند الإقلاع) ─────────────────────────────── */
let _levels = [];
let _lessons = [];
let _byId = new Map();
let _posts = [];
let _experiments = [];
let _ready = false;

/** يجلب ملف JSON ويعيد محتواه، ويرمي خطأً عند فشل الطلب. */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

/** يجلب ملف JSON اختيارياً (غير حرج لإقلاع المنصة)؛ يعيد قائمة فارغة عند الفشل. */
async function fetchOptionalJSON(url, label) {
  try {
    return await fetchJSON(url);
  } catch (err) {
    console.warn(`تعذّر تحميل "${label}":`, err.message);
    return [];
  }
}

/**
 * يحمّل المحتوى الأساسي: المستويات وفهرس الدروس (حرِجان)، مع منشورات المدونة
 * وتجارب المختبر (اختيارية، لا توقف الإقلاع عند فشلها). فشل تحميل المستويات
 * أو الفهرس يُرمى ليعالجه المتصل. تفاصيل كل درس تُجلب كسولاً لاحقاً.
 */
export async function loadContent() {
  const [levels, index, posts, experiments] = await Promise.all([
    fetchJSON(LEVELS_URL),
    fetchJSON(LESSONS_INDEX_URL),
    fetchOptionalJSON(BLOG_URL, "المدونة"),
    fetchOptionalJSON(EXPERIMENTS_URL, "تجارب المختبر"),
  ]);

  _levels = levels;
  _lessons = index;
  _byId = new Map(_lessons.map((entry) => [entry.id, entry]));
  _posts = posts;
  _experiments = experiments;
  _ready = true;

  return { levels: _levels, lessons: _lessons, posts: _posts, experiments: _experiments };
}

/* ── دوال الوصول ────────────────────────────────────────────────────────── */

/** هل اكتمل تحميل المحتوى؟ */
export const isReady = () => _ready;

/** كل المستويات بالترتيب. */
export const getLevels = () => _levels;

/** كل مدخلات فهرس الدروس (بيانات بطاقات — لا تفاصيل كاملة). */
export const getAllLessons = () => _lessons;

/** مستوى واحد بمعرّفه، أو null. */
export const findLevel = (id) => _levels.find((lvl) => lvl.id === id) || null;

/** مدخلات فهرس دروس مستوى معيّن، مرتّبة حسب order. */
export const lessonsForLevel = (levelId) =>
  _lessons
    .filter((entry) => entry.level === levelId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

/** مدخلة فهرس درس واحد بمعرّفه، أو null (للبطاقات والعنوان). */
export const findLesson = (id) => _byId.get(id) || null;

/**
 * كل منشورات المدونة: المثبَّتة أولاً، ثم الأحدث فالأقدم داخل كل مجموعة
 * (فهرس وصفي فقط — محتوى كل مقال في ملفّه الخاص).
 */
export const getPosts = () =>
  [..._posts].sort((a, b) => {
    const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    return pinDiff !== 0 ? pinDiff : a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

/** منشور مدونة واحد بمعرّفه، أو null. */
export const findPost = (id) => _posts.find((p) => p.id === id) || null;

/** كل تجارب المختبر الافتراضي (فهرس وصفي فقط — محتوى كل تجربة في ملفّها الخاص). */
export const getExperiments = () => _experiments;

/** تجربة مختبر واحدة بمعرّفها، أو null. */
export const findExperiment = (id) => _experiments.find((e) => e.id === id) || null;

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
