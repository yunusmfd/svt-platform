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

/** يبني مسار ملف دروس مستوى معيّن. */
export const lessonsUrl = (levelId) => `${LESSONS_DIR}${levelId}.json`;

/* ── المسارات (Routes) ──────────────────────────────────────────────────── */
/** أسماء الصفحات المعتمدة في الموجّه (Router). */
export const ROUTES = {
  home: "home",
  lessons: "lessons",
  detail: "detail",
  lab: "lab",
  about: "about",
};

/** الصفحة الافتراضية عند فتح المنصة أو عند مسار غير معروف. */
export const DEFAULT_ROUTE = ROUTES.home;

/** المستوى المختار افتراضياً في صفحة الدروس. */
export const DEFAULT_LEVEL = "1ac";

/** عدد الدروس المميّزة المعروضة في الصفحة الرئيسية. */
export const FEATURED_COUNT = 3;
