/**
 * Nova SVT — التحميلات (Downloads)
 * ----------------------------------------------------------------------------
 * أدوات تصدير حقيقية تعمل بالكامل في المتصفّح دون خادم:
 *   downloadSummary(lesson) → ملخّص الدرس وأسئلته كملف نصّي (.txt).
 *   downloadFigure(key, name) → تصدير خطاطة SVG كصورة PNG عبر canvas.
 * تعرض تنبيهاً عند بدء التحميل، وتتعامل مع الأخطاء بهدوء.
 */

import { showToast } from "./toast.js";
import { t, ui } from "../core/i18n.js";
import { figFor } from "../core/icons.js";

/** ينزّل نصّاً كملف عبر رابط مؤقّت (Blob)، ثم ينظّف الموارد. */
export function blobDownload(filename, text) {
  try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
    showToast(ui("toast_dl"));
  } catch {
    showToast(ui("toast_dl"));
  }
}

/** يبني ملخّصاً نصّياً للدرس (مقدّمة + أسئلة بإجاباتها وشروحها) وينزّله. */
export function downloadSummary(lesson) {
  if (!lesson) return;
  const strip = (s) => String(s).replace(/<[^>]+>/g, "");

  let out = "Nova SVT — " + t(lesson.title) + "\n";
  out += t(lesson.unit) + "\n" + "=".repeat(40) + "\n\n";

  (lesson.intro || []).forEach((p) => {
    out += strip(t(p)) + "\n\n";
  });

  out += "— " + ui("toc_quiz") + " —\n\n";
  (lesson.quiz || []).forEach((q, i) => {
    out += i + 1 + ". " + t(q.q) + "\n";
    q.options.forEach((o, j) => {
      out += "   " + String.fromCharCode(97 + j) + ") " + t(o) + (j === q.correct ? "  ✓" : "") + "\n";
    });
    out += "   → " + t(q.explain) + "\n\n";
  });

  out += "\nNova SVT\n";
  blobDownload("NovaSVT_" + lesson.id + ".txt", out);
}

/** يحوّل خطاطة SVG إلى صورة PNG (800×480) عبر canvas وينزّلها. */
export function downloadFigure(figKey, filename) {
  try {
    const svgStr = figFor(figKey).replace(
      'class="diagram"',
      'xmlns="http://www.w3.org/2000/svg" width="800" height="480" style="background:#0C1A13"'
    );
    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0C1A13";
      ctx.fillRect(0, 0, 800, 480);
      ctx.drawImage(img, 0, 0, 800, 480);
      URL.revokeObjectURL(url);

      canvas.toBlob(function (out) {
        const outUrl = URL.createObjectURL(out);
        const a = document.createElement("a");
        a.href = outUrl;
        a.download = filename + ".png";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(outUrl);
          a.remove();
        }, 100);
        showToast(ui("toast_dl"));
      });
    };
    img.onerror = function () {
      showToast(ui("toast_dl"));
    };
    img.src = url;
  } catch {
    showToast(ui("toast_dl"));
  }
}
