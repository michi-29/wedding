/* ═══════════════════════════════════════════════════
   nav.js
   • Slide navigation (goTo, next, prev)
   • Keyboard & swipe support
   • Dot + nav link updates
   • Hamburger menu toggle
   • Envelope open animation
   ═══════════════════════════════════════════════════ */

const TOTAL = 7;
let current = 0;
const slides    = document.querySelectorAll('.slide');
const navLinks  = document.querySelectorAll('.nav-links a');

/* ─── GO TO SLIDE ─── */
function goTo(idx) {
  if (idx < 0 || idx >= TOTAL) return;
  slides[current].classList.remove('active');
  slides[current].classList.add('prev');
  current = idx;
  slides[current].classList.remove('prev');
  slides[current].classList.add('active');
  setTimeout(() => slides.forEach(s => s.classList.remove('prev')), 700);
  updateUI();
  closeNav();
}

function nextSlide() { goTo(current + 1); }
function prevSlide() { goTo(current - 1); }

/* ─── UPDATE NAV UI ─── */
function updateUI() {
  navLinks.forEach((a, i) => a.classList.toggle('active', i === current));
  document.getElementById('arrowLeft').disabled  = current === 0;
  document.getElementById('arrowRight').disabled = current === TOTAL - 1;
  document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === current));
}

/* ─── BUILD DOTS ─── */
const dotsContainer = document.getElementById('navDots');
for (let i = 0; i < TOTAL; i++) {
  const btn = document.createElement('button');
  btn.className = 'nav-dot' + (i === 0 ? ' active' : '');
  btn.onclick = () => goTo(i);
  btn.setAttribute('aria-label', `Slide ${i + 1}`);
  dotsContainer.appendChild(btn);
}

/* ─── KEYBOARD ─── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft')  prevSlide();
});

/* ─── TOUCH SWIPE ─── */
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide(); }
}, { passive: true });

/* ─── HAMBURGER ─── */
function toggleNav() { document.getElementById('navLinks').classList.toggle('open'); }
function closeNav()  { document.getElementById('navLinks').classList.remove('open'); }

/* ─── ENVELOPE ─── */
function openEnvelope() {
  const env = document.getElementById('envelopeStage');
  env.classList.toggle('open');
  env.classList.remove('float-anim');
  if (env.classList.contains('open')) {
    setTimeout(() => goTo(1), 1000);
  }
}

/* ─── INIT ─── */
updateUI();
