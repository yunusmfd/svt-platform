/**
 * Nova SVT — القائمة الجانبية للهاتف (Drawer)
 * ----------------------------------------------------------------------------
 * تفتح/تغلق قائمة التنقّل على الشاشات الصغيرة. تدير إتاحة الوصول:
 * السمة aria-hidden، وaria-expanded على زر القائمة، وإغلاقها بمفتاح Escape
 * أو بالنقر على الستار أو أحد روابطها، مع إعادة التركيز إلى زر القائمة.
 */

const getDrawer = () => document.getElementById("drawer");
const getMenuBtn = () => document.getElementById("menuBtn");

/** يفتح القائمة وينقل التركيز إلى أول رابط فيها. */
export function openDrawer() {
  const drawer = getDrawer();
  if (!drawer) return;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  getMenuBtn()?.setAttribute("aria-expanded", "true");
  drawer.querySelector(".nav-link")?.focus();
}

/** يغلق القائمة ويعيد التركيز إلى زر القائمة. */
export function closeDrawer() {
  const drawer = getDrawer();
  if (!drawer) return;
  if (!drawer.classList.contains("open")) return;
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  const btn = getMenuBtn();
  btn?.setAttribute("aria-expanded", "false");
  btn?.focus();
}

/** يربط زر الفتح، وعناصر الإغلاق ([data-drawer-close])، ومفتاح Escape. */
export function initDrawer() {
  getMenuBtn()?.addEventListener("click", openDrawer);

  getDrawer()
    ?.querySelectorAll("[data-drawer-close]")
    .forEach((el) => el.addEventListener("click", closeDrawer));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}
