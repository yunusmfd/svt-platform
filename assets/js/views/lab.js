/**
 * Nova SVT — المختبر الافتراضي (Lab)
 * ----------------------------------------------------------------------------
 * محاكاة ملاحظة مراحل الانقسام الخيطي المتساوي تحت المجهر، مع اختيار المرحلة
 * والتكبير (×2 إلى ×8). حالة المختبر (المرحلة/التكبير) محفوظة في المخزن فتُستعاد
 * عند العودة للصفحة. وصف كل مرحلة يظهر كتلميح على زرّها.
 */

import { t, ui } from "../core/i18n.js";
import { svg } from "../core/icons.js";
import { getLab, setLab } from "../core/state.js";
import { getExperiments } from "../core/content.js";
import { experimentBodyUrl } from "../core/config.js";
import { app, esc } from "../core/dom.js";
import { showToast } from "../components/toast.js";

/** أيقونة ومفتاح تسمية حسب نوع التجربة (فيديو / animation / صفحة تفاعلية). */
const EXP_ICON = { video: "video", animation: "spark", interactive: "box" };
const EXP_TYPE_KEY = { video: "exp_type_video", animation: "exp_type_animation", interactive: "exp_type_interactive" };

/** التجربة المختارة حالياً في معرض التجارب (ephemeral — تُصفَّر مع كل بناء للصفحة). */
let selectedExpIndex = 0;

const ZOOM_MIN = 200;
const ZOOM_MAX = 800;
const ZOOM_BASE = 400;
const ZOOM_STEP = 100;

/** أطوار الانقسام: خطاطة SVG محايدة اللغة + وصف ثنائي اللغة لكل طور. */
const MITOSIS = {
  1: {
    svg: '<svg viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="78" fill="#0f2a1d" stroke="#52B788" stroke-width="2"/><circle cx="100" cy="100" r="40" stroke="#9FE6BF" stroke-width="1.5" stroke-dasharray="3 5" fill="none"/><g stroke-width="5" stroke-linecap="round"><path d="M80 80 q8 18 -2 38" stroke="#C9A84C"/><path d="M88 78 q8 18 -2 40" stroke="#E5A23C"/><path d="M118 82 q-8 16 2 36" stroke="#52B788"/><path d="M126 84 q-8 16 2 34" stroke="#9FE6BF"/></g></svg>',
    read: { ar: "تكثّف الصبغيات وبداية اختفاء الغشاء النووي", fr: "Condensation des chromosomes, disparition de l'enveloppe nucléaire" },
  },
  2: {
    svg: '<svg viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="78" fill="#0f2a1d" stroke="#52B788" stroke-width="2"/><line x1="100" y1="30" x2="100" y2="170" stroke="#9FE6BF" stroke-width="1" stroke-dasharray="4 6"/><g stroke-width="5" stroke-linecap="round"><path d="M92 70 q-10 30 0 60" stroke="#C9A84C"/><path d="M108 70 q10 30 0 60" stroke="#E5A23C"/></g><g stroke="#52B788" stroke-width="1.5"><line x1="40" y1="60" x2="96" y2="95"/><line x1="160" y1="60" x2="104" y2="95"/><line x1="40" y1="140" x2="96" y2="105"/><line x1="160" y1="140" x2="104" y2="105"/></g></svg>',
    read: { ar: "اصطفاف الصبغيات في المستوى الاستوائي للخلية", fr: "Alignement des chromosomes sur le plan équatorial" },
  },
  3: {
    svg: '<svg viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="78" fill="#0f2a1d" stroke="#52B788" stroke-width="2"/><g stroke-width="5" stroke-linecap="round"><path d="M70 55 q-12 14 0 30" stroke="#C9A84C"/><path d="M70 145 q-12 -14 0 -30" stroke="#C9A84C"/><path d="M130 55 q12 14 0 30" stroke="#E5A23C"/><path d="M130 145 q12 -14 0 -30" stroke="#E5A23C"/></g><g stroke="#9FE6BF" stroke-width="1.5" stroke-dasharray="3 4"><line x1="50" y1="50" x2="78" y2="72"/><line x1="50" y1="150" x2="78" y2="128"/><line x1="150" y1="50" x2="122" y2="72"/><line x1="150" y1="150" x2="122" y2="128"/></g></svg>',
    read: { ar: "انفصال الصبيغيات الشقيقة نحو قطبي الخلية", fr: "Séparation des chromatides vers les pôles" },
  },
  4: {
    svg: '<svg viewBox="0 0 200 200" fill="none"><path d="M22 100 a78 78 0 0 1 156 0" fill="#0f2a1d" stroke="#52B788" stroke-width="2"/><path d="M178 100 a78 78 0 0 1 -156 0" fill="#0f2a1d" stroke="#52B788" stroke-width="2"/><path d="M40 100 h120" stroke="#1E5C40" stroke-width="3"/><circle cx="100" cy="62" r="22" stroke="#9FE6BF" stroke-width="1.5" stroke-dasharray="3 5" fill="none"/><circle cx="100" cy="138" r="22" stroke="#9FE6BF" stroke-width="1.5" stroke-dasharray="3 5" fill="none"/><g stroke-width="4" stroke-linecap="round"><path d="M92 54 q-6 8 0 16" stroke="#C9A84C"/><path d="M108 54 q6 8 0 16" stroke="#E5A23C"/><path d="M92 130 q-6 8 0 16" stroke="#C9A84C"/><path d="M108 130 q6 8 0 16" stroke="#E5A23C"/></g></svg>',
    read: { ar: "تشكّل نواتين وبداية انقسام السيتوبلازم", fr: "Formation de deux noyaux et début de cytodiérèse" },
  },
};

const zoomLabel = (zoom) => "×" + (zoom / 100).toFixed(1);

/** بطاقة تجربة واحدة في معرض التجارب. */
function expCardHTML(exp, active) {
  return `
  <button class="exp-card${active ? " active" : ""}" data-exp="${esc(exp.id)}" type="button">
    <span class="exp-ico">${svg(EXP_ICON[exp.type] || "box")}</span>
    <span class="exp-info">
      <span class="n">${esc(t(exp.title))}</span>
      <span class="s">${esc(ui(EXP_TYPE_KEY[exp.type] || "exp_type_interactive"))}</span>
    </span>
  </button>`;
}

/** يجلب ملفّ محتوى تجربة (فيديو/رسم متحرك/صفحة تفاعلية) — كل تجربة ملفّها الخاص. */
async function fetchExperimentBody(exp) {
  try {
    const res = await fetch(experimentBodyUrl(exp.id));
    if (res.ok) return await res.text();
  } catch {
    /* نعرض بديلاً أدناه */
  }
  return `<div class="exp-placeholder">${svg(EXP_ICON[exp.type] || "box")}<p>${esc(
    t(exp.desc)
  )}</p><p>${esc(ui("exp_soon"))}</p></div>`;
}

export function renderLab() {
  const { phase, zoom } = getLab();
  const experiments = getExperiments();
  selectedExpIndex = 0;

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <div class="section-head" style="margin-bottom:24px">
        <span class="eyebrow">${ui("lab_eyebrow")}</span>
        <h2>${ui("lab_title")}</h2>
        <p>${ui("lab_lead")}</p>
      </div>
      <div class="lab">
        <aside class="lab-side">
          <div>
            <h2>${ui("lab_exp_title")}</h2>
            <p class="lab-sub">${ui("lab_exp_sub")}</p>
          </div>
          <div class="lab-sec">
            <div class="lab-sec-h">${svg("book")}${ui("lab_steps_h")}</div>
            <div class="lab-steps">
              <div class="lab-step"><span class="n">1</span><span>${ui("lab_step1")}</span></div>
              <div class="lab-step"><span class="n">2</span><span>${ui("lab_step2")}</span></div>
              <div class="lab-step"><span class="n">3</span><span>${ui("lab_step3")}</span></div>
            </div>
          </div>
          <div class="lab-sec">
            <div class="lab-sec-h">${svg("flask")}${ui("lab_phases_h")}</div>
            <div class="phase-grid" id="phaseGrid">
              ${[1, 2, 3, 4]
                .map(
                  (n) =>
                    `<button class="phase ${n === phase ? "active" : ""}" data-phase="${n}" title="${esc(
                      t(MITOSIS[n].read)
                    )}"><span class="pn">${String(n).padStart(2, "0")}</span>${ui("phase" + n)}</button>`
                )
                .join("")}
            </div>
          </div>
        </aside>

        <div class="lab-stage">
          <div class="hero-dots"></div>
          <div class="scope">
            <svg class="cross" viewBox="0 0 100 100"><line x1="50" y1="0" x2="50" y2="100" stroke="#52B788" stroke-width=".5"/><line x1="0" y1="50" x2="100" y2="50" stroke="#52B788" stroke-width=".5"/></svg>
            <div class="stage-svg" id="stageSvg" style="transform:scale(${zoom / ZOOM_BASE})">${MITOSIS[phase].svg}</div>
          </div>
          <div class="lab-readout">
            <div><span>${ui("lab_readout")}:</span><span class="v" id="roPhase">${ui("phase" + phase)}</span></div>
            <div><span>ZOOM:</span><span class="v" id="roZoom">${zoomLabel(zoom)}</span></div>
          </div>
          <div class="lab-controls">
            <button id="zoomOut" aria-label="zoom out">${svg("zoomOut")}</button>
            <button id="zoomIn" aria-label="zoom in">${svg("zoomIn")}</button>
            <button id="capture" aria-label="capture">${svg("camera")}</button>
          </div>
        </div>
      </div>

      <div class="section-head" style="margin-block:44px 24px">
        <span class="eyebrow">${ui("exp_eyebrow")}</span>
        <h2>${ui("exp_title")}</h2>
        <p>${ui("exp_lead")}</p>
      </div>
      ${
        experiments.length
          ? `<div class="exp-grid" id="expGrid">${experiments
              .map((e, i) => expCardHTML(e, i === selectedExpIndex))
              .join("")}</div>
             <div class="exp-player" id="expPlayer"><div class="exp-placeholder"><p>${esc(
               ui("exp_loading")
             )}</p></div></div>`
          : `<div class="empty"><p>${esc(ui("exp_empty"))}</p></div>`
      }
    </div>
  </section>`;

  wireLab();
  if (experiments.length) selectExperiment(selectedExpIndex);
}

function wireLab() {
  document.querySelectorAll("#phaseGrid .phase").forEach((btn) => {
    btn.addEventListener("click", () => selectPhase(Number(btn.dataset.phase)));
  });
  document.getElementById("zoomOut")?.addEventListener("click", () => changeZoom(-1));
  document.getElementById("zoomIn")?.addEventListener("click", () => changeZoom(1));
  document.getElementById("capture")?.addEventListener("click", () => showToast(ui("toast_dl")));

  document.querySelectorAll("#expGrid .exp-card").forEach((btn, i) => {
    btn.addEventListener("click", () => selectExperiment(i));
  });
}

/** يبدّل التجربة المعروضة في لوحة معرض التجارب دون إعادة بناء الصفحة كاملةً. */
async function selectExperiment(i) {
  selectedExpIndex = i;
  const experiments = getExperiments();
  const exp = experiments[i];
  if (!exp) return;

  document.querySelectorAll("#expGrid .exp-card").forEach((b, idx) => {
    b.classList.toggle("active", idx === i);
  });

  const player = document.getElementById("expPlayer");
  if (player) player.innerHTML = `<div class="exp-placeholder"><p>${esc(ui("exp_loading"))}</p></div>`;

  const html = await fetchExperimentBody(exp);

  // إن بدّل المستخدم التجربة أثناء الجلب، تجاهل هذه النتيجة القديمة.
  if (selectedExpIndex !== i) return;
  const freshPlayer = document.getElementById("expPlayer");
  if (freshPlayer) freshPlayer.innerHTML = html;
}

function selectPhase(n) {
  setLab({ phase: n });
  document.querySelectorAll("#phaseGrid .phase").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.phase) === n);
  });
  const stage = document.getElementById("stageSvg");
  if (stage) stage.innerHTML = MITOSIS[n].svg;
  updateReadout();
}

function changeZoom(direction) {
  const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, getLab().zoom + direction * ZOOM_STEP));
  setLab({ zoom: next });
  const stage = document.getElementById("stageSvg");
  if (stage) stage.style.transform = `scale(${next / ZOOM_BASE})`;
  updateReadout();
}

function updateReadout() {
  const { phase, zoom } = getLab();
  const phaseEl = document.getElementById("roPhase");
  const zoomEl = document.getElementById("roZoom");
  if (phaseEl) phaseEl.textContent = ui("phase" + phase);
  if (zoomEl) zoomEl.textContent = zoomLabel(zoom);
}
