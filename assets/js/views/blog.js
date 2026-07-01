/**
 * Nova SVT — المدونة (Blog)
 * ----------------------------------------------------------------------------
 * قائمة منشورات (أخبار، توجيهات للتلاميذ، إعلانات) مصدرها data/blog.json.
 * كل صفحات العرض تفترض أن المحتوى مُحمَّل مسبقاً عبر loadContent() في main.js،
 * لذا لا يوجد هنا أي جلب شبكي — فقط عرض تزامني كبقية الصفحات.
 */

import { t, ui } from "../core/i18n.js";
import { getPosts } from "../core/content.js";
import { getLang } from "../core/state.js";
import { app, esc } from "../core/dom.js";

/** يترجم مفتاح صنف المنشور (خبر/توجيه/إعلان) إلى صنف "دتاق" لونيّ موجود مسبقاً. */
const TAG_CLASS = { news: "lvl", guide: "unit", announcement: "subj" };
const TAG_LABEL = { news: "tag_news", guide: "tag_guide", announcement: "tag_announcement" };

const DATE_LOCALE = { ar: "ar-MA", fr: "fr-FR" };

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(DATE_LOCALE[getLang()] || "ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function postCardHTML(post) {
  const cls = TAG_CLASS[post.tag] || "unit";
  const label = TAG_LABEL[post.tag] ? ui(TAG_LABEL[post.tag]) : "";
  const body = Array.isArray(post.body) ? post.body : [];

  return `
  <article class="post-card">
    <div class="post-meta">
      <span class="dtag ${cls}">${esc(label)}</span>
      <time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time>
    </div>
    <h3>${esc(t(post.title))}</h3>
    <div class="prose">
      ${body.map((p) => `<p>${t(p)}</p>`).join("")}
    </div>
  </article>`;
}

export function renderBlog() {
  const posts = getPosts();

  app().innerHTML = `
  <section class="section" style="padding-bottom:0">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">${ui("blog_eyebrow")}</span>
        <h2>${ui("blog_title")}</h2>
        <p>${ui("blog_lead")}</p>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="wrap">
      ${
        posts.length
          ? `<div class="post-grid">${posts.map(postCardHTML).join("")}</div>`
          : `<div class="empty"><p>${esc(ui("blog_empty"))}</p></div>`
      }
    </div>
  </section>`;
}
