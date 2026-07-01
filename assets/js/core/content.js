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

import { LEVELS_URL, lessonsUrl, BLOG_URL, EXPERIMENTS_URL } from "./config.js";

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
 * يحمّل كل المحتوى: المستويات أولاً، ثم دروس كل مستوى بالتوازي، مع منشورات
 * المدونة وتجارب المختبر (اختيارية، لا توقف الإقلاع عند فشلها).
 * فشل تحميل المستويات نفسها يُرمى ليعالجه المتصل.
 */
export async function loadContent() {
  _levels = await fetchJSON(LEVELS_URL);

  const [lists, posts, experiments] = await Promise.all([
    Promise.all(
      _levels.map((lvl) =>
        fetchJSON(lessonsUrl(lvl.id)).catch((err) => {
          console.warn(`تعذّر تحميل دروس المستوى "${lvl.id}":`, err.message);
          return [];
        })
      )
    ),
    fetchOptionalJSON(BLOG_URL, "المدونة"),
    fetchOptionalJSON(EXPERIMENTS_URL, "تجارب المختبر"),
  ]);

  _lessons = lists.flat();
  _byId = new Map(_lessons.map((lesson) => [lesson.id, lesson]));
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

/** كل الدروس (من جميع المستويات). */
export const getAllLessons = () => _lessons;

/** مستوى واحد بمعرّفه، أو null. */
export const findLevel = (id) => _levels.find((lvl) => lvl.id === id) || null;

/** دروس مستوى معيّن. */
export const lessonsForLevel = (levelId) =>
  _lessons.filter((lesson) => lesson.level === levelId);

/** درس واحد بمعرّفه، أو null. */
export const findLesson = (id) => _byId.get(id) || null;

/** كل منشورات المدونة، الأحدث أولاً (فهرس وصفي فقط — محتوى كل مقال في ملفّه الخاص). */
export const getPosts = () =>
  [..._posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

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
