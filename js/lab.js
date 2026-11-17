/* MAZE · lab: type playground */
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

})();
