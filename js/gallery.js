/* ═══════════════════════════════════════════════════
   gallery.js
   • Photo upload (click or drag & drop)
   • Gallery grid rendering
   • Lightbox viewer
   • QR code generation
   • Copy share link
   ═══════════════════════════════════════════════════ */

const GAL_KEY = 'wedding-na-gallery-2026';

/* ─── LOAD GALLERY (on page init) ─── */
async function loadGallery() {
  let list = getGallery();
  try {
    const r = await window.storage.get(GAL_KEY, true);
    if (r?.value) {
      const shared = JSON.parse(r.value);
      if (shared.length >= list.length) { list = shared; saveGallery(list); }
    }
  } catch(e) {}
  renderGallery(list);
}

/* ─── FILE HELPERS ─── */
function getGallery()   { try { return JSON.parse(localStorage.getItem(GAL_KEY)) || []; } catch(e) { return []; } }
function saveGallery(l) { try { localStorage.setItem(GAL_KEY, JSON.stringify(l)); } catch(e) {} }

/* ─── UPLOAD HANDLERS ─── */
function handleFileSelect(e)  { processFiles(Array.from(e.target.files)); }
function handleDragOver(e)    { e.preventDefault(); document.getElementById('uploadZone').classList.add('drag-over'); }
function handleDragLeave()    { document.getElementById('uploadZone').classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('uploadZone').classList.remove('drag-over');
  processFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
}

/* ─── PROCESS & SAVE FILES ─── */
function processFiles(files) {
  const name = document.getElementById('uploaderName').value.trim() || 'Tetamu';

  files.forEach(f => {
    /* Max 10MB */
    if (f.size > 10 * 1024 * 1024) { alert(`${f.name} terlalu besar (max 10MB)`); return; }

    const reader = new FileReader();
    reader.onload = async e => {
      const entry = { src: e.target.result, name, ts: Date.now(), id: Math.random().toString(36).slice(2) };

      let list = getGallery();
      list.unshift(entry);
      if (list.length > 50) list = list.slice(0, 50); /* Keep last 50 photos */
      saveGallery(list);

      try { await window.storage.set(GAL_KEY, JSON.stringify(list), true); } catch(err) {}

      renderGallery(list);
    };
    reader.readAsDataURL(f);
  });
}

/* ─── RENDER GALLERY GRID ─── */
function renderGallery(list) {
  const grid  = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');

  grid.innerHTML = '';
  empty.style.display = list.length ? 'none' : 'block';

  list.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-photo';
    div.innerHTML = `
      <img src="${item.src}" alt="Photo by ${esc(item.name)}" loading="lazy">
      <div class="gallery-photo-name">${esc(item.name)}</div>`;
    div.addEventListener('click', () => openLightbox(item.src));
    grid.appendChild(div);
  });
}

/* ─── LIGHTBOX ─── */
function openLightbox(src) {
  document.getElementById('lbImg').src = src;
  document.getElementById('lightbox').classList.add('on');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('on');
  document.getElementById('lbImg').src = '';
}

/* ─── QR CODE ─── */
function generateQR() {
  const url = window.location.href.split('#')[0];
  try {
    new QRCode(document.getElementById('qrCanvas'), {
      text: url,
      width: 80, height: 80,
      colorDark: '#6B1A2A',
      colorLight: '#F5EFE6',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) {}
}

/* ─── COPY LINK ─── */
function copyLink() {
  const url = window.location.href.split('#')[0];
  navigator.clipboard.writeText(url)
    .then(() => alert('Pautan disalin! 🔗'))
    .catch(() => prompt('Salin pautan:', url));
}

/* ─── ESCAPE HTML ─── */
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ─── PAGE INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  loadRSVP();
  loadGallery();
  generateQR();
});
