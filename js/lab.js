/* MAZE · lab: type playground + choose the better layout */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 01 · Type playground ----------
  var stage = $('#type-stage'), word = $('#type-word'), w = $('#type-w'), s = $('#type-s'), t = $('#type-t');
  var WEIGHTS = [300, 400, 600, 900];
  var DEF = { word: 'MAZE', w: 3, s: 120, t: -4 };

  function draw() {
    var txt = word.value.trim() || 'MAZE';
    stage.textContent = '';
    Array.from(txt).forEach(function (ch) {
      var sp = document.createElement('span');
      sp.textContent = ch === ' ' ? ' ' : ch;
      stage.appendChild(sp);
    });
    style();
  }
  function style() {
    stage.style.fontWeight = WEIGHTS[+w.value];
    stage.style.fontSize = 'min(' + s.value + 'px, 18vw)';
    stage.style.letterSpacing = (t.value / 100) + 'em';
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shuffle() {
    var colors = ['var(--ink)', 'var(--sand)', 'var(--accent)'];
    Array.prototype.forEach.call(stage.children, function (sp) {
      sp.style.transform = reduce ? '' : 'translate(' + rnd(-.12, .12).toFixed(2) + 'em,' + rnd(-.22, .22).toFixed(2) + 'em) rotate(' + rnd(-14, 14).toFixed(1) + 'deg)';
      sp.style.color = colors[Math.floor(Math.random() * colors.length)];
    });
  }
  function reset() { word.value = DEF.word; w.value = DEF.w; s.value = DEF.s; t.value = DEF.t; draw(); }

  word.addEventListener('input', draw);
  [w, s, t].forEach(function (x) { x.addEventListener('input', style); });
  $('#type-shuffle').addEventListener('click', shuffle);
  $('#type-reset').addEventListener('click', reset);
  draw();

  // ---------- 02 · Clean it up ----------
  // Each removed item lowers the "time to understand", from 9 seconds to 1.
  var JUNK = [
    ['j1', '!!!מבצע!!!'], ['j2', '★★★★★'], ['j3', 'STOCK PHOTO'], ['j4', 'הכי טעים בעיר!!!'],
    ['j5', 'WiFi חינם!!!'], ['j6', '1+1 על המאפים*'], ['j7', 'חדש!'], ['j8', 'עקבו אחרינו בפייסבוק • אינסטגרם • טיקטוק']
  ];
  var flyer = $('#flyer'), num = $('#meter-num'), fill = $('#meter-fill'), cout = $('#clean-out');
  var left = 0;

  function meter() {
    var secs = 1 + left;
    num.textContent = secs + 's';
    fill.style.width = (secs / 9 * 100) + '%';
  }
  function setupFlyer() {
    Array.prototype.slice.call(flyer.querySelectorAll('.junk')).forEach(function (j) { j.remove(); });
    flyer.classList.remove('clean');
    cout.textContent = '';
    JUNK.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'junk ' + it[0]; b.textContent = it[1];
      b.setAttribute('aria-label', 'הסירו: ' + it[1]);
      b.addEventListener('click', removeJunk);
      flyer.appendChild(b);
    });
    left = JUNK.length; meter();
  }
  function removeJunk(e) {
    var b = e.currentTarget;
    if (b.classList.contains('gone')) return;
    b.classList.add('gone'); b.disabled = true; b.tabIndex = -1;
    left--; meter();
    if (left === 0) { finish(); return; }
    var nextJunk = flyer.querySelector('.junk:not(.gone)');
    if (nextJunk && document.activeElement === b) nextJunk.focus();
  }
  function finish() {
    flyer.classList.add('clean');
    left = 0; meter();
    Array.prototype.slice.call(flyer.querySelectorAll('.junk')).forEach(function (j) { j.classList.add('gone'); j.disabled = true; });
    cout.textContent = 'מ־9 שניות לשנייה אחת. אותו עסק, אותו מידע, רק בלי הרעש. כמה זמן לוקח להבין את העסק שלכם? ';
    var a = document.createElement('a'); a.href = '#contact'; a.className = 'clean-cta'; a.textContent = 'דברו איתי ←';
    cout.appendChild(a);
  }
  $('#clean-skip').addEventListener('click', finish);
  $('#clean-restart').addEventListener('click', function () { setupFlyer(); flyer.querySelector('.junk').focus(); });
  setupFlyer();
})();
