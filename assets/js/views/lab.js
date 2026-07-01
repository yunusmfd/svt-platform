/**
 * Nova SVT — معرض المختبر الافتراضي (Lab)
 * ----------------------------------------------------------------------------
 * معرض تجارب (فيديو / رسم متحرك / صفحة تفاعلية) مصدره الفهرس الوصفي
 * data/experiments.json. كل تجربة محتواها الكامل في ملفّها الخاص
 * (data/experiments/{id}.html)، وتُفتح في صفحتها الخاصّة (#/lab/{id}):
 *   - فيديو/رسم متحرك: يُجلب الملفّ (fetch) ويُحقن كجزء من الصفحة.
 *   - صفحة تفاعلية: الملفّ مستند HTML كامل بذاته (بمنطقه الخاص)، فيُعرض
 *     مباشرة داخل إطار <iframe> بدل الجلب والحقن (لأن السكربتات المحقونة
 *     عبر innerHTML لا تُنفَّذ في المتصفّح).
 */

import { t, ui } from "../core/i18n.js";
import { svg } from "../core/icons.js";
import { getExperiments, findExperiment } from "../core/content.js";
import { getExpId } from "../core/state.js";
import { experimentBodyUrl } from "../core/config.js";
import { go } from "../core/router.js";
import { app, esc } from "../core/dom.js";

/** أيقونة ومفتاح تسمية حسب نوع التجربة. */
const EXP_ICON = { video: "video", animation: "spark", interactive: "box" };
const EXP_TYPE_KEY = { video: "exp_type_video", animation: "exp_type_animation", interactive: "exp_type_interactive" };

function typeTagHTML(exp) {
  return `${svg(EXP_ICON[exp.type] || "box")}${esc(ui(EXP_TYPE_KEY[exp.type] || "exp_type_interactive"))}`;
}

/** بطاقة تجربة واحدة في المعرض: صورة مصغّرة متدرّجة + وسم النوع + عنوان ووصف. */
function expCardHTML(exp) {
  return `
  <a class="exp-card" href="#/lab/${esc(exp.id)}">
    <div class="exp-thumb">
      <span class="xtag">${typeTagHTML(exp)}</span>
      <span class="play-circle">${svg("play")}</span>
    </div>
    <div class="exp-body">
      <h3>${esc(t(exp.title))}</h3>
      <p>${esc(t(exp.desc))}</p>
    </div>
    <div class="exp-foot">
      <span class="exp-open">${ui("exp_open")}${svg("chevR")}</span>
      ${exp.duration ? `<span class="exp-duration">${svg("clock")}${esc(exp.duration)}</span>` : ""}
    </div>
  </a>`;
}

/** معرض التجارب — الصفحة الرئيسية لـ #/lab. */
export function renderLab() {
  const experiments = getExperiments();

  app().innerHTML = `
  <section class="section">
    <div class="wrap">
      <div class="section-head" style="margin-bottom:24px">
        <span class="eyebrow">${ui("lab_eyebrow")}</span>
        <h2>${ui("lab_title")}</h2>
        <p>${ui("lab_lead")}</p>
      </div>
      ${
        experiments.length
          ? `<div class="exp-grid">${experiments.map(expCardHTML).join("")}</div>`
          : `<div class="empty"><p>${esc(ui("exp_empty"))}</p></div>`
      }
    </div>
  </section>`;
}

/** يجلب ملفّ محتوى تجربة غير تفاعلية (فيديو/رسم متحرك)، أو رسالة بديلة عند الفشل. */
async function fetchExperimentFragment(exp) {
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

/** صفحة تجربة واحدة — #/lab/{id}. */
export async function renderLabExperiment() {
  const exp = findExperiment(getExpId());
  if (!exp) {
    go("lab");
    return;
  }

  const isInteractive = exp.type === "interactive";
  const fileUrl = experimentBodyUrl(exp.id);

  app().innerHTML = `
  <section class="section">
    <div class="wrap" style="max-width:880px">
      <a class="back-link" href="#/lab">${svg("arrow")}${ui("back_lab")}</a>
      <div class="detail-tags">
        <span class="dtag unit">${typeTagHTML(exp)}</span>
      </div>
      <h1>${esc(t(exp.title))}</h1>
      <div class="prose" style="margin-bottom:20px"><p>${esc(t(exp.desc))}</p></div>
      ${
        exp.duration
          ? `<div class="detail-meta"><span>${svg("clock")}${esc(exp.duration)} — ${ui("meta_duration")}</span></div>`
          : ""
      }
      <div class="exp-player" id="expPlayer">
        ${
          isInteractive
            ? `<iframe src="${esc(fileUrl)}" title="${esc(t(exp.title))}" allowfullscreen></iframe>`
            : `<div class="exp-placeholder"><p>${esc(ui("exp_loading"))}</p></div>`
        }
      </div>
      ${
        isInteractive
          ? `<p style="margin-top:14px"><a class="post-more" href="${esc(
              fileUrl
            )}" target="_blank" rel="noopener">${ui("exp_open_tab")}${svg("arrow")}</a></p>`
          : ""
      }
    </div>
  </section>`;

  if (isInteractive) return;

  const html = await fetchExperimentFragment(exp);
  // إن غادر المستخدم الصفحة أثناء الجلب، تجاهل هذه النتيجة القديمة.
  if (getExpId() !== exp.id) return;
  const player = document.getElementById("expPlayer");
  if (player) player.innerHTML = html;
}
