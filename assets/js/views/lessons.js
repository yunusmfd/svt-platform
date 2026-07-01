/**
 * Nova SVT — بوّابة الدروس (Lessons)
 * ----------------------------------------------------------------------------
 * تسلسل تصفّح متدرّج بثلاث طبقات: المستويات (شريط علوي) ← الوحدات (عناوين
 * أكورديون قابلة للطي) ← الدروس (تظهر عند فتح وحدتها). اختيار المستوى يتم
 * عبر روابط hash (#/lessons/{id}) فيعيد الموجّه بناء الصفحة ويجعل الرابط
 * قابلاً للمشاركة. البحث محليّ: يفتح تلقائياً كل وحدة تحوي نتيجة مطابقة،
 * ويُصفَّر عند كل دخول للصفحة (أي عند تبديل المستوى).
 */

import { t, ui } from "../core/i18n.js";
import { svg } from "../core/icons.js";
import { lessonCardHTML } from "../components/lessonCard.js";
import { getLevelId } from "../core/state.js";
import { lessonsForLevel, findLevel, levelsByStage } from "../core/content.js";
import { app, esc } from "../core/dom.js";

/** نص البحث الحالي (ephemeral — يُصفّر مع كل بناء للصفحة). */
let searchTerm = "";

/**
 * فهرس الوحدة المفتوحة حالياً (أكورديون بفتح واحد في كل مرّة)، أو null إن
 * أُغلقت الكل يدوياً. undefined تعني: لم يُحدَّد بعد — تُفتح تلقائياً أول
 * وحدة تحوي دروساً عند أول عرض للمستوى.
 */
let openUnitIdx;

/** رقاقة مستوى كرابط hash؛ تُبرز المستوى النشط. */
function chip(level, activeId) {
  const active = level.id === activeId ? " active" : "";
  return `<a class="chip${active}" href="#/lessons/${level.id}"><span class="tag">${esc(
    level.code
  )}</span>${esc(t(level.name))}</a>`;
}

export function renderLessons() {
  searchTerm = "";
  openUnitIdx = undefined;
  const levelId = getLevelId();
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

/** بند أكورديون واحد لوحدة: رأس قابل للنقر (رقم + اسم + عدد الدروس) وجسم قابل للطي. */
function accordionItemHTML(unit, lessons, idx, isOpen) {
  const count = lessons.length;
  return `
  <div class="acc-item${isOpen ? " open" : ""}">
    <button class="acc-head" type="button" data-acc="${idx}" aria-expanded="${isOpen}">
      <span class="acc-num">${String(unit.num).padStart(2, "0")}</span>
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
