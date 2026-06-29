/**
 * Nova SVT — غلاف التخزين المحلي (LocalStorage)
 * ----------------------------------------------------------------------------
 * طبقة رقيقة وآمنة فوق localStorage. كل العمليات محميّة بـ try/catch حتى لا
 * تنهار المنصة إذا كان التخزين معطّلاً (تصفّح خاص، أذونات، أو تجاوز الحصة).
 * هذه الوحدة عامّة ولا تعرف بمفاتيح المنصة — المفاتيح تأتي من config.js.
 */

/** هل التخزين المحلي متاح وقابل للكتابة فعلاً؟ (يُفحص مرّة ويُخزَّن الناتج) */
let _available = null;

export function isAvailable() {
  if (_available !== null) return _available;
  try {
    const probe = "__nova_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    _available = true;
  } catch {
    _available = false;
  }
  return _available;
}

/* ── قيم نصّية ──────────────────────────────────────────────────────────── */

/** يقرأ نصّاً مخزّناً، أو يعيد القيمة الافتراضية إن لم يوجد أو فشل. */
export function get(key, fallback = null) {
  if (!isAvailable()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

/** يخزّن نصّاً. يعيد true عند النجاح. */
export function set(key, value) {
  if (!isAvailable()) return false;
  try {
    window.localStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

/** يحذف مفتاحاً. */
export function remove(key) {
  if (!isAvailable()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/* ── قيم JSON ───────────────────────────────────────────────────────────── */

/** يقرأ كائناً مخزّناً بصيغة JSON، أو يعيد الافتراضي إن لم يوجد أو تعذّر تحليله. */
export function getJSON(key, fallback = null) {
  const raw = get(key, null);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** يخزّن كائناً بصيغة JSON. يعيد true عند النجاح. */
export function setJSON(key, value) {
  try {
    return set(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
