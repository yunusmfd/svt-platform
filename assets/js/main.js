/**
 * Nova SVT — نقطة الإقلاع (Main)
 * ----------------------------------------------------------------------------
 * تجمع كل الوحدات وتشغّل المنصة بالترتيب:
 *   1) حقن شعار العلامة.
 *   2) تهيئة المظهر (الوضع الليلي) واللغة المخزَّنة.
 *   3) ربط التنقّل والقائمة الجانبية.
 *   4) تحميل المحتوى من JSON (مع حالتَي تحميل وخطأ).
 *   5) تشغيل الموجّه الذي يوزّع العرض على الصفحات حسب الرابط.
 *
 * الموجّه لا يعرف الصفحات؛ تُمرَّر إليه دالة render هنا، فيبقى التوزيع
 * مركزياً في هذا الملف (طبقة التنسيق).
 */

import { STORAGE_KEYS, DEFAULT_LANG, ROUTES, APP_NAME } from "./core/config.js";
import { get, set } from "./core/storage.js";
import { t, ui, setLanguage } from "./core/i18n.js";
import { LOGO, svg } from "./core/icons.js";
import { initTheme } from "./core/theme.js";
import { loadContent, findLesson, findLevel, findPost, findExperiment } from "./core/content.js";
import { initRouter } from "./core/router.js";
import { getLang, getView, getLessonId, getLevelId, getBlogId, getExpId } from "./core/state.js";
import { app } from "./core/dom.js";
import { initNav, updateNavActive } from "./components/nav.js";
import { initDrawer, closeDrawer } from "./components/drawer.js";
import { renderHome } from "./views/home.js";
import { renderLessons } from "./views/lessons.js";
import { renderDetail } from "./views/detail.js";
import { renderLab, renderLabExperiment } from "./views/lab.js";
import { renderBlog, renderBlogPost } from "./views/blog.js";
import { renderAbout } from "./views/about.js";

/** الصفحة التي يُبرز عندها رابط في التنقّل (صفحات التفاصيل تتبع صفحاتها الأصل). */
const NAV_KEY = {
  [ROUTES.detail]: ROUTES.lessons,
  [ROUTES.blogPost]: ROUTES.blog,
  [ROUTES.labExperiment]: ROUTES.lab,
};

/** يوزّع العرض على الصفحة المناسبة ثم يحدّث التنقّل ويغلق القائمة. */
function render() {
  const view = getView();
  switch (view) {
    case ROUTES.home:
      renderHome();
      break;
    case ROUTES.lessons:
      renderLessons();
      break;
    case ROUTES.detail:
      renderDetail();
      break;
    case ROUTES.lab:
      renderLab();
      break;
    case ROUTES.labExperiment:
      renderLabExperiment();
      break;
    case ROUTES.blog:
      renderBlog();
      break;
    case ROUTES.blogPost:
      renderBlogPost();
      break;
    case ROUTES.about:
      renderAbout();
      break;
    default:
      renderHome();
  }
  updateNavActive(NAV_KEY[view] || view);
  closeDrawer();
  updateTitle(view);
  app().focus(); // نقل التركيز إلى المحتوى عند تبديل الصفحة (إتاحة الوصول)
}

/** يضبط عنوان الصفحة حسب الوجهة (يفيد شريط التبويب والمشاركة وSEO). */
function updateTitle(view) {
  let prefix = "";
  if (view === ROUTES.detail) {
    const lesson = findLesson(getLessonId());
    if (lesson) prefix = t(lesson.title);
  } else if (view === ROUTES.lessons) {
    const level = findLevel(getLevelId());
    prefix = level ? t(level.name) : ui("nav_lessons");
  } else if (view === ROUTES.lab) {
    prefix = ui("nav_lab");
  } else if (view === ROUTES.labExperiment) {
    const exp = findExperiment(getExpId());
    prefix = exp ? t(exp.title) : ui("nav_lab");
  } else if (view === ROUTES.blog) {
    prefix = ui("nav_blog");
  } else if (view === ROUTES.blogPost) {
    const post = findPost(getBlogId());
    prefix = post ? t(post.title) : ui("nav_blog");
  } else if (view === ROUTES.about) {
    prefix = ui("nav_about");
  }
  document.title = prefix ? `${prefix} — ${APP_NAME}` : ui("doc_title");
}

/** رسالة مركزية بسيطة داخل حاوية العرض (تحميل/خطأ). */
function centerMessage(html) {
  app().innerHTML = `<div class="wrap" style="padding-block:88px;text-align:center;color:var(--text-2)">${html}</div>`;
}

async function boot() {
  // 1) الشعار وأيقونات أزرار الواجهة
  const logo = document.getElementById("brandLogo");
  if (logo) logo.innerHTML = LOGO;
  const menuBtn = document.getElementById("menuBtn");
  if (menuBtn) menuBtn.innerHTML = svg("menu");
  const drawerClose = document.getElementById("drawerClose");
  if (drawerClose) drawerClose.innerHTML = svg("close");

  // 2) المظهر واللغة
  initTheme();
  setLanguage(get(STORAGE_KEYS.lang, DEFAULT_LANG));

  // 3) التنقّل والقائمة — عند تغيير اللغة: نحفظها ونعيد العرض
  initNav(() => {
    set(STORAGE_KEYS.lang, getLang());
    render();
  });
  initDrawer();

  // 4) تحميل المحتوى
  centerMessage(t({ ar: "…جارٍ التحميل", fr: "Chargement…" }));
  try {
    await loadContent();
  } catch (err) {
    console.error("فشل تحميل المحتوى:", err);
    centerMessage(
      t({
        ar: "تعذّر تحميل المحتوى. إن كنت تفتح الملف محلياً، شغّل خادماً محلياً ثم أعد التحميل.",
        fr: "Échec du chargement. En local, lancez un serveur web puis rechargez la page.",
      })
    );
    return;
  }

  // 5) تشغيل الموجّه (يعالج الرابط الحالي مباشرةً ويستدعي render)
  initRouter(render);

  // 6) المنصة تعمل بالإنترنت فقط الآن — أزِل أي عامل خدمة/تخزين مؤقّت
  // عالق من زيارات سابقة كانت تُفعّل العمل دون إنترنت، كي لا يبقى الزائر
  // عالقاً على نسخة قديمة مخزَّنة لديه.
  unregisterServiceWorker();
}

/** يُلغي أي عامل خدمة مسجَّل مسبقاً ويمسح كل تخزينه المؤقّت. */
function unregisterServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
  if (window.caches) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

boot();
