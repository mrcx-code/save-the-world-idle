// Measurement harness for the visual pass. Not part of the smoke test.
// Run: node test/medir.js
//
// It answers two questions with numbers instead of screenshots:
//
//  (1) ONE LIGHTING REGIME. At NOITE, nothing in the world should look like it is standing
//      in daylight except things that are genuinely emitting. So: over the world band of a
//      healed street at NOITE, how much of it is still as bright as the same band at MANHÃ?
//      Reported as mean luma, the 99.5th percentile, and the share of pixels above the
//      daylight threshold (luma 150) — the last one is the leak, because at night only
//      lamps, lit windows and the Cetro have any business being up there.
//
//  (2) DOES THE HERO READ FIRST. Worst case frame: healed street, three monsters queued,
//      the particle field saturated, decorations and neighbours at their densest. Every
//      hero-sized block on a grid over the world band is scored by LOCAL CONTRAST — the
//      absolute difference between the block's mean luma and the mean luma of the ring of
//      background around it, which is the cheapest defensible stand-in for "what the eye
//      lands on first". The hero reads first if his block scores highest. We report his
//      score, his rank, and the strongest competitor.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}

const MEDE = function () {
  // returns a luma plane of the game canvas plus the geometry needed to place the hero
  const cv = document.querySelector('canvas');
  const g = cv.getContext('2d');
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  const n = cv.width * cv.height, L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
  }
  return { w: cv.width, h: cv.height, L: Array.from(L), ground: GROUND, hx: HX };
};

function estat(p, y0, y1) {
  const v = [];
  for (let y = y0; y < y1; y++) for (let x = 0; x < p.w; x++) v.push(p.L[y * p.w + x]);
  v.sort(function (a, b) { return a - b; });
  const media = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
  const p995 = v[Math.floor(v.length * 0.995)];
  const claros = v.filter(function (a) { return a > 150; }).length / v.length;
  return { media: media, p995: p995, claros: claros * 100 };
}

// Centre–surround, the way it is actually worth measuring: NOT the difference of the two
// means (a hero who is half cream and half dark trouser averages to his own background and
// scores zero, which is the first thing this harness told me and it was measuring nothing).
// The score is the MEAN ABSOLUTE DEVIATION of the block's pixels from the mean luma of the
// ring around it — how far, on average, the stuff inside stands off the stuff outside. A
// flat patch of wall scores near zero however bright it is; a light-and-dark figure on a
// mid-value street scores high, which is the read we are actually asking about.
function bloco(p, x0, y0, bw, bh) {
  const m = 7;
  let s2 = 0, n2 = 0;
  for (let y = y0 - m; y < y0 + bh + m; y++) for (let x = x0 - m; x < x0 + bw + m; x++) {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) continue;
    if (x >= x0 && x < x0 + bw && y >= y0 && y < y0 + bh) continue;
    s2 += p.L[y * p.w + x]; n2++;
  }
  const fora = n2 ? s2 / n2 : 0;
  let s = 0, n = 0;
  for (let y = y0; y < y0 + bh; y++) for (let x = x0; x < x0 + bw; x++) {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) continue;
    s += Math.abs(p.L[y * p.w + x] - fora); n++;
  }
  return n ? s / n : 0;
}

const HW = 22, HH = 34;                       // the hero's own footprint, in world pixels
function legibilidade(p) {
  const hx0 = p.hx - 4, hy0 = p.ground - HH;
  const heroi = bloco(p, hx0, hy0, HW, HH);
  let melhor = 0, ondeX = 0, ondeY = 0, acima = 0, total = 0;
  for (let y = 8; y + HH < p.ground + 16; y += 5) {
    for (let x = 0; x + HW < p.w; x += 5) {
      if (Math.abs(x - hx0) < HW && Math.abs(y - hy0) < HH) continue;  // skip the hero himself
      const v = bloco(p, x, y, HW, HH);
      total++;
      if (v > heroi) acima++;
      if (v > melhor) { melhor = v; ondeX = x; ondeY = y; }
    }
  }
  return { heroi: heroi, rival: melhor, rivalX: ondeX, rivalY: ondeY, posicao: acima + 1, total: total + 1 };
}

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate(() => { S.introSeen = true; document.getElementById('lore').classList.add('escondido'); });

  const SAO = { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' };

  // ---- (1) the two hours, quiet street ----
  const horas = [['MANHA', 0], ['TARDE', 0.25], ['POSCHUVA', 0.5], ['NOITE', 0.75]];
  for (const [nome, frac] of horas) {
    await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
      chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG; desenhar();
    }, { st: SAO, frac });
    await page.waitForTimeout(250);
    const p = await page.evaluate(MEDE);
    const e = estat(p, 0, p.ground + 20);
    console.log('LUZ  ' + nome.padEnd(9) + ' media ' + e.media.toFixed(1) +
      '  p99.5 ' + e.p995.toFixed(1) + '  >150 ' + e.claros.toFixed(2) + '%');
  }

  // ---- (2) the worst-case frame ----
  for (const [nome, frac] of [['MANHA', 0], ['NOITE', 0.75]]) {
    await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); relogio = frac * DIA_SEG;
      mobs.length = 0; drops.length = 0; chamada = null; cartaoT = 0; S.capVisto = 9;
      // three monsters queued across the lane, one of each kind
      ['smog', 'barrel', 'cash'].forEach(function (t, i) {
        mobs.push({ type: t, wx: worldX + W * (0.52 + i * 0.16), hp: 6, hpMax: 6, flash: 0, t: i * 9 });
      });
      // and the particle field at its cap
      parts.length = 0;
      for (let i = 0; i < 190; i++) {
        parts.push({ x: Math.random() * W, y: Math.random() * (GROUND + 10),
          vx: -8, vy: 4, life: 5, amb: 1,
          c: i % 3 === 0 ? '#6fdd94' : i % 3 === 1 ? '#ff7d9c' : '#b0a08a', grav: 0 });
      }
      desenhar();
    }, { st: SAO, frac });
    await page.waitForTimeout(120);
    const p = await page.evaluate(MEDE);
    const r = legibilidade(p);
    console.log('LER  ' + nome.padEnd(9) + ' heroi ' + r.heroi.toFixed(1) +
      '  maior rival ' + r.rival.toFixed(1) + ' em (' + r.rivalX + ',' + r.rivalY + ')' +
      '  posicao ' + r.posicao + '/' + r.total);
  }
  await browser.close();
})();
