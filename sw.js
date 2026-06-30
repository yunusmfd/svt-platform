/**
 * Nova SVT — عامل الخدمة (Service Worker)
 * ----------------------------------------------------------------------------
 * يتيح عمل المنصة دون إنترنت بعد أول زيارة، وتثبيتها كتطبيق.
 * الاستراتيجية:
 *   - تثبيت: تخزين هيكل التطبيق وكل ملفات JSON والأصول مسبقاً.
 *   - تنقّل (SPA): تقديم index.html من الذاكرة.
 *   - بقية الطلبات: الذاكرة أولاً ثم الشبكة (مع تخزين الجديد، بما فيه الخطوط).
 *
 * المسارات نسبية كي يعمل على GitHub Pages داخل مجلّد المستودع دون إعداد.
 * عند تحديث الملفات: ارفع رقم النسخة (VERSION) ليُحدَّث المخزون تلقائياً.
 *
 * ملاحظة: عامل الخدمة يحتاج HTTPS أو localhost (لا يعمل عبر file://).
 */

const VERSION = "nova-svt-v2";

/** هيكل التطبيق وكل الأصول التي تُخزَّن عند التثبيت (مسارات نسبية). */
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",

  // الأنماط
  "assets/css/tokens.css",
  "assets/css/base.css",
  "assets/css/components.css",
  "assets/css/views.css",
  "assets/css/responsive.css",

  // النواة
  "assets/js/core/config.js",
  "assets/js/core/storage.js",
  "assets/js/core/state.js",
  "assets/js/core/i18n.js",
  "assets/js/core/icons.js",
  "assets/js/core/theme.js",
  "assets/js/core/content.js",
  "assets/js/core/router.js",
  "assets/js/core/dom.js",

  // المكوّنات
  "assets/js/components/toast.js",
  "assets/js/components/drawer.js",
  "assets/js/components/lessonCard.js",
  "assets/js/components/nav.js",
  "assets/js/components/downloads.js",

  // الصفحات
  "assets/js/views/home.js",
  "assets/js/views/lessons.js",
  "assets/js/views/detail.js",
  "assets/js/views/quiz.js",
  "assets/js/views/lab.js",
  "assets/js/views/about.js",

  // الإقلاع
  "assets/js/main.js",

  // البيانات
  "data/levels.json",
  "data/lessons/1ac.json",
  "data/lessons/2ac.json",
  "data/lessons/3ac.json",
  "data/lessons/tcs.json",
  "data/lessons/1bac.json",
  "data/lessons/2bac.json",

  // الأيقونات
  "assets/icons/favicon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
];

/* ── التثبيت: تخزين الأصول مسبقاً ────────────────────────────────────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── التفعيل: حذف المخزون القديم ─────────────────────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ── الجلب ───────────────────────────────────────────────────────────────── */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // التنقّل (SPA): قدّم هيكل التطبيق من الذاكرة
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(VERSION);
        const shell =
          (await cache.match("index.html", { ignoreSearch: true })) ||
          (await cache.match("./", { ignoreSearch: true }));
        if (shell) return shell;
        try {
          return await fetch(req);
        } catch {
          return Response.error();
        }
      })()
    );
    return;
  }

  // بقية الطلبات: الذاكرة أولاً، ثم الشبكة (مع تخزين الجديد)
  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) {
          cache.put(req, res.clone()).catch(() => {});
        }
        return res;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
