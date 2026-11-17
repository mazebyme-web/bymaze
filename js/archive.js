/* MAZE · archive: tiles, filters, case file (address: #project-<id>) */
(function () {
  'use strict';
  var P = window.MAZE_PROJECTS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var grid = $('#grid'), overlay = $('#case'), body = $('#case-body'), opener = null;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function he(tag, cls, txt) { var e = el(tag, cls, txt); e.lang = 'he'; e.dir = 'rtl'; return e; }

  // ---- tile visual: real images if provided, otherwise a typographic placeholder
  function visual(p) {
    var v = el('span', 'vis v' + p.type);
    if (p.images.length) {
      p.images.slice(0, p.type === 'C' ? 4 : 1).forEach(function (im) {
        var i = el('img'); i.src = im.src; i.alt = im.alt || ''; i.loading = 'lazy'; v.appendChild(i);
      });
      return v;
    }
    v.setAttribute('aria-hidden', 'true');
    if (p.soon) { v.appendChild(el('b', 'giant', p.n)); v.appendChild(el('em', 'pend', 'COMING SOON')); return v; }
    if (p.type === 'C') { for (var k = 1; k <= 4; k++) v.appendChild(el('i', 'strip', 'V' + k)); }
    else if (p.type === 'D') { v.appendChild(el('b', 'giant', p.title.toUpperCase())); }
    else { v.appendChild(el('b', 'giant', p.n)); v.appendChild(el('em', 'pend', 'IMAGES COMING SOON')); }
    return v;
  }

  function meta(p) {
    var m = el('span', 'meta');
    m.appendChild(el('small', 'tech', p.n + ' / ' + p.cats.join(' · ').toUpperCase()));
    m.appendChild(el('strong', 'ttl', p.title));
    m.appendChild(el('small', 'lbl', p.label));
    if (p.desc) m.appendChild(he('span', 'more', p.desc));
    return m;
  }

  function tile(p) {
    var li = el('li', 'tile t' + p.type + (p.soon ? ' soon' : '')); li.dataset.cats = p.cats.join(' ');
    var box;
    if (p.soon) { box = el('div', 'soon-box'); }
    else { box = el('button'); box.type = 'button'; box.dataset.id = p.id; box.setAttribute('aria-label', 'Open project ' + p.n + ': ' + p.title); }
    box.appendChild(visual(p));
    box.appendChild(meta(p));
    li.appendChild(box);
    return li;
  }
  P.forEach(function (p) { grid.appendChild(tile(p)); });

  // closing tile: an invitation to start a project (fills the grid, leads to the form)
  var cta = el('li', 'tile tD cta'); cta.dataset.cats = 'branding digital print';
  var ca = el('a', 'cta-box'); ca.href = '#cform';
  ca.appendChild(el('span', 'tech', 'YOUR PROJECT'));
  ca.appendChild(el('strong', 'cta-ttl', 'Let’s make yours.'));
  ca.appendChild(he('span', 'cta-he', 'הפרויקט הבא יכול להיות שלכם ←'));
  cta.appendChild(ca); grid.appendChild(cta);

  // ---- filters
  var count = $('#arch-count'), empty = $('#arch-empty');
  function filter(f) {
    var n = 0;
    $$('.tile', grid).forEach(function (t) {
      var show = f === 'all' || t.dataset.cats.split(' ').indexOf(f) > -1;
      t.hidden = !show;
      if (show) { if (!t.classList.contains('soon') && !t.classList.contains('cta')) n++; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); }
    });
    $$('.filters [data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === f ? 'true' : 'false'); });
    empty.hidden = $$('.tile:not([hidden])', grid).length > 0;
    count.textContent = n + (n === 1 ? ' PROJECT' : ' PROJECTS') + ' · ' + (f === 'all' ? 'ALL' : f.toUpperCase());
  }
  $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });
  filter('all');

  // ---- case file
  function render(p) {
    body.textContent = '';
    $('#h-case').textContent = p.n + ' - ' + p.title;
    body.appendChild(el('p', 'tech', p.label.toUpperCase()));
    var art = he('div', 'he-block');
    art.appendChild(he('p', 'he-lead', p.desc));
    (p.sections || []).forEach(function (s) { art.appendChild(he('h3', null, s[0])); art.appendChild(he('p', null, s[1])); });
    body.appendChild(art);
    if (p.images.length) p.images.forEach(function (im) { var i = el('img', 'detail-img'); i.src = im.src; i.alt = im.alt || ''; i.loading = 'lazy'; body.appendChild(i); });
    else body.appendChild(el('div', 'ph', 'IMAGES COMING SOON'));
    if (p.deliverables.length) {
      body.appendChild(el('p', 'tech', 'DELIVERABLES'));
      var d = el('ul', 'dl'); p.deliverables.forEach(function (x) { d.appendChild(el('li', null, x)); }); body.appendChild(d);
    }
    var cta = el('a', 'btn solid', 'YOUR TURN - LET’S TALK'); cta.href = '#contact'; body.appendChild(cta);
  }
  function open(p) {
    render(p);
    opener = $('button[data-id="' + p.id + '"]', grid);
    overlay.hidden = false; document.body.style.overflow = 'hidden'; overlay.scrollTop = 0;
    document.title = p.title + ' | MAZE';
    $('.close', overlay).focus();
  }
  function close(restore) {
    if (overlay.hidden) return;
    overlay.hidden = true; document.body.style.overflow = '';
    if (restore && opener) opener.focus({ preventScroll: true });
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b) return;
    location.hash = '#project-' + encodeURIComponent(b.dataset.id);
  });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { leave(); }
    if (e.key === 'Tab') {
      var f = $$('a,button', overlay), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // close the case file and return to the archive without jumping
  function leave() {
    history.pushState(null, '', '#archive');
    close(true);
  }
  $('.close', overlay).addEventListener('click', function (e) { e.preventDefault(); leave(); });

  // open / close from the address (#project-<id>), also on back / forward
  function sync() {
    var m = location.hash.match(/^#project-(.+)$/);
    if (m) {
      var id = decodeURIComponent(m[1]);
      var p = P.filter(function (x) { return x.id === id && !x.soon; })[0];
      if (p) { open(p); return; }
      history.replaceState(null, '', '#archive');
    }
    if (!overlay.hidden) {
      close(false);
      var target = location.hash && document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
    document.title = 'MAZE - Graphic Design & Branding Studio | סטודיו לעיצוב ומיתוג';
  }
  addEventListener('hashchange', sync);
  addEventListener('popstate', sync);
  sync();
})();
