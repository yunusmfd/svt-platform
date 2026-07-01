/**
 * Nova SVT — صفحة الدرس (Detail)
 * ----------------------------------------------------------------------------
 * قالب موحّد لكل الدروس. لا يُكرَّر تصميم الصفحة داخل ملفات الدروس:
 *   1) يقرأ بيانات الدرس (meta.json) والمحتوى (ar.html/fr.html) عبر المحمّل.
 *   2) يبني مسار التنقّل (Breadcrumb) والوسوم والعنوان والمدّة.
 *   3) يحقن محتوى اللغة الحالية ثم يُفعّل خطاطاته العلمية.
 *   4) يعرض الفيديو والملفّات والاختبار والتنقّل بين الدروس (السابق/التالي).
 *
 * التحميل كسول: تُجلب التفاصيل عند فتح الدرس فقط. تبديل اللغة يعيد البناء،
 * لذا نحرس ضدّ النتائج القديمة عبر مقارنة معرّف الدرس بعد كل جلب.
 */

import { t, ui } from "../core/i18n.js";
import { svg, fillIcon, figFor } from "../core/icons.js";
import { findLesson, findLevel, lessonsForLevel } from "../core/content.js";
import { loadLessonMeta, loadLessonBody, hydrateLessonBody } from "../core/lessonLoader.js";
import { getLessonId, getLang } from "../core/state.js";
import { go } from "../core/router.js";
import { app, esc } from "../core/dom.js";
import { showToast } from "../components/toast.js";
import { downloadSummary, downloadFigure } from "../components/downloads.js";
import { mountQuiz } from "./quiz.js";

export async function renderDetail() {
  const id = getLessonId();
  const entry = findLesson(id); // مدخلة الفهرس الخفيفة (عنوان/وحدة/فرع…)
  if (!entry) {
    go("lessons");
    return;
  }
  const level = findLevel(entry.level);

  // حالة تحميل أوّلية (العنوان متاح من الفهرس فوراً)
  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      ${breadcrumbHTML(entry, level)}
      <h1 style="margin:18px 0">${esc(t(entry.title))}</h1>
      <p class="video-note">${svg("clock")}<span>${esc(ui("lesson_loading"))}</span></p>
    </div>
  </section>`;

  const lang = getLang();
  const [meta, body] = await Promise.all([loadLessonMeta(id), loadLessonBody(id, lang)]);

  // إن غيّر المستخدم الدرس أو اللغة أثناء الجلب، تجاهل هذه النتيجة القديمة.
  if (getLessonId() !== id) return;

  if (!meta) {
    app().innerHTML = `
    <section class="section"><div class="wrap">
      ${breadcrumbHTML(entry, level)}
      <div class="empty">${svg("doc")}<p>${esc(ui("lesson_missing"))}</p></div>
    </div></section>`;
    return;
  }

  renderFull(entry, level, meta, body);
}

/* ── البناء الكامل بعد توفّر البيانات والمحتوى ───────────────────────────── */
function renderFull(entry, level, meta, body) {
  const quiz = meta.quiz || [];
  const attachments = meta.attachments || [];
  const filesCount = attachments.length || 1;

  // الفهرس الجانبي: فقط الأقسام الموجودة فعلاً
  const toc = [["b-content", "toc_content"]];
  if (meta.video) toc.push(["b-video", "toc_video"]);
  toc.push(["b-dl", "toc_dl"]);
  if (quiz.length) toc.push(["b-quiz", "toc_quiz"]);

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      ${breadcrumbHTML(entry, level)}
      <div class="detail">
        <aside class="toc">
          <h5>${ui("toc_title")}</h5>
          ${toc
            .map(([bid, key]) => `<a data-scroll="${bid}" tabindex="0"><span class="d"></span>${ui(key)}</a>`)
            .join("")}
        </aside>

        <div class="detail-main">
          <div class="detail-tags">
            <span class="dtag lvl">${esc(level ? t(level.name) : "")}</span>
            <span class="dtag subj">${meta.branch === "geo" ? ui("branch_geo") : ui("branch_bio")}</span>
            <span class="dtag unit">${esc(t(meta.unit))}</span>
          </div>
          <h1>${esc(t(meta.title))}</h1>
          <div class="detail-meta">
            <span>${svg("clock")}${meta.duration} ${ui("min")} — ${ui("meta_duration")}</span>
            <span>${svg("quiz")}${quiz.length} ${ui("meta_quiz")}</span>
            <span>${svg("doc")}${filesCount} ${ui("meta_files")}</span>
          </div>

          <div class="block" id="b-content">
            <div class="block-title"><span class="bar"></span>${ui("block_content")}</div>
            <div class="prose" id="lessonBody">${body || ""}</div>
          </div>

          ${
            meta.video
              ? `
          <div class="block" id="b-video">
            <div class="block-title"><span class="bar"></span>${ui("block_video")}</div>
            <div class="video">
              <div class="vbg">${figFor(meta.thumbnail)}<div class="hero-dots"></div></div>
              <div class="vplay"><button id="videoPlay" aria-label="play">${fillIcon("play")}</button></div>
              <div class="vmeta"><span>${esc(t(meta.video.title))}</span><span>${esc(meta.video.length || "")}</span></div>
            </div>
            <p class="video-note">${svg("video")}<span>${ui("video_note")}</span></p>
          </div>`
              : ""
          }

          <div class="block" id="b-dl">
            <div class="block-title"><span class="bar"></span>${ui("block_dl")}</div>
            <div class="dl-list">
              <button class="dl" id="dlSummary">
                <span class="dl-ico">${svg("doc")}</span>
                <span class="dl-info"><span class="n">${ui("dl_summary")}</span><span class="s">${ui("dl_summary_s")}</span></span>
                <span class="dl-act">${svg("download")}</span>
              </button>
              ${
                attachments.length
                  ? attachments.map(attachmentHTML).join("")
                  : `<button class="dl" id="dlExercises">
                <span class="dl-ico">${svg("assign")}</span>
                <span class="dl-info"><span class="n">${ui("dl_exercises")}</span><span class="s">${ui("dl_exercises_s")}</span></span>
                <span class="dl-act">${svg("chevR")}</span>
              </button>`
              }
            </div>
          </div>

          ${
            quiz.length
              ? `
          <div class="block" id="b-quiz">
            <div class="block-title"><span class="bar"></span>${ui("block_quiz")}</div>
            <div class="quiz"><div class="quiz-inner" id="quizInner"></div><div class="hero-dots"></div></div>
          </div>`
              : ""
          }

          ${lessonNavHTML(entry)}
        </div>
      </div>
    </div>
  </section>`;

  // تفعيل الخطاطات داخل المحتوى المحقون
  hydrateLessonBody(document.getElementById("lessonBody"), meta.id);
  wireDetail(meta, body);
  if (quiz.length) mountQuiz(meta);
}

/** رابط تحميل مرفق حقيقي (label + href). */
function attachmentHTML(att) {
  const label = typeof att.label === "object" ? t(att.label) : att.label || "";
  const note = att.note ? (typeof att.note === "object" ? t(att.note) : att.note) : "";
  return `
  <a class="dl" href="${esc(att.href || "#")}" download>
    <span class="dl-ico">${svg("download")}</span>
    <span class="dl-info"><span class="n">${esc(label)}</span><span class="s">${esc(note)}</span></span>
    <span class="dl-act">${svg("download")}</span>
  </a>`;
}

/** مسار التنقّل: الرئيسية ▸ الدروس ▸ المستوى ▸ الوحدة. */
function breadcrumbHTML(entry, level) {
  const levelName = level ? t(level.name) : "";
  return `
  <nav class="breadcrumb" aria-label="breadcrumb">
    <a href="#/">${ui("nav_home")}</a>${svg("chevR")}
    <a href="#/lessons">${ui("nav_lessons")}</a>${svg("chevR")}
    <a href="#/lessons/${esc(entry.level)}">${esc(levelName)}</a>${svg("chevR")}
    <span aria-current="page">${esc(t(entry.unit))}</span>
  </nav>`;
}

/** تنقّل بين درسَي المستوى نفسه (السابق/التالي) حسب الترتيب. */
function lessonNavHTML(entry) {
  const siblings = lessonsForLevel(entry.level);
  const idx = siblings.findIndex((e) => e.id === entry.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  if (!prev && !next) return "";
  return `
  <nav class="lesson-nav">
    ${
      prev
        ? `<a class="ln-item ln-prev" href="#/lesson/${esc(prev.id)}">${svg("arrow")}
             <span><span class="ln-lbl">${ui("crumb_prev")}</span><span class="ln-title">${esc(t(prev.title))}</span></span></a>`
        : `<span></span>`
    }
    ${
      next
        ? `<a class="ln-item ln-next" href="#/lesson/${esc(next.id)}">
             <span><span class="ln-lbl">${ui("crumb_next")}</span><span class="ln-title">${esc(t(next.title))}</span></span>${svg("arrow")}</a>`
        : `<span></span>`
    }
  </nav>`;
}

/** يربط الفهرس وأزرار الفيديو والتحميل. */
function wireDetail(meta, body) {
  const root = app();

  // الفهرس: تمرير سلس داخل الصفحة (نقر + مفتاح Enter)
  root.querySelectorAll("[data-scroll]").forEach((link) => {
    const scrollTo = () => {
      const target = document.getElementById(link.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    link.addEventListener("click", scrollTo);
    link.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollTo();
      }
    });
  });

  // الفيديو نموذجي: تنبيه توضيحي
  root.querySelector("#videoPlay")?.addEventListener("click", () => showToast(ui("video_note")));

  // ملخّص الدرس النصّي (يشمل نصّ المحتوى بعد إزالة الوسوم + الأسئلة)
  root.querySelector("#dlSummary")?.addEventListener("click", () => downloadSummary(meta, body));

  // زرّ التمارين النموذجي
  root.querySelector("#dlExercises")?.addEventListener("click", () => showToast(ui("toast_soon")));
}
