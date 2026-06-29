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

export function renderLessons() {
  searchTerm = "";
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
      <div class="lvl-group">${college.map((l) => chip(l, levelId)).join("")}</div>
      ${lycee.length ? '<div class="lvl-sep"></div>' : ""}
      <div class="lvl-group">${lycee.map((l) => chip(l, levelId)).join("")}</div>
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
      <div class="lesson-grid" id="lessonGrid"></div>
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
    grid.innerHTML = `<div class="empty">${svg("search")}<p>${ui("no_results")}</p></div>`;
    return;
  }
  grid.innerHTML = list.map(lessonCardHTML).join("");
}
