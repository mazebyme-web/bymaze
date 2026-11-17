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

  // ---------- 02 · Choose the better layout ----------
  var ROUNDS = [
    { bad: 'flat', why: 'היררכיה: כשהשם גדול ובולט, המבקר מבין תוך שנייה מה העסק. כשהכול באותו גודל, אין מאיפה להתחיל לקרוא.' },
    { bad: 'mixed', why: 'יישור: כשכל הפרטים נשענים על אותו קו, העין זורמת בלי מאמץ. יישורים מעורבבים נראים מקריים, גם כשהתוכן זהה.' },
    { bad: 'low', why: 'ניגודיות: טקסט בהיר על רקע כהה נקרא בקלות. טקסט בגוון קרוב לרקע מעייף את העין ופוגע בנגישות.' }
  ];
  var pick = $('#pick'), out = $('#pick-out'), step = $('#pick-step'), next = $('#pick-next');
  var round = 0, score = 0, answered = false;

  function mini(kind) {
    var m = document.createElement('div');
    m.className = 'mini ' + kind; m.lang = 'he'; m.dir = 'rtl';
    m.innerHTML = '<b>קרמיקה נועה</b><span>סדנאות וחוגים בחיפה</span><ul><li>הרצל 12, חיפה</li><li>050-0000000</li><li><bdi>@noa.ceramics</bdi></li></ul><u>להרשמה</u>';
    return m;
  }

  function build() {
    var r = ROUNDS[round], goodFirst = Math.random() < .5;
    answered = false;
    pick.textContent = ''; out.textContent = ''; next.hidden = true;
    step.textContent = 'ROUND ' + (round + 1) + ' OF ' + ROUNDS.length;
    ['A', 'B'].forEach(function (label, i) {
      var good = (i === 0) === goodFirst;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.dataset.good = good ? '1' : '0';
      b.setAttribute('aria-label', 'Layout ' + label);
      var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = label;
      b.appendChild(tag); b.appendChild(mini(good ? 'good' : r.bad));
      b.addEventListener('click', choose);
      pick.appendChild(b);
    });
  }

  function choose(e) {
    if (answered) return;
    answered = true;
    var b = e.currentTarget, right = b.dataset.good === '1';
    if (right) score++;
    Array.prototype.forEach.call(pick.children, function (x) {
      x.disabled = true;
      x.classList.add(x.dataset.good === '1' ? 'is-better' : 'is-worse');
      if (x.dataset.good === '1') x.querySelector('.tag').textContent += ' ✓';
    });
    out.textContent = (right ? 'נכון. ' : 'הפעם הגרסה השנייה עובדת טוב יותר. ') + ROUNDS[round].why;
    if (round < ROUNDS.length - 1) { next.textContent = 'NEXT'; next.hidden = false; next.focus(); }
    else { end(); }
  }

  function end() {
    step.textContent = 'DONE · ' + score + ' OF ' + ROUNDS.length;
    var p = document.createElement('p'); p.className = 'he'; p.lang = 'he'; p.dir = 'rtl';
    p.textContent = 'ככה בדיוק נראית חשיבה עיצובית: החלטות קטנות שמשנות את ההבנה. ';
    var a = document.createElement('a'); a.href = '#contact'; a.textContent = 'רוצים את זה לעסק שלכם?';
    p.appendChild(a);
    out.after(p); p.className += ' pick-end';
  }

  next.addEventListener('click', function () {
    if (!answered || round >= ROUNDS.length - 1) return;
    round++; build(); pick.firstChild.focus();
  });
  $('#pick-restart').addEventListener('click', function () {
    var old = document.querySelector('.pick-end'); if (old) old.remove();
    round = 0; score = 0; build();
  });
  build();
})();
