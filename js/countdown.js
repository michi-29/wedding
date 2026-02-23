/* ═══════════════════════════════════════════════════
   countdown.js
   • Live countdown to wedding date
   • TO CHANGE DATE: edit the `target` line below
   ═══════════════════════════════════════════════════ */

function runCountdown() {
  /* 👇 Change this date/time if needed */
  const target = new Date('2026-05-31T08:30:00+08:00');

  function tick() {
    const diff = target - new Date();

    if (diff <= 0) {
      ['cDays','cHours','cMins','cSecs'].forEach(id => {
        document.getElementById(id).textContent = '0';
      });
      return;
    }

    document.getElementById('cDays').textContent  = Math.floor(diff / 86400000);
    document.getElementById('cHours').textContent = String(Math.floor(diff % 86400000 / 3600000)).padStart(2, '0');
    document.getElementById('cMins').textContent  = String(Math.floor(diff % 3600000  / 60000)).padStart(2, '0');
    document.getElementById('cSecs').textContent  = String(Math.floor(diff % 60000    / 1000)).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

runCountdown();
