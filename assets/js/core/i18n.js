/**
 * Nova SVT — اللغة والترجمة (i18n)
 * ----------------------------------------------------------------------------
 * يضمّ قاموس نصوص الواجهة (عربي/فرنسي) ودوال الترجمة.
 *   t(entry)   → يترجم كائن محتوى ثنائي اللغة {ar, fr}.
 *   ui(key)    → يترجم نصّ واجهة عبر مفتاحه (يعيد المفتاح نفسه إن لم يوجد).
 *   applyI18n  → يملأ كل عناصر [data-i18n] في الصفحة ويضبط عنوانها.
 *   setLanguage→ يبدّل اللغة: الحالة + اتجاه الصفحة + العنوان + أزرار المبدّل.
 *
 * نصوص الدروس نفسها ليست هنا — هي في ملفات JSON (data/lessons).
 * هنا فقط نصوص واجهة الاستعمال (chrome) المرتبطة بالكود.
 */

import { SUPPORTED_LANGS, DEFAULT_LANG, LANG_DIR } from "./config.js";
import { getLang, setLang } from "./state.js";

/* ============================================================================
   قاموس نصوص الواجهة
   ========================================================================== */
const STRINGS = {
  /* وثيقة عامّة + إتاحة وصول */
  doc_title: { ar: "Nova SVT — منصة علوم الحياة والأرض", fr: "Nova SVT — Sciences de la Vie et de la Terre" },
  skip_to_content: { ar: "تجاوز إلى المحتوى", fr: "Aller au contenu" },

  /* التنقّل والتذييل */
  nav_home: { ar: "الرئيسية", fr: "Accueil" },
  nav_lessons: { ar: "الدروس", fr: "Cours" },
  nav_lab: { ar: "المختبر", fr: "Laboratoire" },
  nav_blog: { ar: "المدونة", fr: "Blog" },
  nav_about: { ar: "عن المنصة", fr: "À propos" },
  foot_about: { ar: "منصة رقمية مجانية لتعليم علوم الحياة والأرض بالمغرب، بفيديوهات وخطاطات وملفات واختبارات بتصحيح فوري — للإعدادي والثانوي.", fr: "Plateforme numérique gratuite pour l'enseignement des SVT au Maroc : vidéos, schémas, fichiers et quiz à correction immédiate — collège et lycée." },
  foot_explore: { ar: "تصفّح", fr: "Explorer" },
  foot_levels: { ar: "المستويات", fr: "Niveaux" },
  foot_college: { ar: "السلك الإعدادي", fr: "Collège" },
  foot_lycee: { ar: "الجذع المشترك", fr: "Tronc commun" },
  foot_bac: { ar: "السنة الثانية باك", fr: "2ème Bac" },
  foot_rights: { ar: "© 2026 Nova SVT — جميع الحقوق محفوظة.", fr: "© 2026 Nova SVT — Tous droits réservés." },
  foot_made: { ar: "صُنع بعناية لتلاميذ المغرب", fr: "Conçu avec soin pour les élèves du Maroc" },

  /* الواجهة (Hero) */
  hero_badge: { ar: "منصة تعليمية مجانية • المغرب", fr: "Plateforme éducative gratuite • Maroc" },
  hero_t1: { ar: "علوم الحياة", fr: "Sciences de la Vie" },
  hero_t2: { ar: "والأرض", fr: "et de la Terre" },
  hero_lead: { ar: "استكشف روعة الكائنات الحية وديناميّة كوكب الأرض عبر دروس تفاعلية، خطاطات علمية، واختبارات بتصحيح فوري — مصمَّمة وفق المنهاج المغربي للإعدادي والثانوي.", fr: "Explore le monde du vivant et la dynamique de la Terre à travers des cours interactifs, des schémas scientifiques et des quiz corrigés instantanément — conçus selon le programme marocain, collège et lycée." },
  hero_cta1: { ar: "ابدأ التعلّم", fr: "Commencer" },
  hero_cta2: { ar: "تصفّح الدروس", fr: "Voir les cours" },
  stat_levels: { ar: "مستويات دراسية", fr: "niveaux scolaires" },
  stat_lessons: { ar: "درساً تفاعلياً", fr: "cours interactifs" },
  stat_free: { ar: "مجاني بدون تسجيل", fr: "gratuit, sans inscription" },

  /* المميّزات */
  feat_eyebrow: { ar: "ماذا تقدّم المنصة", fr: "Ce que propose la plateforme" },
  feat_title: { ar: "كل ما تحتاجه للنجاح في مادة علوم الحياة والأرض", fr: "Tout pour réussir en SVT" },
  feat1_t: { ar: "فيديوهات شرح", fr: "Vidéos explicatives" },
  feat1_d: { ar: "دروس مرئية تبسّط المفاهيم العلمية المعقّدة خطوة بخطوة.", fr: "Des vidéos qui simplifient les notions complexes, étape par étape." },
  feat2_t: { ar: "خطاطات علمية", fr: "Schémas scientifiques" },
  feat2_d: { ar: "رسوم تخطيطية واضحة تنظّم المعلومات وتسهّل الحفظ والفهم.", fr: "Des schémas clairs qui organisent l'information et facilitent la mémorisation." },
  feat3_t: { ar: "اختبارات بتصحيح فوري", fr: "Quiz à correction immédiate" },
  feat3_d: { ar: "قِس فهمك مباشرة بعد كل سؤال مع تصحيح وشرح فوريَّيْن.", fr: "Évalue ta compréhension après chaque question, avec correction et explication immédiates." },
  feat4_t: { ar: "ملفات قابلة للتحميل", fr: "Fichiers téléchargeables" },
  feat4_d: { ar: "ملخصات وخطاطات جاهزة للتحميل والمراجعة في أي وقت.", fr: "Résumés et schémas prêts à télécharger pour réviser à tout moment." },

  /* مجالا الحياة/الأرض */
  dual_eyebrow: { ar: "مجالان، منهج واحد", fr: "Deux domaines, une discipline" },
  dual_title: { ar: "من الخلية الحيّة إلى صفائح الأرض", fr: "De la cellule vivante aux plaques terrestres" },
  dual_bio_tag: { ar: "علوم الحياة", fr: "Sciences de la Vie" },
  dual_bio_t: { ar: "البيولوجيا", fr: "La Biologie" },
  dual_bio_d: { ar: "التغذية، التنفس، الوراثة، المناعة والتواصل العصبي — فهمٌ عميق لآليات الحياة.", fr: "Nutrition, respiration, génétique, immunité et communication nerveuse — comprendre les mécanismes du vivant." },
  dual_geo_tag: { ar: "علوم الأرض", fr: "Sciences de la Terre" },
  dual_geo_t: { ar: "الجيولوجيا", fr: "La Géologie" },
  dual_geo_d: { ar: "تكتونية الصفائح، الدورة الرسوبية، الزلازل والبراكين — قراءةٌ لتاريخ كوكبنا.", fr: "Tectonique des plaques, cycle sédimentaire, séismes et volcans — lire l'histoire de notre planète." },
  dual_explore: { ar: "استكشف الدروس", fr: "Explorer les cours" },

  /* قسم الدروس المميّزة */
  feat_lessons_eyebrow: { ar: "ابدأ من هنا", fr: "Commence ici" },
  feat_lessons_title: { ar: "دروس مختارة", fr: "Cours en vedette" },
  feat_lessons_all: { ar: "كل الدروس", fr: "Tous les cours" },

  /* الشريط الدعائي */
  band_t: { ar: "بدون تسجيل. بدون اشتراك. بدون إعلانات.", fr: "Sans inscription. Sans abonnement. Sans publicité." },
  band_d: { ar: "كل المحتوى متاح مجاناً للجميع، في أي وقت ومن أي جهاز. تعليمٌ في متناول كل تلميذ مغربي.", fr: "Tout le contenu est gratuit, à tout moment et depuis n'importe quel appareil. Un enseignement à la portée de chaque élève marocain." },
  band_free: { ar: "مجاني للأبد", fr: "Gratuit pour toujours" },
  band_nosignup: { ar: "بلا حساب", fr: "Sans compte" },
  band_bilingual: { ar: "عربية / فرنسية", fr: "Arabe / Français" },
  band_device: { ar: "هاتف وحاسوب", fr: "Mobile et ordinateur" },

  /* دليل المستويات (#/lessons) */
  portal_title: { ar: "اختر مستواك الدراسي", fr: "Choisis ton niveau scolaire" },
  portal_lead: { ar: "تصفّح المستويات من الإعدادي إلى الباكالوريا، واختر مستواك لاستكشاف وحداته ودروسه.", fr: "Parcours les niveaux du collège au baccalauréat, et choisis le tien pour explorer ses unités et ses cours." },
  lvl_college: { ar: "السلك الإعدادي", fr: "Collège" },
  lvl_tc: { ar: "الجذع المشترك", fr: "Tronc commun" },
  lvl_bac1: { ar: "الأولى باكالوريا", fr: "1ère Bac" },
  lvl_bac2: { ar: "الثانية باكالوريا", fr: "2ème Bac" },
  level_units_count: { ar: "وحدة", fr: "unité(s)" },
  browse_units: { ar: "تصفّح الوحدات", fr: "Voir les unités" },
  unit_word: { ar: "الوحدة", fr: "Unité" },
  back_levels: { ar: "العودة إلى المستويات", fr: "Retour aux niveaux" },
  search_ph: { ar: "ابحث عن درس...", fr: "Rechercher un cours..." },
  lessons_count: { ar: "درس متاح", fr: "cours disponible(s)" },
  no_results: { ar: "لا توجد دروس مطابقة لبحثك.", fr: "Aucun cours ne correspond à votre recherche." },
  unit_empty: { ar: "الدروس قيد الإعداد لهذه الوحدة — ترقّبوها قريباً.", fr: "Les cours de cette unité sont en préparation — à venir bientôt." },
  level_empty: { ar: "المحتوى قيد الإعداد لهذا المستوى — ترقّبوها قريباً.", fr: "Le contenu de ce niveau est en préparation — à venir bientôt." },
  branch_bio: { ar: "حياة", fr: "Vie" },
  branch_geo: { ar: "أرض", fr: "Terre" },
  tag_video: { ar: "فيديو", fr: "Vidéo" },
  tag_quiz: { ar: "اختبار", fr: "Quiz" },
  min: { ar: "د", fr: "min" },
  questions: { ar: "سؤال", fr: "questions" },

  /* صفحة الدرس */
  back_lessons: { ar: "العودة إلى الدروس", fr: "Retour aux cours" },
  meta_duration: { ar: "مدة التعلّم", fr: "Durée" },
  meta_quiz: { ar: "سؤال تقييمي", fr: "questions" },
  meta_files: { ar: "ملفات مرفقة", fr: "fichiers joints" },
  toc_title: { ar: "محتويات الدرس", fr: "Sommaire" },
  toc_intro: { ar: "مقدّمة ومفاهيم", fr: "Introduction" },
  toc_video: { ar: "الشرح المرئي", fr: "Vidéo" },
  toc_figs: { ar: "الخطاطات العلمية", fr: "Schémas" },
  toc_dl: { ar: "الملفات", fr: "Fichiers" },
  toc_quiz: { ar: "اختبر معارفك", fr: "Quiz" },
  block_intro: { ar: "مقدّمة ومفاهيم أساسية", fr: "Introduction et notions clés" },
  block_video: { ar: "الشرح المرئي", fr: "Explication vidéo" },
  block_figs: { ar: "الخطاطات العلمية", fr: "Schémas scientifiques" },
  block_dl: { ar: "الملفات القابلة للتحميل", fr: "Fichiers à télécharger" },
  block_quiz: { ar: "اختبر معارفك", fr: "Teste tes connaissances" },
  video_note: { ar: "الفيديو نموذجي — يمكن للأستاذ ربط درسه الخاص هنا.", fr: "Vidéo de démonstration — l'enseignant peut relier sa propre vidéo ici." },
  dl_summary: { ar: "ملخّص الدرس", fr: "Résumé du cours" },
  dl_summary_s: { ar: "ملف نصي • تحميل", fr: "Fichier texte • télécharger" },
  dl_schema: { ar: "الخطاطة العلمية", fr: "Schéma scientifique" },
  dl_schema_s: { ar: "صورة PNG • تحميل", fr: "Image PNG • télécharger" },
  dl_exercises: { ar: "سلسلة تمارين", fr: "Série d'exercices" },
  dl_exercises_s: { ar: "ملف PDF • قريباً", fr: "Fichier PDF • bientôt" },
  fig_dl: { ar: "تحميل", fr: "PNG" },

  /* الاختبار والنتيجة */
  quiz_title: { ar: "اختبار الدرس", fr: "Quiz du cours" },
  quiz_sub: { ar: "تحقّق من استيعابك، مع تصحيح فوري بعد كل سؤال", fr: "Vérifie ta compréhension, avec correction immédiate" },
  quiz_q: { ar: "السؤال", fr: "Question" },
  quiz_of: { ar: "من", fr: "sur" },
  quiz_next: { ar: "السؤال التالي", fr: "Question suivante" },
  quiz_finish: { ar: "عرض النتيجة", fr: "Voir le résultat" },
  quiz_correct: { ar: "إجابة صحيحة", fr: "Bonne réponse" },
  quiz_wrong: { ar: "إجابة خاطئة", fr: "Réponse incorrecte" },
  res_excellent: { ar: "أداء ممتاز", fr: "Excellent" },
  res_good: { ar: "أداء جيّد", fr: "Bien" },
  res_keep: { ar: "واصل التمرّن", fr: "Continue" },
  res_h_ex: { ar: "عمل رائع!", fr: "Excellent travail !" },
  res_h_good: { ar: "نتيجة جيّدة!", fr: "Bon résultat !" },
  res_h_keep: { ar: "لا بأس، حاول مجدّداً", fr: "Pas grave, réessaie !" },
  res_msg: { ar: "أجبت بشكل صحيح عن %s من أصل %s. راجع المفاهيم ثم أعد المحاولة لترسيخ معارفك.", fr: "Tu as %s bonnes réponses sur %s. Revois les notions puis réessaie pour consolider tes acquis." },
  res_retry: { ar: "إعادة الاختبار", fr: "Recommencer" },
  res_next: { ar: "درس آخر", fr: "Autre cours" },
  res_best: { ar: "أفضل نتيجة", fr: "Meilleur score" },

  /* المختبر */
  lab_eyebrow: { ar: "معرض التجارب", fr: "Galerie d'expériences" },
  lab_title: { ar: "المختبر الافتراضي", fr: "Le laboratoire virtuel" },
  lab_lead: { ar: "تجارب علمية على شكل فيديوهات ورسوم متحركة وصفحات تفاعلية.", fr: "Des expériences scientifiques sous forme de vidéos, d'animations et de pages interactives." },
  exp_empty: { ar: "لا توجد تجارب منشورة بعد — ترقّبوها قريباً.", fr: "Aucune expérience publiée pour l'instant — à venir bientôt." },
  exp_type_video: { ar: "فيديو", fr: "Vidéo" },
  exp_type_animation: { ar: "رسم متحرك", fr: "Animation" },
  exp_type_interactive: { ar: "صفحة تفاعلية", fr: "Page interactive" },
  exp_soon: { ar: "سيُضاف محتوى هذه التجربة قريباً من طرف الأستاذ.", fr: "Le contenu de cette expérience sera ajouté prochainement par l'enseignant." },
  exp_open: { ar: "افتح التجربة", fr: "Ouvrir l'expérience" },
  exp_open_tab: { ar: "فتح في نافذة كاملة", fr: "Ouvrir en plein écran" },
  exp_loading: { ar: "…جارٍ تحميل التجربة", fr: "Chargement de l'expérience…" },
  back_lab: { ar: "العودة إلى المختبر", fr: "Retour au laboratoire" },

  /* المدونة */
  blog_eyebrow: { ar: "آخر المستجدات", fr: "Dernières nouvelles" },
  blog_title: { ar: "مدونة Nova SVT", fr: "Blog Nova SVT" },
  blog_lead: { ar: "أخبار المنصة، توجيهات للتلاميذ، وإعلانات مهمّة — في مكان واحد.", fr: "Actualités de la plateforme, conseils aux élèves et annonces importantes — au même endroit." },
  blog_empty: { ar: "لا توجد منشورات بعد — تابعونا قريباً.", fr: "Aucun article pour l'instant — revenez bientôt." },
  blog_read_more: { ar: "قراءة المقال", fr: "Lire l'article" },
  back_blog: { ar: "العودة إلى المدونة", fr: "Retour au blog" },
  post_loading: { ar: "…جارٍ تحميل المقال", fr: "Chargement de l'article…" },
  post_missing: { ar: "تعذّر تحميل محتوى هذا المقال.", fr: "Impossible de charger le contenu de cet article." },
  tag_news: { ar: "خبر", fr: "Actualité" },
  tag_guide: { ar: "توجيه", fr: "Conseil" },
  tag_announcement: { ar: "إعلان", fr: "Annonce" },
  post_pinned: { ar: "مثبّت", fr: "Épinglé" },

  /* عن المنصة */
  about_title: { ar: "نبسّط علوم الحياة والأرض لكل تلميذ مغربي", fr: "Rendre les SVT accessibles à chaque élève marocain" },
  about_lead: { ar: "Nova SVT منصة من إنجاز أستاذ مادة علوم الحياة والأرض، تجمع بين دقّة المحتوى العلمي وحداثة الأدوات الرقمية، باللغتين العربية والفرنسية.", fr: "Nova SVT est une plateforme réalisée par un enseignant de SVT, alliant la rigueur scientifique aux outils numériques modernes, en arabe et en français." },
  teacher_name: { ar: "ذة. / الأستاذ — مادة علوم الحياة والأرض", fr: "Enseignant(e) de SVT" },
  teacher_bio: { ar: "أستاذ مادة علوم الحياة والأرض بالسلكين الإعدادي والتأهيلي بالمغرب، شغوف بتبسيط المفاهيم العلمية عبر الوسائط الرقمية التفاعلية ثنائية اللغة.", fr: "Enseignant de SVT au collège et au lycée au Maroc, passionné par la simplification des notions scientifiques grâce à des supports numériques interactifs et bilingues." },
  teacher_fr: { ar: "Enseignant de SVT — collège & lycée, Maroc.", fr: "خبرة في تدريس مادة علوم الحياة والأرض بالمغرب." },
  teacher_stat: { ar: "درساً", fr: "cours" },
  why_eyebrow: { ar: "لماذا Nova SVT؟", fr: "Pourquoi Nova SVT ?" },
  why_title: { ar: "منهجٌ علميٌّ رقميٌّ متطوّر", fr: "Une approche scientifique et numérique" },
  why1_t: { ar: "محتوى مطابق للمنهاج", fr: "Conforme au programme" },
  why1_d: { ar: "دروس منظّمة حسب المستويات والوحدات وفق المقرّر الرسمي المغربي.", fr: "Des cours organisés par niveaux et unités selon le programme officiel marocain." },
  why2_t: { ar: "ثنائية اللغة بنقرة واحدة", fr: "Bilingue en un clic" },
  why2_d: { ar: "بدّل بين العربية والفرنسية فوراً لتتعلّم المصطلحات العلمية باللغتين.", fr: "Passe de l'arabe au français instantanément pour maîtriser les termes dans les deux langues." },
  why3_t: { ar: "تصحيح فوري وتفاعلي", fr: "Correction immédiate" },
  why3_d: { ar: "اختبارات تعطيك النتيجة والشرح مباشرة بعد كل سؤال.", fr: "Des quiz qui donnent le résultat et l'explication après chaque question." },
  why4_t: { ar: "يعمل على كل الأجهزة", fr: "Sur tous les appareils" },
  why4_d: { ar: "تصميم متجاوب يشتغل بسلاسة على الهاتف واللوحة والحاسوب.", fr: "Un design responsive fluide sur mobile, tablette et ordinateur." },
  about_cta_t: { ar: "جاهز لبدء التعلّم؟", fr: "Prêt à commencer ?" },
  about_cta_d: { ar: "تصفّح الدروس واختر مستواك الآن.", fr: "Parcours les cours et choisis ton niveau." },
  about_cta_btn: { ar: "تصفّح الدروس", fr: "Voir les cours" },

  /* تنبيهات */
  toast_dl: { ar: "بدأ التحميل", fr: "Téléchargement démarré" },
  toast_soon: { ar: "سيُضاف ملف الأستاذ هنا قريباً", fr: "Le fichier de l'enseignant sera ajouté ici" },
};

/* ============================================================================
   دوال الترجمة
   ========================================================================== */

/** يترجم كائن محتوى ثنائي اللغة {ar, fr}؛ ويعيد النص كما هو إن لم يكن كائناً. */
export function t(entry) {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const lang = getLang();
    return entry[lang] ?? entry.ar ?? "";
  }
  return entry ?? "";
}

/** يترجم نصّ واجهة عبر مفتاحه؛ ويعيد المفتاح نفسه إن لم يوجد (يسهّل اكتشاف النقص). */
export function ui(key) {
  const entry = STRINGS[key];
  return entry ? t(entry) : key;
}

/* ============================================================================
   تطبيق اللغة على الصفحة
   ========================================================================== */

/** يملأ كل عناصر [data-i18n] بالنص المترجَم ويضبط عنوان الصفحة. */
export function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const entry = STRINGS[key];
    if (entry) el.textContent = t(entry);
  });
  document.title = ui("doc_title");
}

/**
 * يبدّل اللغة بالكامل: يحدّث الحالة، واتجاه/صنف عنصر <html>، وعنوان الصفحة،
 * وحالة أزرار المبدّل. لا يعيد عرض الصفحة الحالية — يتولّى المتصل ذلك.
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  setLang(lang);

  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", LANG_DIR[lang]);
  html.classList.toggle("lang-ar", lang === "ar");
  html.classList.toggle("lang-fr", lang === "fr");

  document.querySelectorAll(".lang-toggle [data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
  });

  applyI18n();
}
