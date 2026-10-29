(function () {
  'use strict';

  // ← REPLACE with the business WhatsApp number: country code, digits only, no "+" (e.g. 9725XXXXXXXX)
  var WHATSAPP_NUMBER = '972500000000';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // --- Guided tour: Entry → Paths → Archive → Fix this → Contact
  var order = ['paths', 'archive', 'fix', 'contact'];
  var tourBtn = $('[data-tour="start"]');
  if (tourBtn) {
    tourBtn.addEventListener('click', function (e) {
      e.preventDefault();
      sessionStorage.setItem('mazeTour', '1');
      goto('archive');
      addNext();
    });
  }
  function goto(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView();
    if (el) { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  }
  function addNext() {
    $$('.tour-next').forEach(function (n) { n.remove(); });
    ['archive', 'fix'].forEach(function (id, i) {
      var sec = document.getElementById(id);
      var a = document.createElement('a');
      a.className = 'btn solid tour-next';
      a.href = '#' + order[order.indexOf(id) + 1];
      a.textContent = 'NEXT STEP';
      sec.appendChild(a);
    });
  }
  try { if (sessionStorage.getItem('mazeTour')) addNext(); } catch (e) {}

  // --- Case file overlay (opens over the archive; Escape or button closes)
  var overlay = $('#case');
  var opener = null;
  $$('[data-case]').forEach(function (b) {
    b.addEventListener('click', function () {
      opener = b;
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      $('[data-close]', overlay).focus();
    });
  });
  function closeCase() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  $$('[data-close]', overlay).forEach(function (b) { b.addEventListener('click', closeCase); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeCase();
  });

  // --- Fix this: pick a direction, then reveal the explanation (conceptual, no score)
  var out = $('#fix-out');
  var copy = {
    a: 'בחרתם בעיצוב הצפוף. הכול צועק בבת אחת, ולכן אין נקודת כניסה: העין לא יודעת איפה להתחיל, והמסר הולך לאיבוד.',
    b: 'בחרתם בעיצוב המרוכז. מסר אחד, היררכיה ברורה וצעד הבא אחד, וכך קל יותר להבין מה העסק מציע. זה תרגיל מושגי, לא תוצאה של לקוח אמיתי.'
  };
  $$('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-pick]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      out.textContent = copy[b.dataset.pick] + ' ההבדל: היררכיה, ריווח ומיקוד.';
      out.hidden = false;
    });
  });

  // --- Contact: service chip → prefilled WhatsApp message the visitor reviews and sends
  $$('[data-wa]').forEach(function (a) {
    var text = 'שלום, הגעתי מהאתר של MAZE. אני מתעניין/ת ב: ' + a.dataset.wa;
    a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    a.target = '_blank';
    a.rel = 'noopener';
  });
})();
