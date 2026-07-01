/**
 * Nova SVT — المدونة (Blog)
 * ----------------------------------------------------------------------------
 * قائمة منشورات مصدرها الفهرس الوصفي data/blog.json (عنوان، تاريخ، صنف،
 * مقتطف). محتوى كل مقال بالكامل يعيش في ملفّه HTML الخاص به
 * (data/blog/{id}.{lang}.html)، ويُجلب عند فتح صفحة المقال فقط — وليس عند
 * تحميل القائمة — كي يبقى كل مقال مستقلاً بملفّه الخاص.
 */

import { t, ui } from "../core/i18n.js";
import { getPosts, findPost } from "../core/content.js";
import { getLang, getBlogId } from "../core/state.js";
import { blogBodyUrl } from "../core/config.js";
import { go } from "../core/router.js";
import { app, esc } from "../core/dom.js";
import { svg } from "../core/icons.js";

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

function tagPill(post) {
  const cls = TAG_CLASS[post.tag] || "unit";
  const label = TAG_LABEL[post.tag] ? ui(TAG_LABEL[post.tag]) : "";
  return `<span class="dtag ${cls}">${esc(label)}</span>`;
}

function postCardHTML(post) {
  return `
  <article class="post-card">
    <div class="post-meta">
      ${tagPill(post)}
      <time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time>
    </div>
    <h3><a href="#/blog/${esc(post.id)}">${esc(t(post.title))}</a></h3>
    <p>${esc(t(post.excerpt))}</p>
    <a class="post-more" href="#/blog/${esc(post.id)}">${ui("blog_read_more")}${svg("arrow")}</a>
  </article>`;
}

/** بوّابة المدونة: قائمة بطاقات منفصلة، كل بطاقة تفتح ملفّ مقالها الخاص. */
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

/** يجلب محتوى ملفّ المقال بلغة الواجهة الحالية، مع نسخة احتياطية بالعربية. */
async function fetchPostBody(postId, lang) {
  const tryLangs = lang === "ar" ? ["ar"] : [lang, "ar"];
  for (const l of tryLangs) {
    try {
      const res = await fetch(blogBodyUrl(postId, l));
      if (res.ok) return await res.text();
    } catch {
      /* نجرّب اللغة التالية */
    }
  }
  return `<p>${esc(ui("post_missing"))}</p>`;
}

/** صفحة مقال واحد: تُبنى فوراً برأس المقال، ثم يُحقن محتواه بعد جلب ملفّه. */
export async function renderBlogPost() {
  const post = findPost(getBlogId());
  if (!post) {
    go("blog");
    return;
  }

  app().innerHTML = `
  <section class="section">
    <div class="wrap" style="max-width:760px">
      <a class="back-link" href="#/blog">${svg("arrow")}${ui("back_blog")}</a>
      <div class="detail-tags">${tagPill(post)}</div>
      <h1>${esc(t(post.title))}</h1>
      <div class="detail-meta">
        <time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time>
      </div>
      <div class="prose" id="postBody"><p>${esc(ui("post_loading"))}</p></div>
    </div>
  </section>`;

  const lang = getLang();
  const html = await fetchPostBody(post.id, lang);

  // إن غيّر المستخدم اللغة أو الصفحة أثناء الجلب، تجاهل النتيجة القديمة.
  if (getBlogId() !== post.id) return;
  const bodyEl = document.getElementById("postBody");
  if (bodyEl) bodyEl.innerHTML = html;
}
