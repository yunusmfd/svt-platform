/**
 * Nova SVT — صفحة عن المنصة (About)
 * ----------------------------------------------------------------------------
 * تعريف بالمنصة وبالأستاذ، وأسباب اختيارها، ودعوة لتصفّح الدروس. محتوى ثابت
 * عدا الأرقام (تُحسب من البيانات) وزر الدعوة (رابط hash).
 */

import { t, ui } from "../core/i18n.js";
import { svg } from "../core/icons.js";
import { getLevels, getAllLessons } from "../core/content.js";
import { app } from "../core/dom.js";

/** بطاقات "لماذا المنصة": [أيقونة, مفتاح العنوان, مفتاح الوصف]. */
const WHY = [
  ["flag", "why1_t", "why1_d"],
  ["globe", "why2_t", "why2_d"],
  ["quiz", "why3_t", "why3_d"],
  ["device", "why4_t", "why4_d"],
];

export function renderAbout() {
  const lessonCount = getAllLessons().length;
  const levelCount = getLevels().length;

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <div class="about-hero">
        <div class="hero-glow"></div>
        <div class="hero-dots"></div>
        <div class="about-hero-inner">
          <span class="eyebrow" style="color:var(--mint-bright)">Nova SVT</span>
          <h1 style="margin-top:12px">${ui("about_title")}</h1>
          <p>${ui("about_lead")}</p>
        </div>
      </div>

      <div class="teacher">
        <div class="avatar">${svg("teacher")}<span class="cert">SVT</span></div>
        <div class="t-info">
          <h2>${ui("teacher_name")}</h2>
          <p>${ui("teacher_bio")}</p>
          <p class="fr-note">${ui("teacher_fr")}</p>
        </div>
        <div class="t-stat"><span class="num">${lessonCount}</span><span class="lbl">${ui("teacher_stat")}</span></div>
        <div class="t-stat"><span class="num">${levelCount}</span><span class="lbl">${t({ ar: "مستويات", fr: "niveaux" })}</span></div>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">${ui("why_eyebrow")}</span>
        <h2>${ui("why_title")}</h2>
      </div>
      <div class="why-grid">
        ${WHY.map(
          ([icon, title, desc]) => `
        <div class="why">
          <div class="ico">${svg(icon)}</div>
          <h3>${ui(title)}</h3>
          <p>${ui(desc)}</p>
        </div>`
        ).join("")}
      </div>

      <div class="band" style="margin-top:34px">
        <div class="hero-dots"></div>
        <div class="band-text">
          <h2>${ui("about_cta_t")}</h2>
          <p>${ui("about_cta_d")}</p>
        </div>
        <a class="btn btn-primary" href="#/lessons">${ui("about_cta_btn")} ${svg("arrow")}</a>
      </div>
    </div>
  </section>`;
}
