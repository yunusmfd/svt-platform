/**
 * Nova SVT — محرّك الاختبار (Quiz)
 * ----------------------------------------------------------------------------
 * يعرض أسئلة الدرس مع تصحيح فوري وشرح بعد كل إجابة، ثم نتيجة نهائية بحلقة
 * تقدّم. يحفظ النتيجة وأفضل علامة محلياً (LocalStorage) لكل درس، ويعرض أفضل
 * نتيجة محقّقة.
 *
 * يُركَّب عبر mountQuiz(lesson) من صفحة الدرس. لا يُصفَّر التقدّم إلا عند تغيّر
 * الدرس، حتى لا يضيع عند تبديل اللغة (الذي يعيد بناء الصفحة).
 */

import { t, ui } from "../core/i18n.js";
import { svg } from "../core/icons.js";
import { getQuiz, setQuiz, resetQuiz } from "../core/state.js";
import { STORAGE_KEYS } from "../core/config.js";
import { getJSON, setJSON } from "../core/storage.js";
import { esc, announce } from "../core/dom.js";

/** الدرس الذي تخصّه حالة الاختبار حالياً (لتصفير التقدّم عند تغيّر الدرس فقط). */
let activeLessonId = null;

const host = () => document.getElementById("quizInner");
const storageKey = (lessonId) => STORAGE_KEYS.quizPrefix + lessonId;

/** نقطة الدخول: تُصفّر التقدّم إن تغيّر الدرس ثم تعرض الاختبار. */
export function mountQuiz(lesson) {
  if (!lesson) return;
  if (lesson.id !== activeLessonId) {
    resetQuiz();
    activeLessonId = lesson.id;
  }
  render(lesson);
}

/** يوجّه العرض إلى السؤال الحالي أو إلى شاشة النتيجة. */
function render(lesson) {
  const el = host();
  if (!el) return;

  const quiz = lesson.quiz || [];
  if (quiz.length === 0) {
    el.innerHTML = `<p class="qsub">${ui("quiz_sub")}</p>`;
    return;
  }

  if (getQuiz().finished) renderResult(el, lesson);
  else renderQuestion(el, lesson, quiz);
}

/* ── عرض سؤال ───────────────────────────────────────────────────────────── */
function renderQuestion(el, lesson, quiz) {
  const state = getQuiz();
  const total = quiz.length;
  const current = quiz[state.index];
  const pct = Math.round((state.index / total) * 100);

  const options = current.options
    .map((option, i) => {
      let cls = "qopt";
      let marker = `<span class="marker">${String.fromCharCode(65 + i)}</span>`;
      if (state.answered) {
        if (i === current.correct) {
          cls += " correct";
          marker = `<span class="marker">${svg("check")}</span>`;
        } else if (i === state.picked) {
          cls += " wrong";
          marker = `<span class="marker">${svg("x")}</span>`;
        } else {
          cls += " dim";
        }
      }
      const disabled = state.answered ? "disabled" : "";
      return `<button class="${cls}" data-opt="${i}" ${disabled}><span>${esc(
        t(option)
      )}</span>${marker}</button>`;
    })
    .join("");

  let explain = "";
  if (state.answered) {
    const good = state.picked === current.correct;
    explain = `
      <div class="qexplain ${good ? "" : "bad"}">
        <span class="qe-ico">${svg(good ? "check" : "spark")}</span>
        <div>
          <span class="qe-t">${good ? ui("quiz_correct") : ui("quiz_wrong")}</span>
          <p>${esc(t(current.explain))}</p>
        </div>
      </div>`;
  }

  const isLast = state.index === total - 1;
  const foot = state.answered
    ? `<div class="quiz-foot"><button class="btn btn-primary" id="quizNext">${
        isLast ? ui("quiz_finish") : ui("quiz_next")
      } ${svg("arrow")}</button></div>`
    : "";

  el.innerHTML = `
    <div class="quiz-head">
      <div><h3>${ui("quiz_title")}</h3><p class="qsub">${ui("quiz_sub")}</p></div>
      <div class="quiz-prog">
        <span class="qcount">${ui("quiz_q")} ${state.index + 1} ${ui("quiz_of")} ${total}</span>
        <div class="pbar"><div class="pfill" style="width:${pct}%"></div></div>
      </div>
    </div>
    <div class="qquestion">${esc(t(current.q))}</div>
    <div class="qoptions">${options}</div>
    ${explain}
    ${foot}`;

  el.querySelectorAll(".qopt:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(lesson, Number(btn.dataset.opt)));
  });
  el.querySelector("#quizNext")?.addEventListener("click", () => handleNext(lesson, quiz));
}

/* ── المنطق ─────────────────────────────────────────────────────────────── */
function handleAnswer(lesson, index) {
  const state = getQuiz();
  if (state.answered) return;
  const current = lesson.quiz[state.index];
  const good = index === current.correct;

  const patch = { answered: true, picked: index };
  if (good) patch.score = state.score + 1;
  setQuiz(patch);

  render(lesson);

  // إعلان النتيجة لقارئات الشاشة + نقل التركيز إلى زر المتابعة
  announce(`${good ? ui("quiz_correct") : ui("quiz_wrong")}. ${t(current.explain)}`);
  document.getElementById("quizNext")?.focus();
}

function handleNext(lesson, quiz) {
  const state = getQuiz();
  if (state.index >= quiz.length - 1) {
    setQuiz({ finished: true });
    saveResult(lesson, getQuiz().score, quiz.length);
  } else {
    setQuiz({ index: state.index + 1, answered: false, picked: null });
  }
  render(lesson);
}

function handleRetry(lesson) {
  resetQuiz();
  render(lesson);
}

/** يحفظ آخر نتيجة وأفضل علامة محلياً (مرّة واحدة عند إنهاء الاختبار). */
function saveResult(lesson, score, total) {
  const pct = Math.round((score / total) * 100);
  const previous = getJSON(storageKey(lesson.id), null);
  const best =
    previous && typeof previous.best === "number" ? Math.max(previous.best, pct) : pct;
  setJSON(storageKey(lesson.id), {
    best,
    last: { score, total, pct, at: new Date().toISOString() },
  });
}

/* ── شاشة النتيجة ───────────────────────────────────────────────────────── */
function renderResult(el, lesson) {
  const total = lesson.quiz.length;
  const score = getQuiz().score;
  const pct = Math.round((score / total) * 100);

  const R = 78;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);

  let tier;
  let head;
  if (pct >= 80) {
    tier = ui("res_excellent");
    head = ui("res_h_ex");
  } else if (pct >= 50) {
    tier = ui("res_good");
    head = ui("res_h_good");
  } else {
    tier = ui("res_keep");
    head = ui("res_h_keep");
  }
  const msg = ui("res_msg").replace("%s", score).replace("%s", total);

  const saved = getJSON(storageKey(lesson.id), null);
  const best = saved && typeof saved.best === "number" ? saved.best : pct;

  el.innerHTML = `
    <div class="qresult">
      <div class="ring-wrap">
        <svg viewBox="0 0 180 180">
          <circle class="ring-bg" cx="90" cy="90" r="${R}"></circle>
          <circle class="ring-fg" cx="90" cy="90" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}" id="ringFg"></circle>
        </svg>
        <div class="ring-center"><span class="pct">${pct}%</span><span class="pl">${tier}</span></div>
      </div>
      <h3>${head}</h3>
      <p class="rmsg">${msg}</p>
      <p class="mono" style="color:var(--sage);font-size:.85rem;margin-bottom:22px">${ui("res_best")}: ${best}%</p>
      <div class="qresult-actions">
        <button class="btn btn-primary" id="quizRetry">${svg("refresh")}${ui("res_retry")}</button>
        <a class="btn btn-ghost" href="#/lessons/${lesson.level}">${ui("res_next")}</a>
      </div>
    </div>`;

  el.querySelector("#quizRetry")?.addEventListener("click", () => handleRetry(lesson));
  requestAnimationFrame(() => {
    const ring = document.getElementById("ringFg");
    if (ring) ring.style.strokeDashoffset = offset;
  });
}
