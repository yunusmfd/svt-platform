/**
 * Nova SVT — بوّابة الدروس (Lessons)
 * ----------------------------------------------------------------------------
 * تسلسل تصفّح متدرّج بثلاث طبقات:
 *   #/lessons            → دليل المستويات: بطاقات مصنّفة حسب السلك (إعدادي/تأهيلي).
 *   #/lessons/{levelId}  → صفحة المستوى: وحداته كأكورديون ملوَّن حسب تخصّصها،
 *                          تكشف كل وحدة دروسها عند فتحها.
 * البحث محليّ (داخل صفحة المستوى فقط): يفتح تلقائياً كل وحدة تحوي نتيجة
 * مطابقة، ويُصفَّر عند كل دخول للصفحة (أي عند تبديل المستوى).
 */

import { t, ui } from "../core/i18n.js";
import { svg, specStyle } from "../core/icons.js";
import { lessonCardHTML } from "../components/lessonCard.js";
import { getLevelId } from "../core/state.js";
import { lessonsForLevel, findLevel, levelsByStage } from "../core/content.js";
import { app, esc } from "../core/dom.js";

/** نص البحث الحالي (ephemeral — يُصفّر مع كل بناء لصفحة مستوى). */
let searchTerm = "";

/**
 * فهرس الوحدة المفتوحة حالياً (أكورديون بفتح واحد في كل مرّة)، أو null إن
 * أُغلقت الكل يدوياً. undefined تعني: لم يُحدَّد بعد — تُفتح تلقائياً أول
 * وحدة تحوي دروساً عند أول عرض للمستوى.
 */
let openUnitIdx;

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

/** بطاقة مستوى واحد ضمن دليل المستويات. */
function levelCardHTML(level) {
  const count = (level.units || []).length;
  return `
  <a class="level-card" href="#/lessons/${esc(level.id)}">
    <span class="code">${esc(level.code)}</span>
    <h3>${esc(t(level.name))}</h3>
    <p class="count">${count} ${esc(ui("level_units_count"))}</p>
    <span class="browse">${ui("browse_units")}${svg("chevR")}</span>
  </a>`;
}

function renderLevelCatalog() {
  const groups = levelsByStage();
  const college = groups.college || [];
  const lycee = groups.lycee || [];

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <h1>${ui("portal_title")}</h1>
        <p>${ui("portal_lead")}</p>
      </div>

      ${
        college.length
          ? `<div class="block-title" style="margin-bottom:20px"><span class="bar"></span><h2>${ui(
              "lvl_college"
            )}</h2></div>
             <div class="level-grid">${college.map(levelCardHTML).join("")}</div>`
          : ""
      }

      ${
        lycee.length
          ? `<div class="block-title" style="margin-bottom:20px"><span class="bar"></span><h2>${ui(
              "lvl_lycee"
            )}</h2></div>
             <div class="level-grid">${lycee.map(levelCardHTML).join("")}</div>`
          : ""
      }
    </div>
  </section>`;
}

/* ============================================================================
   الطبقة 2 و3: صفحة مستوى — أكورديون الوحدات، وكل وحدة تكشف دروسها
   ========================================================================== */

function renderLevelPage(levelId) {
  searchTerm = "";
  openUnitIdx = undefined;

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
      <div class="unit-accordion" id="lessonGrid"></div>
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

/** يعيد بناء عنوان المستوى والعدّاد والأكورديون وفق المستوى والبحث الحاليين. */
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

  const units = (level && level.units) || [];
  const groups = units.map((unit) => ({
    unit,
    lessons: list.filter((l) => l.unit && l.unit.ar === unit.ar),
  }));

  const grouped = new Set(groups.flatMap((g) => g.lessons));
  const rest = list.filter((l) => !grouped.has(l));

  // أثناء البحث: تُخفى الوحدات التي لا تحوي أي نتيجة مطابقة، وتُفتح البقيّة تلقائياً.
  // خارج البحث: تظهر كل وحدات المستوى الرسمية (حتى الفارغة)، مع فتح واحدة فقط.
  const visibleGroups = term ? groups.filter((g) => g.lessons.length > 0) : groups;

  if (term && visibleGroups.length === 0 && rest.length === 0) {
    grid.innerHTML = `<div class="empty">${svg("search")}<p>${esc(ui("no_results"))}</p></div>`;
    return;
  }

  let openSet;
  if (term) {
    openSet = new Set(visibleGroups.map((_, i) => i));
  } else {
    if (openUnitIdx === undefined) {
      const firstWithLessons = groups.findIndex((g) => g.lessons.length > 0);
      openUnitIdx = firstWithLessons >= 0 ? firstWithLessons : 0;
    }
    openSet = openUnitIdx === null ? new Set() : new Set([openUnitIdx]);
  }

  grid.innerHTML =
    visibleGroups.map((g, i) => accordionItemHTML(g.unit, g.lessons, i, openSet.has(i))).join("") +
    (rest.length
      ? `<div class="unit-block"><div class="lesson-grid">${rest.map(lessonCardHTML).join("")}</div></div>`
      : "");

  wireAccordion();
}

/** بند أكورديون واحد لوحدة: رأس قابل للنقر (رقم ملوّن حسب التخصّص + اسم + عدد الدروس) وجسم قابل للطي. */
function accordionItemHTML(unit, lessons, idx, isOpen) {
  const count = lessons.length;
  const token = `--spec-${unit.spec || "green"}`;
  return `
  <div class="acc-item${isOpen ? " open" : ""}" style="--spec-item:var(${token})">
    <button class="acc-head" type="button" data-acc="${idx}" aria-expanded="${isOpen}">
      <span class="acc-num" style="${specStyle(token)}">${String(unit.num).padStart(2, "0")}</span>
      <span class="acc-title">${esc(t(unit))}</span>
      <span class="acc-count">${count} ${esc(ui("lessons_count"))}</span>
      ${svg("chevR", "acc-chev")}
    </button>
    <div class="acc-body">
      ${
        count
          ? `<div class="lesson-grid">${lessons.map(lessonCardHTML).join("")}</div>`
          : `<p class="acc-empty">${esc(ui("unit_empty"))}</p>`
      }
    </div>
  </div>`;
}

/** يربط أزرار فتح/طي الوحدات (أكورديون بفتح واحد في كل مرّة). */
function wireAccordion() {
  document.querySelectorAll("#lessonGrid .acc-head").forEach((btn) => {
    btn.addEventListener("click", () => toggleUnit(Number(btn.dataset.acc)));
  });
}

function toggleUnit(idx) {
  openUnitIdx = openUnitIdx === idx ? null : idx;
  renderGrid();
}
