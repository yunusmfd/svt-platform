/**
 * Nova SVT — الموجّه (Router)
 * ----------------------------------------------------------------------------
 * موجّه بسيط يعتمد على hash العنوان، فيعمل كموقع ساكن على GitHub Pages
 * وNetlify دون أي إعداد، ويدعم الروابط القابلة للمشاركة وزر الرجوع.
 *
 * الأنماط المدعومة:
 *   #/                      → الرئيسية
 *   #/lessons               → بوّابة الدروس (المستوى الافتراضي)
 *   #/lessons/{levelId}     → بوّابة الدروس عند مستوى محدّد
 *   #/lesson/{lessonId}     → صفحة درس
 *   #/lab                   → المختبر
 *   #/blog                  → المدونة
 *   #/blog/{postId}         → مقال مدونة (ملف HTML منفصل لكل مقال)
 *   #/about                 → عن المنصة
 *
 * تصميمياً: لا يستورد الموجّه صفحات العرض. يستقبل دالة onChange من main.js
 * وينادي بها عند كل تغيّر، فيبقى مستقلاً عن طبقة العرض (لا اعتماد دائري).
 *
 * ملاحظة: روابط التنقّل داخل الصفحة (مثل فهرس الدرس) يجب ألّا تستعمل hash
 * كي لا تتعارض مع المسارات — تُمرَّر بالتمرير عبر JavaScript بدل ذلك.
 */

import { ROUTES, DEFAULT_LEVEL } from "./config.js";
import { setRoute } from "./state.js";

let _onChange = null;

/** يحوّل سلسلة hash إلى كائن مسار. */
export function parseHash(hash) {
  const clean = (hash || "").replace(/^#/, "").replace(/^\/+/, "");
  const parts = clean.split("/").filter(Boolean);

  if (parts.length === 0) return { view: ROUTES.home };

  const [segment, param] = parts;
  switch (segment) {
    case "lessons":
      return { view: ROUTES.lessons, levelId: param || DEFAULT_LEVEL };
    case "lesson":
      return param
        ? { view: ROUTES.detail, lessonId: param }
        : { view: ROUTES.lessons, levelId: DEFAULT_LEVEL };
    case "lab":
      return { view: ROUTES.lab };
    case "blog":
      return param ? { view: ROUTES.blogPost, blogId: param } : { view: ROUTES.blog };
    case "about":
      return { view: ROUTES.about };
    case "home":
      return { view: ROUTES.home };
    default:
      return { view: ROUTES.home };
  }
}

/** يقرأ العنوان الحالي، يحدّث الحالة، ثم ينادي دالة العرض. */
function applyRoute() {
  const route = parseHash(location.hash);

  if (route.view === ROUTES.lessons) {
    setRoute({ view: route.view, levelId: route.levelId, lessonId: null });
  } else if (route.view === ROUTES.detail) {
    setRoute({ view: route.view, lessonId: route.lessonId });
  } else if (route.view === ROUTES.blogPost) {
    setRoute({ view: route.view, blogId: route.blogId });
  } else {
    setRoute({ view: route.view });
  }

  window.scrollTo({ top: 0 });
  if (_onChange) _onChange(route);
}

/** يهيّئ الموجّه ويعالج المسار الحالي مباشرة. */
export function initRouter(onChange) {
  _onChange = onChange;
  window.addEventListener("hashchange", applyRoute);
  applyRoute();
}

/** ينتقل برمجياً إلى مسار (مثال: "/lessons/tcs"). يفرض إعادة العرض إن لم يتغيّر. */
export function navigate(path) {
  const target = "#" + (path.startsWith("/") ? path : "/" + path);
  if (location.hash === target) applyRoute();
  else location.hash = target;
}

/** اختصارات تنقّل دلالية تُستعمل في الأزرار البرمجية. */
export function go(view, param) {
  if (view === ROUTES.lessons) navigate(param ? `/lessons/${param}` : "/lessons");
  else if (view === ROUTES.detail) navigate(`/lesson/${param}`);
  else if (view === ROUTES.blogPost) navigate(`/blog/${param}`);
  else if (view === ROUTES.blog) navigate("/blog");
  else if (view === ROUTES.home) navigate("/");
  else navigate(`/${view}`);
}
