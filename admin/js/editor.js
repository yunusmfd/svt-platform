/**
 * Nova SVT — محرّر الدروس (Admin Panel)
 * =============================================================================
 * يُنتج مجلّد درس كامل وفق معمارية المنصة (فصل البيانات عن المحتوى):
 *   data/lessons/{id}/meta.json  → بيانات منظّمة + اختبار.
 *   data/lessons/{id}/ar.html    → محتوى الدرس بالعربية (Fragment HTML).
 *   data/lessons/{id}/fr.html    → محتوى الدرس بالفرنسية.
 *   + مدخلة تُضاف إلى data/lessons/index.json (فهرس البطاقات الخفيف).
 *
 * المستويات ووحداتها تُحمَّل من data/levels.json فتبقى اللوحة متزامنة مع
 * المنصة، ويضمن اختيار الوحدة تطابق رقمها ونصّها.
 */

const FALLBACK_LEVELS = [
  { id: "1ac", name: { ar: "الأولى إعدادي" } }, { id: "2ac", name: { ar: "الثانية إعدادي" } },
  { id: "3ac", name: { ar: "الثالثة إعدادي" } }, { id: "tcs", name: { ar: "جذع مشترك علمي" } },
  { id: "tc-lettres", name: { ar: "جذع مشترك أدبي" } }, { id: "1bac-exp", name: { ar: "شعبة علوم تجريبية" } },
  { id: "1bac-math", name: { ar: "شعبة علوم رياضية" } }, { id: "1bac-agro", name: { ar: "شعبة علوم زراعية" } },
  { id: "1bac-lettres", name: { ar: "شعبة الآداب" } }, { id: "2bac-svt", name: { ar: "مسلك علوم الحياة والأرض" } },
  { id: "2bac-pc", name: { ar: "مسلك علوم فيزيائية" } }, { id: "2bac-math", name: { ar: "مسلك علوم رياضية" } },
  { id: "2bac-agro", name: { ar: "مسلك علوم زراعية" } },
];

let LEVELS = FALLBACK_LEVELS;
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "nova-svt-admin-draft";
const TODAY = new Date().toISOString().slice(0, 10);

const form = $("lessonForm");
const levelSel = $("lessonLevel");
const unitSel = $("lessonUnit");
const quizList = $("quizList");
const previewContent = $("previewContent");
const exportModal = $("exportModal");
const saveModal = $("saveModal");

/* ── المستويات ─────────────────────────────────────────────────────────── */
async function loadLevels() {
  try {
    const res = await fetch("../data/levels.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    LEVELS = await res.json();
  } catch (e) {
    console.warn("levels.json:", e);
    LEVELS = FALLBACK_LEVELS;
    $("loadWarn").hidden = false;
  }
  levelSel.innerHTML =
    '<option value="">اختر مستوى…</option>' +
    LEVELS.map((lv) => `<option value="${lv.id}">${escAttr(lv.name.ar)} (${lv.id})</option>`).join("");
  populateUnits();
}

function populateUnits(preselectAr) {
  const level = LEVELS.find((l) => l.id === levelSel.value);
  const units = (level && level.units) || [];
  if (!levelSel.value) {
    unitSel.innerHTML = '<option value="">اختر المستوى أوّلاً…</option>';
    unitSel.disabled = true;
  } else if (!units.length) {
    unitSel.innerHTML = '<option value="">— لا وحدات رسمية لهذا المستوى بعد —</option>';
    unitSel.disabled = true;
  } else {
    unitSel.innerHTML =
      '<option value="">اختر وحدة…</option>' +
      units
        .map((u, i) => {
          const label = u.num ? `الوحدة ${u.num} — ${u.ar}` : u.ar;
          return `<option value="${i}" data-num="${u.num ?? ""}" data-ar="${escAttr(u.ar)}" data-fr="${escAttr(u.fr || "")}">${escAttr(label)}</option>`;
        })
        .join("");
    unitSel.disabled = false;
    if (preselectAr != null) {
      const m = units.findIndex((u) => u.ar === preselectAr);
      if (m >= 0) unitSel.value = String(m);
    }
  }
  $("levelFileHint").textContent = levelSel.value ? `المجلّد: data/lessons/${levelSel.value.replace(/[^a-z0-9-]/gi, "")}/…` : "";
}

function selectedUnit() {
  const o = unitSel.options[unitSel.selectedIndex];
  if (!o || !o.value) return { num: null, ar: "", fr: "" };
  return { num: o.dataset.num ? parseInt(o.dataset.num) : null, ar: o.dataset.ar || "", fr: o.dataset.fr || "" };
}

/* ── إدراج خطاطة في محتوى اللغة ──────────────────────────────────────────── */
function figSnippet() {
  const key = $("figKey").value;
  return (
    `<figure class="lesson-fig" data-fig="${key}">\n` +
    `  <figcaption>\n` +
    `    <span class="fig-t">الشكل — العنوان</span>\n` +
    `    <span class="fig-c">تعليق قصير</span>\n` +
    `  </figcaption>\n` +
    `</figure>\n`
  );
}
function appendToArea(area) {
  area.value = (area.value ? area.value.replace(/\s*$/, "") + "\n" : "") + figSnippet();
  onChange();
}
$("insertFigAr").addEventListener("click", () => appendToArea($("bodyAr")));
$("insertFigFr").addEventListener("click", () => appendToArea($("bodyFr")));

/* ── الاختبار (متكرّر) ───────────────────────────────────────────────────── */
function quizRowHTML(v) {
  const q = v || { q: { ar: "", fr: "" }, options: [{}, {}, {}, {}], correct: 0, explain: { ar: "", fr: "" } };
  const opts = [0, 1, 2, 3]
    .map((i) => {
      const o = q.options[i] || {};
      return `
      <div class="opt-row">
        <input type="radio" class="f-correct" name="c-__ID__" value="${i}"${q.correct === i ? " checked" : ""} title="الجواب الصحيح" />
        <input class="f-opt-ar" type="text" placeholder="خيار ${i + 1} (ع)" value="${escAttr(o.ar || "")}" />
        <input class="f-opt-fr" type="text" placeholder="Option ${i + 1}" value="${escAttr(o.fr || "")}" />
      </div>`;
    })
    .join("");
  return `
  <div class="repeat-item" data-kind="quiz">
    <button type="button" class="remove-btn" title="حذف">×</button>
    <div class="form-row">
      <div class="form-group"><label>السؤال (ع)</label><input class="f-q-ar" type="text" value="${escAttr(q.q.ar)}" /></div>
      <div class="form-group"><label>Question (fr)</label><input class="f-q-fr" type="text" value="${escAttr(q.q.fr)}" /></div>
    </div>
    <label class="opt-legend">الخيارات (اختر الصحيح):</label>
    <div class="opt-list">${opts}</div>
    <div class="form-row">
      <div class="form-group"><label>التعليل (ع)</label><input class="f-exp-ar" type="text" value="${escAttr(q.explain.ar)}" /></div>
      <div class="form-group"><label>Explication (fr)</label><input class="f-exp-fr" type="text" value="${escAttr(q.explain.fr)}" /></div>
    </div>
  </div>`;
}
function addQuiz(value) {
  quizList.insertAdjacentHTML("beforeend", quizRowHTML(value));
  const row = quizList.lastElementChild;
  row.querySelectorAll('input[name^="c-"]').forEach((r) => (r.name = "c-" + Math.random().toString(36).slice(2)));
  onChange();
}
quizList.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) { e.target.closest(".repeat-item").remove(); onChange(); }
});
quizList.addEventListener("input", onChange);
document.querySelector('[data-add="quiz"]').addEventListener("click", () => addQuiz());

function collectQuiz() {
  return [...quizList.children]
    .map((r) => {
      const opts = [...r.querySelectorAll(".opt-row")].map((o) => ({
        ar: o.querySelector(".f-opt-ar").value.trim(), fr: o.querySelector(".f-opt-fr").value.trim(),
      }));
      const c = r.querySelector(".f-correct:checked");
      return {
        q: { ar: r.querySelector(".f-q-ar").value.trim(), fr: r.querySelector(".f-q-fr").value.trim() },
        options: opts, correct: c ? parseInt(c.value) : 0,
        explain: { ar: r.querySelector(".f-exp-ar").value.trim(), fr: r.querySelector(".f-exp-fr").value.trim() },
      };
    })
    .filter((q) => q.q.ar || q.q.fr);
}

/* ── تبويبات اللغة ───────────────────────────────────────────────────────── */
document.querySelectorAll(".lang-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".lang-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".lang-content").forEach((c) => (c.hidden = true));
    tab.classList.add("active");
    document.querySelector(`.lang-content[data-lang="${tab.dataset.lang}"]`).hidden = false;
  });
});

/* ── توليد المخرجات ─────────────────────────────────────────────────────── */
function buildOutputs(silent) {
  const id = $("lessonId").value.trim();
  const level = levelSel.value;
  const unit = selectedUnit();
  const branch = $("lessonBranch").value;
  const thumb = $("lessonThumb").value;
  const duration = parseInt($("lessonDuration").value) || 0;

  if (!silent) {
    const miss = [];
    if (!id) miss.push("المعرّف");
    if (!level) miss.push("المستوى");
    if (!unit.ar) miss.push("الوحدة");
    if (!branch) miss.push("الفرع");
    if (!thumb) miss.push("الخطاطة");
    if (!duration) miss.push("المدّة");
    if (!$("titleAr").value.trim()) miss.push("العنوان (ع)");
    if (!$("bodyAr").value.trim()) miss.push("المحتوى (ع)");
    if (miss.length) { alert("⚠️ أكمل: \n\n• " + miss.join("\n• ")); return null; }
  }

  const quiz = collectQuiz();
  const hasVideo = !!($("videoTitleAr").value.trim() || $("videoLength").value.trim());
  const order = $("lessonOrder").value !== "" ? parseInt($("lessonOrder").value) : 0;

  const meta = {
    id, slug: id, subject: "svt", level, unitNum: unit.num,
    unit: { ar: unit.ar, fr: unit.fr }, order, branch, thumbnail: thumb, duration,
    status: "published",
    title: { ar: $("titleAr").value.trim(), fr: $("titleFr").value.trim() },
    desc: { ar: $("descAr").value.trim(), fr: $("descFr").value.trim() },
  };
  if (hasVideo) {
    meta.video = {
      title: { ar: $("videoTitleAr").value.trim(), fr: $("videoTitleFr").value.trim() },
      length: $("videoLength").value.trim(),
    };
  }
  meta.quiz = quiz;
  meta.attachments = [];
  meta.tags = [];
  meta.keywords = [];
  meta.createdAt = TODAY;
  meta.updatedAt = TODAY;

  const indexEntry = {
    id, level, unitNum: unit.num, unit: { ar: unit.ar, fr: unit.fr }, order,
    branch, thumbnail: thumb, duration, hasVideo, quizCount: quiz.length,
    title: meta.title, desc: meta.desc,
  };

  const arHtml = ($("bodyAr").value.trim() || "") + "\n";
  const frHtml = ($("bodyFr").value.trim() || "") + "\n";

  return { id, level, meta, arHtml, frHtml, indexEntry };
}

/* ── المعاينة ───────────────────────────────────────────────────────────── */
function updatePreview() {
  const titleAr = $("titleAr").value;
  if (!titleAr && !$("titleFr").value) {
    previewContent.innerHTML = '<div class="preview-placeholder"><p>👈 أدخل عنوان الدرس</p></div>';
    return;
  }
  const unit = selectedUnit();
  previewContent.innerHTML = `
    <div class="preview-lesson">
      <div class="preview-unit">${escHtml(unit.ar || "")}</div>
      <h1 class="preview-title">${escHtml(titleAr || $("titleFr").value)}</h1>
      <p class="preview-desc">${escHtml($("descAr").value || "")}</p>
      <div class="preview-intro">${$("bodyAr").value || "<p class='muted'>— لا محتوى بعد —</p>"}</div>
      <div class="preview-meta"><span class="chip">📝 ${collectQuiz().length} سؤال</span></div>
    </div>`;
}

/* ── الحفظ والاستعادة ───────────────────────────────────────────────────── */
function draftData() {
  const u = selectedUnit();
  return {
    lessonId: $("lessonId").value, lessonLevel: levelSel.value, unitAr: u.ar,
    lessonBranch: $("lessonBranch").value, lessonThumb: $("lessonThumb").value,
    lessonDuration: $("lessonDuration").value, lessonOrder: $("lessonOrder").value,
    titleAr: $("titleAr").value, titleFr: $("titleFr").value,
    descAr: $("descAr").value, descFr: $("descFr").value,
    videoTitleAr: $("videoTitleAr").value, videoTitleFr: $("videoTitleFr").value,
    videoLength: $("videoLength").value, bodyAr: $("bodyAr").value, bodyFr: $("bodyFr").value,
    quiz: collectQuiz(),
  };
}
function saveDraft() { localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData())); }
function restoreDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    $("lessonId").value = d.lessonId || "";
    levelSel.value = d.lessonLevel || "";
    populateUnits(d.unitAr);
    $("lessonBranch").value = d.lessonBranch || "";
    $("lessonThumb").value = d.lessonThumb || "";
    $("lessonDuration").value = d.lessonDuration || "";
    $("lessonOrder").value = d.lessonOrder || "";
    $("titleAr").value = d.titleAr || ""; $("titleFr").value = d.titleFr || "";
    $("descAr").value = d.descAr || ""; $("descFr").value = d.descFr || "";
    $("videoTitleAr").value = d.videoTitleAr || ""; $("videoTitleFr").value = d.videoTitleFr || "";
    $("videoLength").value = d.videoLength || "";
    $("bodyAr").value = d.bodyAr || ""; $("bodyFr").value = d.bodyFr || "";
    (d.quiz || []).forEach((q) => addQuiz(q));
  } catch (e) { console.error(e); }
}

/* ── الأحداث العامّة ─────────────────────────────────────────────────────── */
function onChange() { saveDraft(); updatePreview(); }
form.addEventListener("input", onChange);
levelSel.addEventListener("change", () => { populateUnits(); onChange(); });
unitSel.addEventListener("change", onChange);

const show = (m) => (m.hidden = false);
const hide = (m) => (m.hidden = true);
$("saveDraft").addEventListener("click", () => { saveDraft(); show(saveModal); });
$("closeSaveModal").addEventListener("click", () => hide(saveModal));
$("closeSaveBtn").addEventListener("click", () => hide(saveModal));
$("closeModal").addEventListener("click", () => hide(exportModal));
[exportModal, saveModal].forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) hide(m); }));

$("exportJSON").addEventListener("click", () => {
  const out = buildOutputs();
  if (!out) return;
  $("outMeta").value = JSON.stringify(out.meta, null, 2);
  $("outAr").value = out.arHtml;
  $("outFr").value = out.frHtml;
  $("outIndex").value = JSON.stringify(out.indexEntry, null, 2);
  $("pathMeta").textContent = `data/lessons/${out.id}/meta.json`;
  $("pathAr").textContent = `data/lessons/${out.id}/ar.html`;
  $("pathFr").textContent = `data/lessons/${out.id}/fr.html`;
  $("exportHint").innerHTML = `أنشئ المجلّد <code>data/lessons/${escHtml(out.id)}/</code> وضع فيه الملفات الثلاثة، ثم أضِف مدخلة الفهرس.`;
  show(exportModal);
});

// نسخ / تحميل لكل مخرج
exportModal.addEventListener("click", (e) => {
  const copyId = e.target.getAttribute("data-copy");
  const dlId = e.target.getAttribute("data-dl");
  if (copyId) {
    const ta = $(copyId); ta.select(); document.execCommand("copy");
    e.target.textContent = "✓"; setTimeout(() => (e.target.textContent = "نسخ"), 1200);
  }
  if (dlId) {
    const name = dlId === "outMeta" ? "meta.json" : dlId === "outAr" ? "ar.html" : "fr.html";
    const type = dlId === "outMeta" ? "application/json" : "text/html";
    const blob = new Blob([$(dlId).value], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }
});

$("clearForm").addEventListener("click", () => {
  if (!confirm("⚠️ سيُحذف كل ما كتبته. متابعة؟")) return;
  form.reset(); quizList.innerHTML = ""; localStorage.removeItem(STORAGE_KEY);
  populateUnits();
  previewContent.innerHTML = '<div class="preview-placeholder"><p>👈 ابدأ درساً جديداً</p></div>';
});

/* ── مساعدات الهروب ─────────────────────────────────────────────────────── */
function escAttr(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── الإقلاع ─────────────────────────────────────────────────────────────── */
(async function init() {
  await loadLevels();
  restoreDraft();
  updatePreview();
})();
window.addEventListener("beforeunload", saveDraft);
