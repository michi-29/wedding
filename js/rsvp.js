/* ═══════════════════════════════════════════════════
   rsvp.js
   • RSVP form submission
   • Saves to localStorage (on-site guest list)
   • Sends to Google Sheets via Apps Script
   • TO CHANGE GOOGLE SHEET: update SHEETS_URL below
   ═══════════════════════════════════════════════════ */

/* 👇 Your Google Apps Script Web App URL */
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxyXy9ibyf23W3psB1U85H8TsSdlZHDpcDV6zmS0f79lA4j23BMxYD1nwaAKW-hq-A8QA/exec';

const RSVP_KEY = 'wedding-na-rsvp-2026';

/* ─── HIDE GUEST COUNT WHEN NOT ATTENDING ─── */
document.querySelectorAll('input[name="att"]').forEach(r => {
  r.addEventListener('change', () => {
    document.getElementById('guestRow').style.display = r.value === 'hadir' ? 'block' : 'none';
  });
});

/* ─── SUBMIT RSVP ─── */
async function submitRSVP() {
  const name  = document.getElementById('rName').value.trim();
  if (!name) {
    document.getElementById('rName').style.borderColor = '#B03030';
    document.getElementById('rName').focus();
    return;
  }

  const att    = document.querySelector('input[name="att"]:checked').value;
  const guests = document.getElementById('rGuests').value;
  const msg    = document.getElementById('rMsg').value.trim();
  const phone  = document.getElementById('rPhone').value.trim();
  const entry  = { name, att, guests, msg, phone, ts: Date.now() };

  /* Show loading */
  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Menghantar... ⏳';
  btn.disabled = true;

  /* 1 — Save locally */
  let list = getRSVPList();
  list.unshift(entry);
  saveRSVPList(list);

  /* 2 — Sync to shared storage (live guest list on site) */
  try { await window.storage.set(RSVP_KEY, JSON.stringify(list), true); } catch(e) {}

  /* 3 — Send to Google Sheets */
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, att, guests, msg, phone })
    });
  } catch(e) {
    /* Silent fail — data is already saved locally */
    console.warn('Google Sheets sync failed:', e);
  }

  /* 4 — Show success screen */
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpOK').style.display   = 'block';
  renderRSVP(list);
}

/* ─── HELPERS ─── */
function getRSVPList()   { try { return JSON.parse(localStorage.getItem(RSVP_KEY)) || []; } catch(e) { return []; } }
function saveRSVPList(l) { try { localStorage.setItem(RSVP_KEY, JSON.stringify(l)); } catch(e) {} }

/* ─── LOAD RSVP (on page init) ─── */
async function loadRSVP() {
  let list = getRSVPList();
  try {
    const r = await window.storage.get(RSVP_KEY, true);
    if (r?.value) {
      const shared = JSON.parse(r.value);
      if (shared.length >= list.length) { list = shared; saveRSVPList(list); }
    }
  } catch(e) {}
  renderRSVP(list);
}

/* ─── RENDER GUEST LIST ─── */
function renderRSVP(list) {
  const el  = document.getElementById('rsvpEntries');
  const cnt = document.getElementById('rsvpCount');

  if (!list.length) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-mid);font-style:italic;font-size:0.85rem;padding:0.5rem;">Belum ada RSVP lagi...</p>';
    cnt.textContent = '0';
    return;
  }

  el.innerHTML = list.map(e => `
    <div class="rsvp-entry">
      <span class="rsvp-name">${esc(e.name)}</span>
      <div style="display:flex;gap:0.4rem;align-items:center;">
        <span class="rsvp-status ${e.att === 'hadir' ? 'hadir' : 'tidak'}">
          ${e.att === 'hadir' ? '✓ Hadir' : '✗ Tidak'}
        </span>
        ${e.att === 'hadir' ? `<span class="rsvp-status">${e.guests}</span>` : ''}
      </div>
    </div>`).join('');

  const attending = list.filter(e => e.att === 'hadir').length;
  cnt.textContent = `${list.length} · ${attending} hadir`;
}

/* ─── ESCAPE HTML ─── */
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
