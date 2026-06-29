/**
 * Nova SVT — حالة التطبيق (State)
 * ----------------------------------------------------------------------------
 * المصدر الوحيد للحقيقة لحالة الواجهة في الذاكرة. مخزن بيانات نقيّ:
 * لا يلمس الـ DOM ولا يستورد وحدات العرض (تفادياً للاعتماديات الدائرية).
 * الوحدات الأخرى تقرأ الحالة وتعدّلها عبر الدوال المصدّرة، ثم تطلب إعادة
 * العرض بنفسها (الموجّه/الغلاف).
 */

import { DEFAULT_LANG, DEFAULT_ROUTE, DEFAULT_LEVEL } from "./config.js";

/** الحالة الداخلية (لا تُصدَّر مباشرة). */
const state = {
  /** اللغة الحالية: "ar" أو "fr". */
  lang: DEFAULT_LANG,

  /** الصفحة الحالية ومعاملاتها. */
  route: {
    view: DEFAULT_ROUTE,      // "home" | "lessons" | "detail" | "lab" | "about"
    levelId: DEFAULT_LEVEL,   // المستوى المختار في صفحة الدروس
    lessonId: null,           // معرّف الدرس المفتوح (في صفحة الدرس)
    search: "",               // نص البحث في صفحة الدروس
  },

  /** حالة محرّك الاختبار. */
  quiz: makeQuizState(),

  /** حالة المختبر الافتراضي. */
  lab: makeLabState(),
};

/* ── اللغة ─────────────────────────────────────────────────────────────── */
export const getLang = () => state.lang;
export const setLang = (lang) => { state.lang = lang; };

/* ── المسار (الصفحة ومعاملاتها) ─────────────────────────────────────────── */
/** نسخة من حالة المسار (للقراءة فقط). */
export const getRoute = () => ({ ...state.route });
export const getView = () => state.route.view;
export const getLevelId = () => state.route.levelId;
export const getLessonId = () => state.route.lessonId;
export const getSearch = () => state.route.search;

/** يدمج تعديلاً جزئياً على حالة المسار. */
export const setRoute = (patch) => { Object.assign(state.route, patch); };
export const setSearch = (value) => { state.route.search = value; };

/* ── الاختبار ──────────────────────────────────────────────────────────── */
function makeQuizState() {
  return { index: 0, score: 0, answered: false, picked: null, finished: false };
}
/** الكائن الحيّ لحالة الاختبار (محرّك الاختبار يعدّله مباشرة). */
export const getQuiz = () => state.quiz;
/** تعديل جزئي على حالة الاختبار. */
export const setQuiz = (patch) => { Object.assign(state.quiz, patch); };
/** تصفير الاختبار (عند فتح درس أو إعادة المحاولة). */
export const resetQuiz = () => { state.quiz = makeQuizState(); };

/* ── المختبر ───────────────────────────────────────────────────────────── */
function makeLabState() {
  return { phase: 1, zoom: 400 };
}
export const getLab = () => state.lab;
export const setLab = (patch) => { Object.assign(state.lab, patch); };
export const resetLab = () => { state.lab = makeLabState(); };
