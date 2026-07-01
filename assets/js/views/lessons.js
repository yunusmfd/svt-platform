/**
 * Nova SVT — بوّابة الدروس (Lessons)
 * ----------------------------------------------------------------------------
 * تسلسل تصفّح متدرّج بثلاث طبقات:
 *   #/lessons            → دليل المستويات: بطاقات مصنّفة حسب السلك
 *                          (إعدادي، جذع مشترك، الأولى باكالوريا، الثانية باكالوريا).
 *   #/lessons/{levelId}  → صفحة المستوى: كل وحدة تظهر كعنوان بخط عريض
 *                          (ملوَّن حسب تخصّصها العلمي) وتحته دروسها مباشرة.
 * البحث محليّ (داخل صفحة المستوى فقط): يُبقي فقط الوحدات التي تحوي نتيجة
 * مطابقة، ويُصفَّر عند كل دخول للصفحة (أي عند تبديل المستوى).
 */

import { t, ui } from "../core/i18n.js";
import { svg, specStyle } from "../core/icons.js";
import { lessonCardHTML } from "../components/lessonCard.js";
import { getLevelId } from "../core/state.js";
import { lessonsForLevel, findLevel, levelsByStage } from "../core/content.js";
import { app, esc } from "../core/dom.js";

/** ترتيب الأسلاك في دليل المستويات، ومفتاح ترجمة تسمية كل سلك. */
const STAGE_ORDER = [
  { key: "college", labelKey: "lvl_college" },
  { key: "tc", labelKey: "lvl_tc" },
  { key: "bac1", labelKey: "lvl_bac1" },
  { key: "bac2", labelKey: "lvl_bac2" },
];

/** نص البحث الحالي (ephemeral — يُصفّر مع كل بناء لصفحة مستوى). */
let searchTerm = "";

export function renderLessons() {
  const levelId = getLevelId();
  if (!levelId) {
    renderLevelCatalog();
  } else {
    renderLevelPage(levelId);
  }
}

/* ============================================================================
   الطبقة 1: دليل المستويات (بلا مستوى محدَّد في الرابط)
   ========================================================================== */

/** بطاقة مستوى واحد ضمن دليل المستويات، بلون يتماشى مع طبيعة المستوى. */
function levelCardHTML(level) {
  const count = (level.units || []).length;
  const token = `--spec-${level.spec || "green"}`;
  return `
  <a class="level-card" href="#/lessons/${esc(level.id)}" style="--spec-item:var(${token})">
    <span class="level-glow" aria-hidden="true"></span>
    <span class="level-badge" style="${specStyle(token)}">${esc(level.code)}</span>
    <h3>${esc(t(level.name))}</h3>
    <p class="count">${svg("layers")}<span>${count} ${esc(ui("level_units_count"))}</span></p>
    <span class="browse">${ui("browse_units")}${svg("chevR")}</span>
  </a>`;
}

function renderLevelCatalog() {
  const groups = levelsByStage();

  const sections = STAGE_ORDER.map(({ key, labelKey }) => {
    const levels = groups[key] || [];
    if (!levels.length) return "";
    return `
    <div class="block-title" style="margin-bottom:20px"><span class="bar"></span><h2>${ui(
      labelKey
    )}</h2></div>
    <div class="level-grid">${levels.map(levelCardHTML).join("")}</div>`;
  }).join("");

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <h1>${ui("portal_title")}</h1>
        <p>${ui("portal_lead")}</p>
      </div>
      ${sections}
    </div>
  </section>`;
}

/* ============================================================================
   الطبقة 2 و3: صفحة مستوى — عنوان بخط عريض لكل وحدة، ودروسها مباشرة تحته
   ========================================================================== */

function renderLevelPage(levelId) {
  searchTerm = "";

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <a class="back-link" href="#/lessons">${svg("arrow")}${ui("back_levels")}</a>
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
      <div class="unit-list" id="lessonGrid"></div>
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

/** يعيد بناء عنوان المستوى والعدّاد وقائمة الوحدات وفق المستوى والبحث الحاليين. */
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
    const stageEntry = STAGE_ORDER.find((s) => s.key === (level && level.stage));
    const stageLabel = stageEntry ? ui(stageEntry.labelKey) : "";
    subEl.textContent = `${stageLabel} • ${list.length} ${ui("lessons_count")}`;
  }
  if (!grid) return;

  const units = (level && level.units) || [];
  const groups = units.map((unit) => ({
    unit,
    lessons: list.filter((l) => l.unitNum === unit.num),
  }));

  const grouped = new Set(groups.flatMap((g) => g.lessons));
  const rest = list.filter((l) => !grouped.has(l));

  // أثناء البحث: تُخفى الوحدات التي لا تحوي أي نتيجة مطابقة.
  // خارج البحث: تظهر كل وحدات المستوى الرسمية، حتى الفارغة منها.
  const visibleGroups = term ? groups.filter((g) => g.lessons.length > 0) : groups;

  if (visibleGroups.length === 0 && rest.length === 0) {
    const msg = term ? ui("no_results") : ui("level_empty");
    grid.innerHTML = `<div class="empty">${svg("search")}<p>${esc(msg)}</p></div>`;
    return;
  }

  grid.innerHTML =
    visibleGroups.map((g) => unitGroupHTML(g.unit, g.lessons)).join("") +
    (rest.length
      ? `<div class="unit-group"><div class="lesson-grid">${rest.map(lessonCardHTML).join("")}</div></div>`
      : "");
}

/** كتلة وحدة واحدة: عنوان بخط عريض (ملوَّن حسب التخصّص) ثم شبكة دروسها مباشرة. */
function unitGroupHTML(unit, lessons) {
  const count = lessons.length;
  const token = `--spec-${unit.spec || "green"}`;
  return `
  <div class="unit-group" style="--spec-item:var(${token})">
    <div class="unit-head">
      <span class="unit-num" style="${specStyle(token)}">${esc(ui("unit_word"))} ${unit.num}</span>
      <h3 class="unit-title">${esc(t(unit))}</h3>
      <span class="unit-count">${count} ${esc(ui("lessons_count"))}</span>
    </div>
    ${
      count
        ? `<div class="lesson-grid">${lessons.map(lessonCardHTML).join("")}</div>`
        : `<p class="unit-empty">${esc(ui("unit_empty"))}</p>`
    }
  </div>`;
}
