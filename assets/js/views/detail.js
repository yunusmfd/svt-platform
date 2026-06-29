/**
 * Nova SVT — صفحة الدرس (Detail)
 * ----------------------------------------------------------------------------
 * تعرض درساً كاملاً: فهرس جانبي، مقدّمة، فيديو، خطاطات، ملفات للتحميل، ثم
 * اختبار. روابط الفهرس تُمرّر داخل الصفحة عبر JavaScript (لا hash) كي لا
 * تتعارض مع الموجّه. كل الأزرار مربوطة برمجياً بلا onclick.
 */

import { t, ui } from "../core/i18n.js";
import { svg, fillIcon, figFor } from "../core/icons.js";
import { findLesson, findLevel } from "../core/content.js";
import { getLessonId } from "../core/state.js";
import { go } from "../core/router.js";
import { app, esc } from "../core/dom.js";
import { showToast } from "../components/toast.js";
import { downloadSummary, downloadFigure } from "../components/downloads.js";
import { mountQuiz } from "./quiz.js";

/** عناصر الفهرس: [معرّف الكتلة, مفتاح العنوان]. */
const TOC = [
  ["b-intro", "toc_intro"],
  ["b-video", "toc_video"],
  ["b-figs", "toc_figs"],
  ["b-dl", "toc_dl"],
  ["b-quiz", "toc_quiz"],
];

export function renderDetail() {
  const lesson = findLesson(getLessonId());
  if (!lesson) {
    go("lessons");
    return;
  }
  const level = findLevel(lesson.level);
  const figs = lesson.figs || [];
  const filesCount = figs.length ? 2 : 1;

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <a class="back-link" href="#/lessons/${lesson.level}">${svg("arrow")}${ui("back_lessons")}</a>
      <div class="detail">
        <aside class="toc">
          <h5>${ui("toc_title")}</h5>
          ${TOC.map(
            ([id, key]) =>
              `<a data-scroll="${id}" tabindex="0"><span class="d"></span>${ui(key)}</a>`
          ).join("")}
        </aside>

        <div class="detail-main">
          <div class="detail-tags">
            <span class="dtag lvl">${esc(level ? t(level.name) : "")}</span>
            <span class="dtag subj">${lesson.branch === "geo" ? ui("branch_geo") : ui("branch_bio")}</span>
            <span class="dtag unit">${esc(t(lesson.unit))}</span>
          </div>
          <h1>${esc(t(lesson.title))}</h1>
          <div class="detail-meta">
            <span>${svg("clock")}${lesson.duration} ${ui("min")} — ${ui("meta_duration")}</span>
            <span>${svg("quiz")}${(lesson.quiz || []).length} ${ui("meta_quiz")}</span>
            <span>${svg("doc")}${filesCount} ${ui("meta_files")}</span>
          </div>

          <div class="block" id="b-intro">
            <div class="block-title"><span class="bar"></span>${ui("block_intro")}</div>
            <div class="prose">${(lesson.intro || []).map((p) => `<p>${t(p)}</p>`).join("")}</div>
          </div>

          <div class="block" id="b-video">
            <div class="block-title"><span class="bar"></span>${ui("block_video")}</div>
            <div class="video">
              <div class="vbg">${figFor(lesson.fig)}<div class="hero-dots"></div></div>
              <div class="vplay"><button id="videoPlay" aria-label="play">${fillIcon("play")}</button></div>
              ${
                lesson.video
                  ? `<div class="vmeta"><span>${esc(t(lesson.video.title))}</span><span>${esc(
                      lesson.video.length || ""
                    )}</span></div>`
                  : ""
              }
            </div>
            <p style="color:var(--text-3);font-size:.9rem;margin-top:10px">${svg("video")} ${ui("video_note")}</p>
          </div>

          <div class="block" id="b-figs">
            <div class="block-title"><span class="bar"></span>${ui("block_figs")}</div>
            <div class="fig-grid">
              ${figs
                .map(
                  (f, i) => `
                <div class="fig">
                  <div class="fig-canvas">${figFor(f.key)}</div>
                  <div class="fig-cap">
                    <span class="t">${esc(t(f.label))}</span>
                    <button class="fig-dl" data-fig="${esc(f.key)}" data-name="NovaSVT_${lesson.id}_fig${
                    i + 1
                  }">${svg("download")}${ui("fig_dl")}</button>
                  </div>
                  <p style="color:var(--text-3);font-size:.85rem;margin-top:8px">${esc(t(f.cap))}</p>
                </div>`
                )
                .join("")}
            </div>
          </div>

          <div class="block" id="b-dl">
            <div class="block-title"><span class="bar"></span>${ui("block_dl")}</div>
            <div class="dl-list">
              <button class="dl" id="dlSummary">
                <span class="dl-ico">${svg("doc")}</span>
                <span class="dl-info"><span class="n">${ui("dl_summary")}</span><span class="s">${ui("dl_summary_s")}</span></span>
                <span class="dl-act">${svg("download")}</span>
              </button>
              ${
                figs.length
                  ? `<button class="dl" id="dlSchema" data-fig="${esc(figs[0].key)}" data-name="NovaSVT_${lesson.id}_schema">
                <span class="dl-ico">${svg("layers")}</span>
                <span class="dl-info"><span class="n">${ui("dl_schema")}</span><span class="s">${ui("dl_schema_s")}</span></span>
                <span class="dl-act">${svg("download")}</span>
              </button>`
                  : ""
              }
              <button class="dl" id="dlExercises">
                <span class="dl-ico">${svg("assign")}</span>
                <span class="dl-info"><span class="n">${ui("dl_exercises")}</span><span class="s">${ui("dl_exercises_s")}</span></span>
                <span class="dl-act">${svg("chevR")}</span>
              </button>
            </div>
          </div>

          <div class="block" id="b-quiz">
            <div class="block-title"><span class="bar"></span>${ui("block_quiz")}</div>
            <div class="quiz"><div class="quiz-inner" id="quizInner"></div><div class="hero-dots"></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  wireDetail(lesson);
  mountQuiz(lesson);
}

/** يربط الفهرس وأزرار الفيديو والتحميل. */
function wireDetail(lesson) {
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

  // تحميل الخطاطات داخل المعرض
  root.querySelectorAll(".fig-dl[data-fig]").forEach((btn) => {
    btn.addEventListener("click", () => downloadFigure(btn.dataset.fig, btn.dataset.name));
  });

  // قائمة الملفات
  root.querySelector("#dlSummary")?.addEventListener("click", () => downloadSummary(lesson));
  const schema = root.querySelector("#dlSchema");
  if (schema) {
    schema.addEventListener("click", () => downloadFigure(schema.dataset.fig, schema.dataset.name));
  }
  root.querySelector("#dlExercises")?.addEventListener("click", () => showToast(ui("toast_soon")));
}
