/**
 * Nova SVT — الأيقونات والخطاطات (SVG)
 * ----------------------------------------------------------------------------
 * مكتبة أيقونات خطّية موحّدة + شعار المنصة + خطاطات علمية محايدة اللغة.
 *   svg(name, cls)     → أيقونة خطّية (stroke).
 *   fillIcon(name, cls)→ أيقونة ممتلئة (fill).
 *   LOGO               → شعار المنصة.
 *   figFor(key)        → خطاطة علمية حسب المفتاح (افتراضها: الخلية).
 * كلها دوال نقيّة تعيد نصوص SVG؛ لا اعتماديات ولا تأثير جانبي.
 */

/* ── مسارات الأيقونات الخطّية (محتوى <svg> فقط) ──────────────────────────── */
export const ICONS = {
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  chevR: '<polyline points="9 6 15 12 9 18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><polygon points="22 7 16 11 22 15 22 7"/>',
  quiz: '<path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5"/><line x1="12" y1="17.5" x2="12" y2="17.5"/><circle cx="12" cy="12" r="10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.8-6.4 8-8"/>',
  globe2: '<circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M12 3a14 14 0 0 0 0 18"/>',
  flask: '<path d="M9 2v6l-6 10.5A2 2 0 0 0 4.7 22h14.6a2 2 0 0 0 1.7-3.5L15 8V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="6.5" y1="15" x2="17.5" y2="15"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><polyline points="21 3 21 9 15 9"/>',
  spark: '<path d="M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
  layers: '<polygon points="12 2 22 8.5 12 15 2 8.5 12 2"/><polyline points="2 15.5 12 22 22 15.5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="8" y1="11" x2="14" y2="11"/>',
  camera: '<path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  teacher: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  free: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="6" x2="12" y2="18"/><path d="M15 9.5C15 8 13.7 7.2 12 7.2S9 8 9 9.4c0 3 6 1.6 6 4.8 0 1.4-1.3 2.4-3 2.4s-3-1-3-2.4"/>',
  flag: '<path d="M4 21V4h13l-2 4 2 4H6"/><line x1="4" y1="4" x2="4" y2="21"/>',
  device: '<rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  assign: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5"/><line x1="12" y1="13" x2="12" y2="21"/>',
  // أيقونتا المظهر (للزر الليلي) — أُضيفتا في النسخة المعمارية
  sun: '<circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.6" y1="4.6" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.4" y2="4.6"/>',
  moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z"/>',
};

/** يبني أيقونة خطّية (stroke = اللون الحالي). */
export function svg(name, cls = "") {
  return (
    '<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (ICONS[name] || "") +
    "</svg>"
  );
}

/** يبني أيقونة ممتلئة (fill = اللون الحالي). */
export function fillIcon(name, cls = "") {
  return (
    '<svg class="' + cls + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    (ICONS[name] || "") +
    "</svg>"
  );
}

/* ── شعار المنصة ────────────────────────────────────────────────────────── */
export const LOGO =
  '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true" style="width:100%;height:100%">' +
  '<circle cx="20" cy="20" r="17" stroke="#52B788" stroke-width="2.2"/>' +
  '<circle cx="20" cy="20" r="17" stroke="#C9A84C" stroke-width="1" stroke-dasharray="2 5" opacity=".6"/>' +
  '<g transform="translate(9.8 10.2) scale(0.85)" stroke="#52B788" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M6 18h8"/>' +
  '<path d="M3 22h18"/>' +
  '<path d="M14 22a7 7 0 1 0 0-14h-1"/>' +
  '<path d="M9 14h2"/>' +
  '<path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>' +
  '<path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>' +
  "</g>" +
  "</svg>";

/* ── الخطاطات العلمية (محايدة اللغة) ─────────────────────────────────────── */
export const FIGURES = {
  cell: '<svg class="diagram" viewBox="0 0 400 240" fill="none"><ellipse cx="200" cy="120" rx="150" ry="95" fill="#0f2a1d" stroke="#52B788" stroke-width="2.5"/><ellipse cx="200" cy="120" rx="150" ry="95" stroke="#9FE6BF" stroke-width="1" stroke-dasharray="3 6" opacity=".5"/><circle cx="175" cy="115" r="42" fill="#1E5C40" stroke="#9FE6BF" stroke-width="2"/><circle cx="168" cy="108" r="13" fill="#52B788"/><path d="M150 110q20-14 44-2t30 24" stroke="#B7E4C7" stroke-width="1.3" opacity=".6"/><ellipse cx="285" cy="95" rx="26" ry="13" fill="#2d694c" stroke="#52B788" stroke-width="1.5" transform="rotate(-20 285 95)"/><ellipse cx="270" cy="165" rx="22" ry="11" fill="#2d694c" stroke="#52B788" stroke-width="1.5" transform="rotate(25 270 165)"/><circle cx="135" cy="160" r="7" fill="#C9A84C" opacity=".85"/><circle cx="115" cy="135" r="5" fill="#C9A84C" opacity=".7"/><circle cx="240" cy="62" r="5" fill="#C9A84C" opacity=".7"/></svg>',
  dna: '<svg class="diagram" viewBox="0 0 400 240" fill="none"><g stroke-width="4" stroke-linecap="round"><path d="M150 20C110 60 110 100 150 120 190 140 190 180 150 220" stroke="#52B788"/><path d="M250 20C290 60 290 100 250 120 210 140 210 180 250 220" stroke="#9FE6BF"/></g><g stroke="#C9A84C" stroke-width="2.4" stroke-linecap="round"><line x1="152" y1="40" x2="248" y2="40"/><line x1="138" y1="62" x2="262" y2="62"/><line x1="132" y1="86" x2="268" y2="86"/><line x1="140" y1="110" x2="260" y2="110"/><line x1="160" y1="134" x2="240" y2="134"/><line x1="138" y1="158" x2="262" y2="158"/><line x1="132" y1="182" x2="268" y2="182"/><line x1="150" y1="206" x2="250" y2="206"/></g><g fill="#B7E4C7"><circle cx="152" cy="40" r="5"/><circle cx="248" cy="40" r="5"/><circle cx="132" cy="86" r="5"/><circle cx="268" cy="86" r="5"/><circle cx="132" cy="182" r="5"/><circle cx="268" cy="182" r="5"/></g></svg>',
  tecto: '<svg class="diagram" viewBox="0 0 400 240" fill="none"><rect x="0" y="0" width="400" height="70" fill="#0a2238"/><rect x="0" y="70" width="400" height="170" fill="#1a120a"/><path d="M0 70 L150 70 L200 130 L100 130 Z" fill="#2d694c" stroke="#52B788" stroke-width="2"/><path d="M200 130 L150 70 L400 70 L400 110 Z" fill="#1E5C40" stroke="#9FE6BF" stroke-width="2"/><path d="M100 130 Q120 175 160 200" stroke="#52B788" stroke-width="2" stroke-dasharray="4 4"/><ellipse cx="150" cy="205" rx="55" ry="26" fill="#C9A84C" opacity=".7"/><ellipse cx="150" cy="205" rx="30" ry="14" fill="#E5A23C"/><path d="M150 180 q-6 -18 4 -34" stroke="#E5736B" stroke-width="3" stroke-linecap="round"/><path d="M250 64 l0 -22 m-10 12 l10 -12 l10 12" stroke="#9FE6BF" stroke-width="2" stroke-linecap="round"/><path d="M70 60 l-22 0 m12 -10 l-12 10 l12 10" stroke="#9FE6BF" stroke-width="2" stroke-linecap="round"/><path d="M180 55 l40 0 m-12 -10 l12 10 l-12 10" stroke="#52B788" stroke-width="2" stroke-linecap="round"/></svg>',
  gas: '<svg class="diagram" viewBox="0 0 400 240" fill="none"><circle cx="120" cy="120" r="68" fill="#0f2a1d" stroke="#52B788" stroke-width="2.5"/><circle cx="100" cy="100" r="20" fill="#1E5C40" stroke="#9FE6BF" stroke-width="1.4"/><circle cx="145" cy="105" r="16" fill="#1E5C40" stroke="#9FE6BF" stroke-width="1.4"/><circle cx="118" cy="145" r="18" fill="#1E5C40" stroke="#9FE6BF" stroke-width="1.4"/><rect x="262" y="70" width="58" height="100" rx="14" fill="#2a1414" stroke="#E5736B" stroke-width="2.5"/><circle cx="291" cy="100" r="9" fill="#E5736B"/><circle cx="291" cy="125" r="9" fill="#E5736B"/><circle cx="291" cy="150" r="9" fill="#E5736B"/><g stroke-width="3" stroke-linecap="round"><path d="M192 102 H252" stroke="#52B788"/><polygon points="252,102 244,97 244,107" fill="#52B788"/><path d="M252 150 H192" stroke="#C9A84C"/><polygon points="192,150 200,145 200,155" fill="#C9A84C"/></g><circle cx="220" cy="92" r="4" fill="#9FE6BF"/><circle cx="235" cy="92" r="4" fill="#9FE6BF"/><circle cx="218" cy="160" r="4" fill="#C9A84C"/><circle cx="233" cy="160" r="4" fill="#C9A84C"/></svg>',
  digest: '<svg class="diagram" viewBox="0 0 400 240" fill="none"><path d="M200 24 q-4 30 -2 46" stroke="#52B788" stroke-width="6" stroke-linecap="round"/><path d="M198 70 q40 6 36 50 q-4 40 -40 36 q-44 -4 -30 40" stroke="#9FE6BF" stroke-width="9" stroke-linecap="round" fill="none"/><ellipse cx="232" cy="100" rx="30" ry="24" fill="#1E5C40" stroke="#52B788" stroke-width="2.5"/><path d="M210 150 q-30 0 -34 30 q-3 26 24 30 q40 6 30 36" stroke="#2d694c" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="200" cy="40" r="9" fill="#C9A84C"/><circle cx="232" cy="100" r="8" fill="#C9A84C"/><circle cx="186" cy="182" r="8" fill="#C9A84C"/><circle cx="248" cy="200" r="8" fill="#C9A84C"/><path d="M252 100 h40 m-10 -8 l10 8 l-10 8" stroke="#B7E4C7" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>',
};

/** يعيد خطاطة علمية حسب المفتاح، أو خطاطة الخلية افتراضياً. */
export function figFor(key) {
  return FIGURES[key] || FIGURES.cell;
}

/**
 * يبني نمطاً مضمّناً لأيقونة ملوّنة من طيف التخصّصات: لون الأيقونة وخلفيتها
 * يُشتقّان من لون واحد عبر color-mix، فيتكيّفان تلقائياً مع الوضعين الفاتح
 * والليلي. على المتصفّحات القديمة التي لا تدعم color-mix يعود إلى الأخضر.
 * @param {string} token اسم متغيّر اللون، مثل "--spec-teal".
 */
export const specStyle = (token) =>
  `color:color-mix(in srgb, var(${token}) 78%, var(--text));` +
  `background:color-mix(in srgb, var(${token}) 15%, var(--surface))`;
