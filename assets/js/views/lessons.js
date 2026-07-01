/**
 * Nova SVT — بوّابة الدروس (Lessons)
 * ----------------------------------------------------------------------------
 * واجهة + شريط مستويات + بحث + شبكة دروس. اختيار المستوى يتم عبر روابط hash
 * (#/lessons/{id}) فيعيد الموجّه بناء الصفحة ويجعل الرابط قابلاً للمشاركة.
 * البحث محليّ: يصفّي الشبكة فوراً دون تغيير الرابط، ويُصفَّر عند كل دخول
 * للصفحة (أي عند تبديل المستوى).
 */

import { t, ui } from "../core/i18n.js";
import { svg } from "../core/icons.js";
import { lessonCardHTML } from "../components/lessonCard.js";
import { getLevelId } from "../core/state.js";
import { lessonsForLevel, findLevel, levelsByStage } from "../core/content.js";
import { app, esc } from "../core/dom.js";

/** نص البحث الحالي (ephemeral — يُصفّر مع كل بناء للصفحة). */
let searchTerm = "";

/** رقاقة مستوى كرابط hash؛ تُبرز المستوى النشط. */
function chip(level, activeId) {
  const active = level.id === activeId ? " active" : "";
  return `<a class="chip${active}" href="#/lessons/${level.id}"><span class="tag">${esc(
    level.code
  )}</span>${esc(t(level.name))}</a>`;
}

/** كتلة "وحدات هذا المستوى" — تعرض السلّم الرسمي لوحدات المستوى الحالي. */
function unitSyllabusHTML(level) {
  const units = (level && level.units) || [];
  if (!units.length) return "";
  return `
  <div class="unit-syllabus">
    <span class="unit-syllabus-h">${ui("units_of_level")}</span>
    <div class="unit-chips">
      ${units
        .map(
          (u) =>
            `<span class="unit-chip"><span class="num">${String(u.num).padStart(
              2,
              "0"
            )}</span>${esc(t(u))}</span>`
        )
        .join("")}
    </div>
  </div>`;
}

export function renderLessons() {
  searchTerm = "";
  const levelId = getLevelId();
  const level = findLevel(levelId);
  const groups = levelsByStage();
  const college = groups.college || [];
  const lycee = groups.lycee || [];

  app().innerHTML = `
  <section class="portal-hero">
    <div class="hero-dots"></div>
    <div class="wrap portal-hero-inner">
      <h1>${ui("portal_title")}</h1>
      <p>${ui("portal_lead")}</p>
    </div>
  </section>

  <div class="levelbar">
    <div class="wrap levelbar-inner">
      <div class="lvl-cycle">
        ${college.length ? `<span class="eyebrow lvl-label">${ui("lvl_college")}</span>` : ""}
        <div class="lvl-group">${college.map((l) => chip(l, levelId)).join("")}</div>
      </div>
      ${lycee.length ? '<div class="lvl-sep"></div>' : ""}
      <div class="lvl-cycle">
        ${lycee.length ? `<span class="eyebrow lvl-label">${ui("lvl_lycee")}</span>` : ""}
        <div class="lvl-group">${lycee.map((l) => chip(l, levelId)).join("")}</div>
      </div>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="lessons-top">
        <div>
          <h2 id="lvlTitle"></h2>
          <p class="sub" id="lvlSub"></p>
        </div>
        <div class="search">
          ${svg("search")}
          <input id="searchBox" type="search" placeholder="${esc(ui("search_ph"))}"
                 aria-label="${esc(ui("search_ph"))}" autocomplete="off" />
        </div>
      </div>
      ${unitSyllabusHTML(level)}
      <div class="lesson-groups" id="lessonGrid"></div>
    </div>
  </section>`;

  const box = document.getElementById("searchBox");
  if (box) {
    box.addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderGrid();
    });
  }

  renderGrid();
}

/** يعيد بناء عنوان المستوى والعدّاد والشبكة وفق المستوى والبحث الحاليين. */
function renderGrid() {
  const levelId = getLevelId();
  const level = findLevel(levelId);

  let list = lessonsForLevel(levelId);
  const term = searchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((l) =>
      `${t(l.title)} ${t(l.unit)} ${t(l.desc)}`.toLowerCase().includes(term)
    );
  }

  const titleEl = document.getElementById("lvlTitle");
  const subEl = document.getElementById("lvlSub");
  const grid = document.getElementById("lessonGrid");

  if (titleEl) titleEl.textContent = level ? t(level.name) : "";
  if (subEl) {
    const stageLabel = level
      ? level.stage === "college"
        ? ui("lvl_college")
        : ui("lvl_lycee")
      : "";
    subEl.textContent = `${stageLabel} • ${list.length} ${ui("lessons_count")}`;
  }

  if (!grid) return;
  if (list.length === 0) {
    const msg = term ? ui("no_results") : ui("no_lessons_level");
    grid.innerHTML = `<div class="empty">${svg("search")}<p>${esc(msg)}</p></div>`;
    return;
  }

  const units = (level && level.units) || [];
  const groups = units
    .map((unit) => ({ unit, lessons: list.filter((l) => l.unit && l.unit.ar === unit.ar) }))
    .filter((g) => g.lessons.length > 0);

  const grouped = new Set(groups.flatMap((g) => g.lessons));
  const rest = list.filter((l) => !grouped.has(l));

  grid.innerHTML =
    groups.map((g) => unitGroupHTML(g.unit, g.lessons)).join("") +
    (rest.length ? `<div class="lesson-grid">${rest.map(lessonCardHTML).join("")}</div>` : "");
}

/** كتلة دروس وحدة واحدة: عنوان الوحدة + شبكة بطاقاتها. */
function unitGroupHTML(unit, lessons) {
  return `
  <div class="unit-block">
    <div class="block-title"><span class="bar"></span><h3>${esc(t(unit))}</h3></div>
    <div class="lesson-grid">${lessons.map(lessonCardHTML).join("")}</div>
  </div>`;
}
