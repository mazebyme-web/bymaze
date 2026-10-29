(function () {
  'use strict';
  // REPLACE with the business WhatsApp number: country code, digits only, no "+" (e.g. 9725XXXXXXXX)
  var WHATSAPP_NUMBER = '972500000000';
  var EMAIL = 'mazebyme@gmail.com';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Entry: pointer / touch reveals a second typographic layer; scroll shifts the headline words
  var rev = $('#reveal'), words = $$('.big span', $('#entry'));
  function setPos(e) {
    var r = rev.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    rev.style.setProperty('--x', (t.clientX - r.left) + 'px');
    rev.style.setProperty('--y', (t.clientY - r.top) + 'px');
    rev.style.setProperty('--r', '110px');
  }
  if (!reduce) {
    ['pointermove', 'touchstart', 'touchmove'].forEach(function (ev) { rev.addEventListener(ev, setPos, { passive: true }); });
    ['pointerleave', 'touchend'].forEach(function (ev) { rev.addEventListener(ev, function () { rev.style.setProperty('--r', '0px'); }); });
    var tick = false;
    addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var p = Math.min(scrollY / innerHeight, 1);
        words.forEach(function (w, i) { w.style.transform = 'translateX(' + ((i % 2 ? -1 : 1) * p * 12) + 'vw)'; });
        tick = false;
      });
    }, { passive: true });
  } else { rev.style.setProperty('--r', '0px'); }

  // ---- Navigation state: current section + visited paths
  var ids = ['entry', 'paths', 'archive', 'fix', 'contact'], seen = {};
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.id;
      $$('.bar nav a').forEach(function (a) { a.removeAttribute('aria-current'); if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); });
      seen[id] = 1;
      $$('.paths a').forEach(function (a) { if (seen[a.getAttribute('href').slice(1)] && id !== 'paths') a.classList.add('visited'); });
      if (tourOn) { tourIdx = Math.max(0, route.indexOf(id)); drawTour(); }
    });
  }, { threshold: 0.55 });
  ids.forEach(function (id) { io.observe(document.getElementById(id)); });

  // ---- Guided tour: Paths → Archive → Fix this → Contact
  var route = ['paths', 'archive', 'fix', 'contact'], tourOn = false, tourIdx = 0;
  var bar = $('#tour');
  function go(id) {
    var el = document.getElementById(id);
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
  }
  function drawTour() {
    $('#tour-step').textContent = 'Guided route · ' + (tourIdx + 1) + ' of ' + route.length;
    $('#tour-back').disabled = tourIdx === 0;
    $('#tour-next').textContent = tourIdx === route.length - 1 ? 'DONE' : 'NEXT';
  }
  function tour(on) { tourOn = on; bar.hidden = !on; document.body.classList.toggle('touring', on); if (on) drawTour(); }
  $('[data-tour="start"]').addEventListener('click', function () { tour(true); tourIdx = 1; go('archive'); drawTour(); });
  $('#tour-next').addEventListener('click', function () { if (tourIdx === route.length - 1) return tour(false); tourIdx++; go(route[tourIdx]); drawTour(); });
  $('#tour-back').addEventListener('click', function () { if (tourIdx > 0) { tourIdx--; go(route[tourIdx]); drawTour(); } });
  $('#tour-exit').addEventListener('click', function () { tour(false); });

  // ---- Case file overlay
  var overlay = $('#case'), opener = null;
  $$('[data-case]').forEach(function (b) {
    b.addEventListener('click', function () {
      opener = b; overlay.hidden = false; document.body.style.overflow = 'hidden'; $('[data-close]', overlay).focus();
    });
  });
  function closeCase() { overlay.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  $$('[data-close]', overlay).forEach(function (b) { b.addEventListener('click', closeCase); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeCase();
    if (e.key === 'Tab' && !overlay.hidden) { // keep focus inside the overlay
      var f = $$('a,button', overlay).filter(function (x) { return !x.disabled; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---- FIX THIS: three switches change the same ad; Hebrew explanation follows the last change
  var ad = $('#ad'), out = $('#fix-out');
  var why = {
    msg: ['מסר אחד', 'חמש הודעות מתחרות זו בזו. כשיש מסר אחד, הקורא מבין תוך שנייה מה העסק מציע ומה לעשות.'],
    hier: ['היררכיה', 'כשהכול גדול, שום דבר לא בולט. כותרת אחת דומיננטית והשאר קטן יותר נותנים לעין נקודת התחלה.'],
    id: ['זהות עקבית', 'צבע וטיפוגרפיה שחוזרים על עצמם הופכים מודעה סתמית למשהו שאפשר לזהות ולזכור.']
  };
  $$('[data-fix]').forEach(function (c) {
    c.addEventListener('change', function () {
      var k = c.dataset.fix; ad.classList.toggle('f-' + k, c.checked);
      out.textContent = c.checked ? why[k][0] + ': ' + why[k][1] : 'ביטלתם את ' + why[k][0] + '. שימו לב מה חזר להיות קשה לקריאה.';
      if ($$('[data-fix]:checked').length === 3) out.textContent += ' זהו תרגיל מושגי על עסק בדוי, לא תוצאה של לקוח אמיתי.';
    });
  });
  $('#fix-reset').addEventListener('click', function () {
    $$('[data-fix]').forEach(function (c) { c.checked = false; });
    ad.className = 'ad'; out.textContent = 'סמנו שינוי כדי לראות מה הוא משנה.';
  });

  // ---- Contact: WhatsApp when a real number is set, otherwise an email draft (never a dead link)
  var ready = WHATSAPP_NUMBER !== '972500000000';
  var note = $('#wa-note');
  $$('[data-wa]').forEach(function (a) {
    var text = 'שלום, הגעתי מהאתר של MAZE. אני מתעניין/ת ב: ' + a.dataset.wa;
    a.href = ready ? 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text)
                   : 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('פנייה מהאתר: ' + a.dataset.wa) + '&body=' + encodeURIComponent(text);
    if (ready) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function () { note.textContent = ready ? 'Opening WhatsApp with your message.' : 'Opening an email draft (WhatsApp number not set yet).'; });
  });
})();
