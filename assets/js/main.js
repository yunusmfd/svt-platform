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
import { loadContent, findLesson, findLevel } from "./core/content.js";
import { initRouter } from "./core/router.js";
import { getLang, getView, getLessonId, getLevelId } from "./core/state.js";
import { app } from "./core/dom.js";
import { initNav, updateNavActive } from "./components/nav.js";
import { initDrawer, closeDrawer } from "./components/drawer.js";
import { renderHome } from "./views/home.js";
import { renderLessons } from "./views/lessons.js";
import { renderDetail } from "./views/detail.js";
import { renderLab } from "./views/lab.js";
import { renderBlog } from "./views/blog.js";
import { renderAbout } from "./views/about.js";

/** الصفحة التي يُبرز عندها رابط "الدروس" في التنقّل (صفحة الدرس تتبع الدروس). */
const NAV_KEY = { [ROUTES.detail]: ROUTES.lessons };

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
    case ROUTES.blog:
      renderBlog();
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
  } else if (view === ROUTES.blog) {
    prefix = ui("nav_blog");
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

  // 6) تسجيل عامل الخدمة للعمل دون إنترنت (HTTPS أو localhost فقط)
  registerServiceWorker();
}

/**
 * يسجّل عامل الخدمة على المواقع المنشورة فقط (HTTPS).
 * أثناء التطوير المحلّي (localhost) يُعطَّل التخزين المؤقّت ويُلغى أي عامل خدمة
 * عالق، حتى ترى تعديلاتك فوراً دون أي التباس.
 */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  const host = location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "" ||
    host === "[::1]" ||
    host.endsWith(".local") ||
    host.startsWith("192.168.") ||
    host.startsWith("10.");

  if (isLocal) {
    // تطوير محلّي: لا تخزين مؤقّت — ألغِ أي عامل خدمة عالق وامسح مخزونه
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
    return;
  }

  // موقع منشور: فعّل العمل دون إنترنت
  const reg = () => navigator.serviceWorker.register("sw.js").catch(() => {});
  if (document.readyState === "complete") reg();
  else window.addEventListener("load", reg, { once: true });
}

boot();
