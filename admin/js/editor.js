/**
 * Nova SVT — محرّر الدروس (Admin Panel)
 * =============================================================================
 * يدير محرّر Quill، معاينة فورية، حفظ LocalStorage، وتصدير JSON
 */

// ── التهيئة ──────────────────────────────────────────────────────────────
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  },
  placeholder: 'اكتب محتوى الدرس هنا...'
});

// ── عناصر DOM ──────────────────────────────────────────────────────────
const form = document.getElementById('lessonForm');
const previewContent = document.getElementById('previewContent');
const exportModal = document.getElementById('exportModal');
const saveModal = document.getElementById('saveModal');
const jsonOutput = document.getElementById('jsonOutput');

const langTabs = document.querySelectorAll('.lang-tab');
const langContents = document.querySelectorAll('.lang-content');

// ── مفاتيح حقول النموذج ──────────────────────────────────────────────────
const fields = {
  lessonId: 'lessonId',
  lessonLevel: 'lessonLevel',
  lessonBranch: 'lessonBranch',
  lessonFig: 'lessonFig',
  lessonDuration: 'lessonDuration',
  unitAr: 'unitAr',
  titleAr: 'titleAr',
  descAr: 'descAr',
  videoTitleAr: 'videoTitleAr',
  videoLengthAr: 'videoLengthAr',
  unitFr: 'unitFr',
  titleFr: 'titleFr',
  descFr: 'descFr',
  videoTitleFr: 'videoTitleFr',
  videoLengthFr: 'videoLengthFr',
};

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ إدارة تبويبات اللغة
// ═══════════════════════════════════════════════════════════════════════════

langTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = tab.dataset.lang;

    // إزالة active من كل الـ tabs و contents
    langTabs.forEach(t => t.classList.remove('active'));
    langContents.forEach(c => c.classList.remove('active'));

    // إضافة active للعنصر المختار
    tab.classList.add('active');
    document.querySelector(`.lang-content[data-lang="${lang}"]`).classList.add('active');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ LocalStorage: حفظ واستعادة البيانات
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'nova-svt-admin-draft';

function saveDraft() {
  const data = {
    lessonId: document.getElementById('lessonId').value,
    lessonLevel: document.getElementById('lessonLevel').value,
    lessonBranch: document.getElementById('lessonBranch').value,
    lessonFig: document.getElementById('lessonFig').value,
    lessonDuration: document.getElementById('lessonDuration').value,
    unitAr: document.getElementById('unitAr').value,
    titleAr: document.getElementById('titleAr').value,
    descAr: document.getElementById('descAr').value,
    videoTitleAr: document.getElementById('videoTitleAr').value,
    videoLengthAr: document.getElementById('videoLengthAr').value,
    unitFr: document.getElementById('unitFr').value,
    titleFr: document.getElementById('titleFr').value,
    descFr: document.getElementById('descFr').value,
    videoTitleFr: document.getElementById('videoTitleFr').value,
    videoLengthFr: document.getElementById('videoLengthFr').value,
    content: quill.getContents() // محتوى Quill (Delta)
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function restoreDraft() {
  const draft = localStorage.getItem(STORAGE_KEY);
  if (!draft) return;

  try {
    const data = JSON.parse(draft);

    document.getElementById('lessonId').value = data.lessonId || '';
    document.getElementById('lessonLevel').value = data.lessonLevel || '';
    document.getElementById('lessonBranch').value = data.lessonBranch || '';
    document.getElementById('lessonFig').value = data.lessonFig || '';
    document.getElementById('lessonDuration').value = data.lessonDuration || '';
    document.getElementById('unitAr').value = data.unitAr || '';
    document.getElementById('titleAr').value = data.titleAr || '';
    document.getElementById('descAr').value = data.descAr || '';
    document.getElementById('videoTitleAr').value = data.videoTitleAr || '';
    document.getElementById('videoLengthAr').value = data.videoLengthAr || '';
    document.getElementById('unitFr').value = data.unitFr || '';
    document.getElementById('titleFr').value = data.titleFr || '';
    document.getElementById('descFr').value = data.descFr || '';
    document.getElementById('videoTitleFr').value = data.videoTitleFr || '';
    document.getElementById('videoLengthFr').value = data.videoLengthFr || '';

    if (data.content) {
      quill.setContents(data.content);
    }

    console.log('✓ تم استعادة المسودة من LocalStorage');
  } catch (e) {
    console.error('خطأ في استعادة المسودة:', e);
  }
}

// حفظ تلقائي عند كل تغيير
form.addEventListener('input', () => {
  saveDraft();
});

quill.on('text-change', () => {
  saveDraft();
  updatePreview();
});

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ معاينة فورية
// ═══════════════════════════════════════════════════════════════════════════

function updatePreview() {
  const titleAr = document.getElementById('titleAr').value;
  const titleFr = document.getElementById('titleFr').value;
  const descAr = document.getElementById('descAr').value;
  const unitAr = document.getElementById('unitAr').value;
  const videoTitleAr = document.getElementById('videoTitleAr').value;
  const videoLengthAr = document.getElementById('videoLengthAr').value;
  const content = quill.root.innerHTML;

  if (!titleAr && !titleFr) {
    previewContent.innerHTML = '<div class="preview-placeholder"><p>👈 أدخل عنوان الدرس</p></div>';
    return;
  }

  const html = `
    <div class="preview-lesson">
      <div class="preview-unit">${unitAr || ''}</div>
      <h1 class="preview-title">${titleAr || titleFr}</h1>
      <p class="preview-desc">${descAr || ''}</p>
      
      <div class="preview-video-info">
        <span class="video-title">📹 ${videoTitleAr || ''}</span>
        <span class="video-length">⏱️ ${videoLengthAr || '00:00'}</span>
      </div>

      <div class="preview-intro">
        ${content}
      </div>
    </div>
  `;

  previewContent.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ بناء JSON وتصديره
// ═══════════════════════════════════════════════════════════════════════════

function buildJSON() {
  const lessonId = document.getElementById('lessonId').value.trim();
  const level = document.getElementById('lessonLevel').value;
  const branch = document.getElementById('lessonBranch').value;
  const fig = document.getElementById('lessonFig').value;
  const duration = parseInt(document.getElementById('lessonDuration').value) || 0;

  // التحقّق من الحقول المطلوبة
  if (!lessonId || !level || !branch || !fig || !duration) {
    alert('⚠️ يرجى ملء جميع الحقول المطلوبة (البيانات الأساسية)');
    return null;
  }

  const content = quill.getLength() > 1 ? quill.root.innerHTML : '';

  const lesson = {
    id: lessonId,
    level: level,
    branch: branch,
    fig: fig,
    duration: duration,
    unit: {
      ar: document.getElementById('unitAr').value,
      fr: document.getElementById('unitFr').value
    },
    title: {
      ar: document.getElementById('titleAr').value,
      fr: document.getElementById('titleFr').value
    },
    desc: {
      ar: document.getElementById('descAr').value,
      fr: document.getElementById('descFr').value
    },
    video: {
      title: {
        ar: document.getElementById('videoTitleAr').value,
        fr: document.getElementById('videoTitleFr').value
      },
      length: document.getElementById('videoLengthAr').value
    },
    intro: [
      {
        ar: content,
        fr: document.getElementById('descFr').value
      }
    ],
    figs: [],
    quiz: []
  };

  return lesson;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ Modals
// ═══════════════════════════════════════════════════════════════════════════

function showModal(modal) {
  modal.style.display = 'flex';
}

function hideModal(modal) {
  modal.style.display = 'none';
}

document.getElementById('closeModal').addEventListener('click', () => {
  hideModal(exportModal);
});

document.getElementById('closeSaveModal').addEventListener('click', () => {
  hideModal(saveModal);
});

document.getElementById('closeSaveBtn').addEventListener('click', () => {
  hideModal(saveModal);
});

// إغلاق المودال عند النقر خارجه
exportModal.addEventListener('click', (e) => {
  if (e.target === exportModal) hideModal(exportModal);
});

saveModal.addEventListener('click', (e) => {
  if (e.target === saveModal) hideModal(saveModal);
});

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ أزرار الإجراءات الرئيسية
// ═══════════════════════════════════════════════════════════════════════════

document.getElementById('saveDraft').addEventListener('click', (e) => {
  e.preventDefault();
  saveDraft();
  showModal(saveModal);
});

document.getElementById('exportJSON').addEventListener('click', (e) => {
  e.preventDefault();
  const lesson = buildJSON();
  if (!lesson) return;

  const json = JSON.stringify(lesson, null, 2);
  jsonOutput.value = json;
  showModal(exportModal);
});

document.getElementById('clearForm').addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('⚠️ هل أنت متأكّد؟ سيتم حذف كل البيانات المكتوبة!')) {
    form.reset();
    quill.setContents([]);
    localStorage.removeItem(STORAGE_KEY);
    previewContent.innerHTML = '<div class="preview-placeholder"><p>👈 ابدأ بكتابة درس جديد</p></div>';
  }
});

document.getElementById('copyJSON').addEventListener('click', () => {
  jsonOutput.select();
  document.execCommand('copy');
  alert('✅ تم نسخ JSON!\n\nألصقه في ملف `data/lessons/<المستوى>.json` (مثلاً: `data/lessons/tcs.json`)');
});

document.getElementById('downloadJSON').addEventListener('click', () => {
  const lesson = buildJSON();
  if (!lesson) return;

  const filename = `${lesson.id}.json`;
  const json = JSON.stringify(lesson, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

// ═══════════════════════════════════════════════════════════════════════════
// 7️⃣ التهيئة عند تحميل الصفحة
// ═══════════════════════════════════════════════════════════════════════════

window.addEventListener('load', () => {
  restoreDraft();
  updatePreview();
});

// حفظ تلقائي قبل إغلاق الصفحة
window.addEventListener('beforeunload', () => {
  saveDraft();
});
