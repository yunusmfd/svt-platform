/**
 * Nova SVT — الإعدادات والثوابت المركزية
 * ----------------------------------------------------------------------------
 * كل القيم الثابتة في مكان واحد: اللغات، المظاهر، مفاتيح التخزين،
 * مسارات البيانات، وأسماء المسارات (Routes). أي تعديل عام يبدأ من هنا.
 *
 * ملاحظة مهمّة حول المسارات: نستعمل مسارات نسبية (data/...) وليست مطلقة
 * (‎/data/...) كي تعمل المنصة مباشرة على GitHub Pages داخل مجلّد المستودع
 * (‎username.github.io/repo/‎) دون أي إعداد إضافي.
 */

/** اسم المنصة (يُستعمل في العنوان والبيانات الوصفية). */
export const APP_NAME = "Nova SVT";

/* ── اللغة ─────────────────────────────────────────────────────────────── */
export const DEFAULT_LANG = "ar";
export const SUPPORTED_LANGS = ["ar", "fr"];

/** اتجاه الكتابة لكل لغة. */
export const LANG_DIR = {
  ar: "rtl",
  fr: "ltr",
};

/* ── المظهر (الوضع الليلي) ──────────────────────────────────────────────── */
/** القيم الممكنة: "light" فاتح، "dark" ليلي، "system" حسب النظام. */
export const THEMES = ["light", "dark", "system"];
export const DEFAULT_THEME = "system";

/* ── مفاتيح التخزين المحلي (LocalStorage) ───────────────────────────────── */
/** نُسبق كل المفاتيح باسم المنصة لتفادي التعارض مع تطبيقات أخرى. */
const NS = "nova-svt";
export const STORAGE_KEYS = {
  lang: `${NS}:lang`,
  theme: `${NS}:theme`,
  /** تُلحق بمعرّف الدرس: nova-svt:quiz:resp-vivants */
  quizPrefix: `${NS}:quiz:`,
};

/* ── مسارات البيانات (JSON) ─────────────────────────────────────────────── */
/** قائمة المستويات الدراسية. */
export const LEVELS_URL = "data/levels.json";
/** مجلّد ملفات الدروس؛ يُبنى مسار كل مستوى منه: data/lessons/1ac.json */
export const LESSONS_DIR = "data/lessons/";
/** فهرس منشورات المدونة (أخبار، توجيهات، إعلانات) — بيانات وصفية فقط. */
export const BLOG_URL = "data/blog.json";
/** مجلّد ملفات كل منشور (كل مقال ملف HTML منفصل، بنسخة لكل لغة). */
export const BLOG_DIR = "data/blog/";
/** فهرس تجارب المختبر الافتراضي (فيديو / animation / صفحة تفاعلية) — بيانات وصفية فقط. */
export const EXPERIMENTS_URL = "data/experiments.json";
/** مجلّد ملفات كل تجربة (كل تجربة ملف HTML منفصل). */
export const EXPERIMENTS_DIR = "data/experiments/";

/** يبني مسار ملف دروس مستوى معيّن. */
export const lessonsUrl = (levelId) => `${LESSONS_DIR}${levelId}.json`;
/** يبني مسار ملف محتوى منشور مدونة بلغة معيّنة (مع نسخة احتياطية بالعربية). */
export const blogBodyUrl = (postId, lang) => `${BLOG_DIR}${postId}.${lang}.html`;
/** يبني مسار ملف محتوى تجربة مختبر (ملف واحد بلا لغة، محايد أو تفاعلي). */
export const experimentBodyUrl = (expId) => `${EXPERIMENTS_DIR}${expId}.html`;

/* ── المسارات (Routes) ──────────────────────────────────────────────────── */
/** أسماء الصفحات المعتمدة في الموجّه (Router). */
export const ROUTES = {
  home: "home",
  lessons: "lessons",
  detail: "detail",
  lab: "lab",
  labExperiment: "labExperiment",
  blog: "blog",
  blogPost: "blogPost",
  about: "about",
};

/** الصفحة الافتراضية عند فتح المنصة أو عند مسار غير معروف. */
export const DEFAULT_ROUTE = ROUTES.home;

/** عدد الدروس المميّزة المعروضة في الصفحة الرئيسية. */
export const FEATURED_COUNT = 3;
