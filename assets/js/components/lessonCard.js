/**
 * Nova SVT — بطاقة الدرس (Lesson Card)
 * ----------------------------------------------------------------------------
 * يبني عنصر بطاقة درس واحد كرابط نحو صفحة الدرس (#/lesson/{id}).
 * مكوّن معاد استخدامه في الصفحة الرئيسية (الدروس المميّزة) وفي شبكة الدروس.
 */

import { t, ui } from "../core/i18n.js";
import { svg, figFor } from "../core/icons.js";
import { getJSON } from "../core/storage.js";
import { STORAGE_KEYS } from "../core/config.js";

/** شارة أفضل نتيجة محفوظة (إن وُجدت) — تحفّز المتعلّم على التتبّع. */
function scoreBadge(lessonId) {
  const saved = getJSON(STORAGE_KEYS.quizPrefix + lessonId, null);
  if (!saved || typeof saved.best !== "number") return "";
  return `<span class="lcard-score" title="${ui("res_best")}: ${saved.best}%">${svg("check")}${saved.best}%</span>`;
}

/** شارة الفرع (حياة/أرض) المعروضة أعلى صورة البطاقة. */
function branchTag(branch) {
  const isGeo = branch === "geo";
  return `<span class="branch">${svg(isGeo ? "globe2" : "leaf")}${
    isGeo ? ui("branch_geo") : ui("branch_bio")
  }</span>`;
}

/** يعيد سلسلة HTML لبطاقة درس. */
export function lessonCardHTML(lesson) {
  const isGeo = lesson.branch === "geo";
  const qCount = Array.isArray(lesson.quiz) ? lesson.quiz.length : 0;

  const tags = [];
  if (lesson.video) tags.push(`<span class="mtag">${svg("video")}${ui("tag_video")}</span>`);
  tags.push(`<span class="mtag">${svg("quiz")}${ui("tag_quiz")}</span>`);

  return `
  <a class="lcard${isGeo ? " geo" : ""}" href="#/lesson/${lesson.id}">
    <div class="lcard-top"></div>
    <div class="lcard-fig">
      ${branchTag(lesson.branch)}
      <div class="tags">${tags.join("")}</div>
      ${scoreBadge(lesson.id)}
      ${figFor(lesson.fig)}
    </div>
    <div class="lcard-body">
      <span class="lcard-unit">${t(lesson.unit)}</span>
      <h3>${t(lesson.title)}</h3>
      <p>${t(lesson.desc)}</p>
    </div>
    <div class="lcard-foot">
      <div class="lcard-meta">
        <span>${svg("clock")}${lesson.duration} ${ui("min")}</span>
        <span>${svg("quiz")}${qCount} ${ui("questions")}</span>
      </div>
      <span class="lcard-go" aria-hidden="true">${svg("arrow")}</span>
    </div>
  </a>`;
}
