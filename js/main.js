/* MAZE · main: section highlight, headline fit, gate reveal, Instagram preview, contact form */
(function () {
  'use strict';

  /* ---------- SETTINGS: fill these in ---------- */
  // WhatsApp: country code + number, digits only, no "+" (e.g. 972501234567). Leave as is to hide WhatsApp.
  var WHATSAPP_NUMBER = '972500000000';
  // Free form service (e.g. Formspree): paste your form address here, like 'https://formspree.io/f/abcdwxyz'.
  // While empty, "שליחה" opens WhatsApp (if set above) or an email draft.
  var FORM_ENDPOINT = '';
  var EMAIL = 'mazebyme@gmail.com';
  /* --------------------------------------------- */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- One page: highlight where the visitor is ----------
  var SECTIONS = ['gate', 'archive', 'lab', 'contact'];
  function mark(id) {
    $$('[data-nav]').forEach(function (a) { if (a.dataset.nav === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    $$('[data-map]').forEach(function (a) { if (a.dataset.map === id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  // ---------- Headlines: always exactly two lines ----------
  // Headlines with class "fit" always keep their two lines, as large as fits (max 144px).
  function fitHeadline() {
    $$('.big.fit').forEach(function (fit) {
      var box = fit.parentNode.clientWidth;
      fit.style.fontSize = '100px';
      var w = Math.max.apply(null, $$('.ln', fit).map(function (l) { return l.offsetWidth; }));
      fit.style.fontSize = Math.min(144, Math.floor(100 * box / w * 0.98)) + 'px';
    });
  }
  fitHeadline();
  addEventListener('resize', fitHeadline);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeadline);

  // ---------- Instagram strip ----------
  var IG = window.MAZE_INSTAGRAM || { posts: [] };
  if (IG.profile && $('#ig-avatar')) $('#ig-avatar').src = IG.profile;
  var track = $('#ig-track'), list = $('#ig-posts');
  if (track && list) {
  (IG.posts || []).forEach(function (post, i) {
    var li = document.createElement('li');
    if (post.img) {
      var im = document.createElement('img'); im.src = post.img; im.alt = post.alt || ''; im.loading = 'lazy'; im.draggable = false; li.appendChild(im);
    } else {
      var ph = document.createElement('span'); ph.className = 'ig-ph'; ph.setAttribute('aria-hidden', 'true'); ph.textContent = String(i + 1).padStart(2, '0'); li.appendChild(ph);
    }
    list.appendChild(li);
  });
  function canDrag() { track.classList.toggle('can-drag', track.scrollWidth > track.clientWidth + 2); }
  canDrag(); addEventListener('resize', canDrag);
  // drag sideways with the mouse (touch screens scroll natively)
  var drag = null;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !track.classList.contains('can-drag')) return;
    drag = { x: e.clientX, left: track.scrollLeft };
    track.setPointerCapture(e.pointerId); track.classList.add('dragging');
  });
  track.addEventListener('pointermove', function (e) { if (drag) track.scrollLeft = drag.left - (e.clientX - drag.x); });
  ['pointerup', 'pointercancel'].forEach(function (ev) { track.addEventListener(ev, function () { drag = null; track.classList.remove('dragging'); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      track.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * 220, behavior: reduce ? 'auto' : 'smooth' });
    }
  });
  } // the posts strip comes back when there are enough posts (see js/projects.js)

  // ---------- Click / tap effect ----------
  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      var t = document.createElement('span');
      t.className = 'tap'; t.setAttribute('aria-hidden', 'true');
      t.style.left = e.clientX + 'px'; t.style.top = e.clientY + 'px';
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, 600);
    }, { passive: true });
  }

  // ---------- Gate: pointer / touch reveals what MAZE does ----------
  var rev = $('#reveal');
  function setPos(e) {
    var r = rev.getBoundingClientRect(), t = e.touches ? e.touches[0] : e;
    rev.style.setProperty('--x', (t.clientX - r.left) + 'px');
    rev.style.setProperty('--y', (t.clientY - r.top) + 'px');
    rev.style.setProperty('--r', (innerWidth < 600 ? 90 : 140) + 'px');
  }
  if (!reduce) {
    ['pointermove', 'touchstart', 'touchmove'].forEach(function (ev) { rev.addEventListener(ev, setPos, { passive: true }); });
    ['pointerleave', 'touchend'].forEach(function (ev) { rev.addEventListener(ev, function () { rev.style.setProperty('--r', '0px'); }); });
  }

  // ---------- Contact ----------
  var hasWA = WHATSAPP_NUMBER !== '972500000000';
  var form = $('#cform'), note = $('#form-note'), svcs = $$('[data-svc]');
  if (hasWA) {
    var fw = $('#f-wa'); fw.hidden = false; fw.href = 'https://wa.me/' + WHATSAPP_NUMBER; fw.target = '_blank'; fw.rel = 'noopener';
    var wf = $('#wa-float'); wf.hidden = false; wf.href = 'https://wa.me/' + WHATSAPP_NUMBER;
  }

  svcs.forEach(function (b) {
    b.addEventListener('click', function () {
      svcs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      form.msg.value = 'שלום, אני מתעניין/ת ב: ' + b.dataset.svc + '\n';
      if (matchMedia('(max-width: 899px)').matches) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      form.msg.focus({ preventScroll: true });
    });
  });

  function say(t, ok) { note.textContent = t; note.classList.toggle('ok', !!ok); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), contact = form.contact.value.trim(), msg = form.msg.value.trim();
    if (!name || !contact || !msg) {
      say('נא למלא את שלושת השדות.');
      (!name ? form.name : !contact ? form.contact : form.msg).focus();
      return;
    }
    var text = msg + '\n\n' + name + '\n' + contact;
    if (FORM_ENDPOINT) {
      say('שולח...');
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw r; form.reset(); svcs.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); say('תודה! ההודעה נשלחה, אחזור אליכם בהקדם.', true); })
        .catch(function () { say('משהו השתבש בשליחה. אפשר לכתוב ישירות ל־' + EMAIL); });
    } else if (hasWA) {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      say('נפתחה הודעת וואטסאפ עם הפרטים שלכם.', true);
    } else {
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('פנייה מהאתר') + '&body=' + encodeURIComponent(text);
      say('אם לא נפתחה טיוטת מייל, כתבו ישירות ל־' + EMAIL + '. הפרטים שלכם עדיין בטופס.');
    }
  });
})();
