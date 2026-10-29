const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- הפתיחה: המילה Way נגררת ---- */
const way = $('#way'); let wx = 0, wy = 0, drag = null;
const put = () => (way.style.transform = `translate(${wx}px,${wy}px)`);
way.addEventListener('pointerdown', (e) => { drag = { x: e.clientX - wx, y: e.clientY - wy }; way.setPointerCapture(e.pointerId); });
way.addEventListener('pointermove', (e) => { if (!drag) return; wx = e.clientX - drag.x; wy = e.clientY - drag.y; put(); });
way.addEventListener('pointerup', () => (drag = null));
way.addEventListener('dblclick', () => { wx = wy = 0; put(); });
way.addEventListener('keydown', (e) => {
  const d = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[e.key];
  if (d) { e.preventDefault(); wx += d[0]; wy += d[1]; put(); } else if (e.key === 'Home') { wx = wy = 0; put(); }
});

/* ---- המגרש ---- */
const cv = $('#cv'), ctx = cv.getContext('2d'), W = 1080, G = W / 6;
cv.width = cv.height = W;
const FONT = 'aktiv-grotesk, Arial, sans-serif', WEIGHTS = [300, 400, 600, 900];
const PAL = [
  ['#f2ede3', '#2b2f30', '#b55d2f', '#203248'], ['#2b2f30', '#f2ede3', '#baad99', '#b55d2f'],
  ['#b55d2f', '#f2ede3', '#2b2f30', '#203248'], ['#baad99', '#2b2f30', '#544b42', '#f2ede3'],
  ['#203248', '#f2ede3', '#b55d2f', '#baad99'],
];
let pal = 0, items = [], sel = 0;
const say = (t) => ($('#st').textContent = t);
const rnd = (a) => a[Math.floor(Math.random() * a.length)];

function build(text) {
  const cs = Array.from(text.trim() || 'MAZE'), n = cs.length;
  items = cs.map((ch, i) => ({ ch, x: (W / (n + 1)) * (i + 1), y: W / 2, s: Math.min(380, 1100 / n), r: 0, w: 900, c: 0 }));
  sel = 0; draw();
}
function box(it) { ctx.font = `${it.w} ${it.s}px ${FONT}`; return { w: ctx.measureText(it.ch).width, h: it.s * 0.8 }; }
function draw(guides = true) {
  const p = PAL[pal];
  ctx.fillStyle = p[0]; ctx.fillRect(0, 0, W, W);
  if (guides) {
    ctx.strokeStyle = p[1] + '26'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 1; i < 6; i++) { ctx.moveTo(i * G, 0); ctx.lineTo(i * G, W); ctx.moveTo(0, i * G); ctx.lineTo(W, i * G); }
    ctx.stroke();
  }
  items.forEach((it, i) => {
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.r);
    ctx.font = `${it.w} ${it.s}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = p[1 + (it.c % 3)]; ctx.fillText(it.ch, 0, 0);
    if (guides && i === sel) { const b = box(it); ctx.strokeStyle = p[2]; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.strokeRect(-b.w / 2 - 12, -b.h / 2 - 12, b.w + 24, b.h + 24); }
    ctx.restore();
  });
}
const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * W }; };
function hit(q) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i], b = box(it), dx = q.x - it.x, dy = q.y - it.y, c = Math.cos(-it.r), s = Math.sin(-it.r);
    if (Math.abs(dx * c - dy * s) < b.w / 2 + 12 && Math.abs(dx * s + dy * c) < b.h / 2 + 12) return i;
  }
  return -1;
}
let off = null;
cv.addEventListener('pointerdown', (e) => {
  const q = pt(e), i = hit(q); if (i < 0) return;
  sel = i; off = { x: q.x - items[i].x, y: q.y - items[i].y }; cv.setPointerCapture(e.pointerId); draw();
});
cv.addEventListener('pointermove', (e) => { if (!off) return; const q = pt(e); items[sel].x = q.x - off.x; items[sel].y = q.y - off.y; draw(); });
cv.addEventListener('pointerup', () => (off = null));

const A = {
  prev: () => (sel = (sel + items.length - 1) % items.length), next: () => (sel = (sel + 1) % items.length),
  grow: () => (items[sel].s = Math.min(900, items[sel].s * 1.12)), shrink: () => (items[sel].s = Math.max(40, items[sel].s / 1.12)),
  rot: () => (items[sel].r += Math.PI / 12), color: () => items[sel].c++,
  weight: () => (items[sel].w = WEIGHTS[(WEIGHTS.indexOf(items[sel].w) + 1) % 4]),
  remix: () => { items.forEach((it) => { it.x = G * (0.5 + Math.floor(Math.random() * 6)); it.y = G * (0.5 + Math.floor(Math.random() * 6)); it.r = rnd([-1, 0, 0, 1]) * (Math.PI / 12) * rnd([1, 2, 3, 6]); it.s = rnd([140, 260, 400, 560]); it.w = rnd(WEIGHTS); it.c = Math.floor(Math.random() * 3); }); },
  reset: () => build($('#word').value),
  save: () => { draw(false); cv.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'maze-composition.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); say('התמונה נשמרה במכשיר.'); draw(); }); },
};
const MSG = { remix: 'הגריד נשבר. אפשר לנסות שוב.', reset: 'הקומפוזיציה אופסה.' };
$$('[data-act]').forEach((b) => b.addEventListener('click', () => { A[b.dataset.act](); if (b.dataset.act !== 'save') { draw(); say(MSG[b.dataset.act] || `אות ${sel + 1} מתוך ${items.length}`); } }));
$$('[data-pal]').forEach((b) => b.addEventListener('click', () => { pal = +b.dataset.pal; draw(); say('סט הצבעים הוחלף.'); }));
$('#word').addEventListener('input', (e) => build(e.target.value));
cv.addEventListener('keydown', (e) => {
  const it = items[sel], mv = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30] }[e.key];
  if (mv) { e.preventDefault(); it.x += mv[0]; it.y += mv[1]; }
  else if (e.key === '+' || e.key === '=') A.grow(); else if (e.key === '-') A.shrink();
  else if (e.key.toLowerCase() === 'r') A.rot(); else if (e.key === ']') A.next(); else if (e.key === '[') A.prev(); else return;
  draw();
});
build('MAZE');
document.fonts?.load(`900 100px ${FONT}`).then(() => draw()).catch(() => {});
document.fonts?.ready.then(() => draw());

/* ---- פרויקטים מעל העמוד ---- */
const dlg = $('#dlg'); let opener = null, pushed = false;
const show = (id) => { $$('article', dlg).forEach((a) => (a.hidden = a.dataset.id !== id)); if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0; };
$$('[data-open]').forEach((b) => b.addEventListener('click', () => { opener = b; history.pushState(null, '', '#' + b.dataset.open); pushed = true; show(b.dataset.open); }));
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('close', () => {
  if (pushed) { pushed = false; history.back(); } else if (location.hash.startsWith('#project-')) history.replaceState(null, '', location.pathname);
  opener?.focus();
});
addEventListener('popstate', () => { const h = location.hash.slice(1); if (h.startsWith('project-')) show(h); else if (dlg.open) { pushed = false; dlg.close(); } });
if (location.hash.startsWith('#project-')) show(location.hash.slice(1));
