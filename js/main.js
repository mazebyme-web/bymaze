/* MAZE · main: rooms (router), gate reveal, navigation, mini-map, contact form */
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

  // ---------- Rooms ----------
  var ROOMS = ['gate', 'maze', 'archive', 'lab', 'contact'];
  var DEPTH = { gate: 0, maze: 1, archive: 2, lab: 2, contact: 2 };
  var TITLES = {
    gate: 'MAZE - Graphic Design & Branding Studio | סטודיו לעיצוב ומיתוג',
    maze: 'The Maze | MAZE',
    archive: 'Archive - selected work | MAZE',
    lab: 'Lab - design experiments | MAZE',
    contact: 'Contact, services & about | MAZE'
  };
  var OLD = { entry: 'gate', paths: 'maze', fix: 'lab', work: 'archive', exit: 'contact' };
  var current = null;

  function parse() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var room = OLD[parts[0]] || parts[0] || 'gate';
    if (ROOMS.indexOf(room) < 0) room = 'gate';
    return { room: room, sub: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function show(first) {
    var r = parse();
    if (r.room !== current) {
      var dir = current === null ? '' : (DEPTH[r.room] >= DEPTH[current] ? 'go-fwd' : 'go-back');
      ROOMS.forEach(function (id) {
        var el = document.getElementById(id);
        el.classList.remove('is-active', 'go-fwd', 'go-back');
        if (id === r.room) { el.classList.add('is-active'); if (dir && !reduce) el.classList.add(dir); }
      });
      $$('[data-nav]').forEach(function (a) { a.toggleAttribute('aria-current', a.dataset.nav === r.room); if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page'); });
      $$('[data-map]').forEach(function (a) { a.toggleAttribute('aria-current', a.dataset.map === r.room); if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'location'); });
      document.title = TITLES[r.room];
      if (!first) {
        window.scrollTo(0, 0);
        var h = document.querySelector('#' + r.room + ' h1, #' + r.room + ' h2');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      }
      current = r.room;
    }
    if (window.MAZE_ARCHIVE) window.MAZE_ARCHIVE.route(r.room === 'archive' ? r.sub : null);
  }
  addEventListener('hashchange', function () { show(false); });
  show(true);

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
  if (hasWA) { var fw = $('#f-wa'); fw.hidden = false; fw.href = 'https://wa.me/' + WHATSAPP_NUMBER; fw.target = '_blank'; fw.rel = 'noopener'; }

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
      say('נפתחה טיוטת מייל. אם לא נפתח כלום, כתבו ישירות ל־' + EMAIL, true);
    }
  });
})();
