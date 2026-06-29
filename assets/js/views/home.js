/**
 * Nova SVT — الصفحة الرئيسية (Home)
 * ----------------------------------------------------------------------------
 * واجهة ترحيبية + عرض لما تقدّمه المنصة + مجالا الحياة/الأرض + دروس مميّزة
 * + شريط دعائي. كل التنقّل عبر روابط hash (#/lessons...) يلتقطها الموجّه،
 * لذا لا حاجة لربط أحداث هنا. الأرقام تُحسب من البيانات المحمّلة.
 */

import { t, ui } from "../core/i18n.js";
import { svg, FIGURES, specStyle } from "../core/icons.js";
import { lessonCardHTML } from "../components/lessonCard.js";
import { getLevels, getAllLessons, findLesson } from "../core/content.js";
import { FEATURED_COUNT } from "../core/config.js";
import { app } from "../core/dom.js";

/** دروس مميّزة مختارة، مع استكمال تلقائي إن نقص أحدها مستقبلاً. */
const FEATURED_IDS = ["resp-vivants", "digestion", "tectonique-plaques"];

function featuredLessons() {
  const picked = FEATURED_IDS.map(findLesson).filter(Boolean);
  if (picked.length < FEATURED_COUNT) {
    for (const lesson of getAllLessons()) {
      if (picked.length >= FEATURED_COUNT) break;
      if (!picked.includes(lesson)) picked.push(lesson);
    }
  }
  return picked.slice(0, FEATURED_COUNT);
}

/** بطاقات المميّزات: [أيقونة, مفتاح العنوان, مفتاح الوصف, لون الطيف]. */
const FEATURES = [
  ["video", "feat1_t", "feat1_d", "--spec-green"],
  ["layers", "feat2_t", "feat2_d", "--spec-teal"],
  ["quiz", "feat3_t", "feat3_d", "--spec-violet"],
  ["download", "feat4_t", "feat4_d", "--spec-gold"],
];

/** شارات الشريط الدعائي: [أيقونة, مفتاح النص]. */
const BADGES = [
  ["free", "band_free"],
  ["shield", "band_nosignup"],
  ["globe", "band_bilingual"],
  ["device", "band_device"],
];

export function renderHome() {
  const levelCount = getLevels().length;
  const lessonCount = getAllLessons().length;
  const featured = featuredLessons();

  app().innerHTML = `
  <section class="hero">
    <div class="hero-dots"></div>
    <div class="hero-glow"></div>
    <div class="hero-strata"></div>
    <div class="wrap hero-inner">
      <div class="hero-badge anim-up"><span class="dot"></span>${ui("hero_badge")}</div>
      <h1 class="anim-up d1">${ui("hero_t1")} <span class="grad">${ui("hero_t2")}</span></h1>
      <p class="lead anim-up d2">${ui("hero_lead")}</p>
      <div class="hero-cta anim-up d3">
        <a class="btn btn-primary" href="#/lessons">${ui("hero_cta1")} ${svg("arrow")}</a>
        <a class="btn btn-dark" href="#/lessons">${ui("hero_cta2")}</a>
      </div>
      <div class="hero-stats anim-up d4">
        <div class="stat"><span class="num">${levelCount}</span><span class="lbl">${ui("stat_levels")}</span></div>
        <div class="stat"><span class="num">${lessonCount}</span><span class="lbl">${ui("stat_lessons")}</span></div>
        <div class="stat"><span class="num">100%</span><span class="lbl">${ui("stat_free")}</span></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">${ui("feat_eyebrow")}</span>
        <h2>${ui("feat_title")}</h2>
      </div>
      <div class="feature-grid">
        ${FEATURES.map(
          ([icon, title, desc, spec]) => `
        <div class="feature">
          <div class="ico" style="${specStyle(spec)}">${svg(icon)}</div>
          <h3>${ui(title)}</h3>
          <p>${ui(desc)}</p>
        </div>`
        ).join("")}
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">${ui("dual_eyebrow")}</span>
        <h2>${ui("dual_title")}</h2>
      </div>
      <div class="dual">
        <a class="dual-card dual-bio" href="#/lessons/1ac">
          <div class="dual-art">${FIGURES.cell}</div>
          <span class="dual-tag">${ui("dual_bio_tag")}</span>
          <h3>${ui("dual_bio_t")}</h3>
          <p>${ui("dual_bio_d")}</p>
          <span class="dual-link">${ui("dual_explore")} ${svg("arrow")}</span>
        </a>
        <a class="dual-card dual-geo" href="#/lessons/2bac">
          <div class="dual-art">${FIGURES.tecto}</div>
          <span class="dual-tag">${ui("dual_geo_tag")}</span>
          <h3>${ui("dual_geo_t")}</h3>
          <p>${ui("dual_geo_d")}</p>
          <span class="dual-link">${ui("dual_explore")} ${svg("arrow")}</span>
        </a>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="lessons-top">
        <div>
          <span class="eyebrow">${ui("feat_lessons_eyebrow")}</span>
          <h2 style="margin-top:10px">${ui("feat_lessons_title")}</h2>
        </div>
        <a class="btn btn-ghost" href="#/lessons">${ui("feat_lessons_all")} ${svg("arrow")}</a>
      </div>
      <div class="lesson-grid">
        ${featured.map(lessonCardHTML).join("")}
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      <div class="band">
        <div class="hero-dots"></div>
        <div class="band-text">
          <h2>${ui("band_t")}</h2>
          <p>${ui("band_d")}</p>
        </div>
        <div class="badges">
          ${BADGES.map(([icon, key]) => `<span class="badge-pill">${svg(icon)}${ui(key)}</span>`).join("")}
        </div>
      </div>
    </div>
  </section>`;
}
