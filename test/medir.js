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
//
//      THE MEASURE USED TO BE BLIND TO COLOUR, and the art direction is not: the board
//      separates sick from healed on CHROMA, not on value, and the hero is meant to be the
//      one saturated figure on a muted street. A luma-only score cannot see that at all.
//      So every block is now scored three ways over the same grid:
//        LUMA  — mean |L − ring L|, exactly as before, so the old numbers stay comparable
//        CROMA — mean distance of the block's pixels from the ring's mean (a*,b*), i.e.
//                how far the colour inside stands off the colour outside, value ignored
//        DE    — mean CIE76 distance in full L*a*b*, the two together
//      Plus a plain chroma reading (mean C* of a region) so "the only saturated thing in
//      the frame" can be checked as a fact instead of asserted.
//
//  (3) THE HEALTH PIPS. They are game signal and so they are deliberately outside the
//      lighting sweep. That is only correct while they do not become the loudest thing in
//      a night frame. Measured by rendering the worst case twice, with the mobs and
//      without, and diffing the world band: how many pixels the pips add above luma 150
//      and above 200, their peak luma, and where that sits against the Cetro's core.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}

const MEDE = function () {
  // returns a luma plane of the game canvas, the CIELAB planes beside it, plus the
  // geometry needed to place the hero. L stays plain Rec.709 luma on 0..255 so every
  // number the earlier waves recorded still means the same thing; Ls/A/B are L*a*b*.
  const cv = document.querySelector('canvas');
  const g = cv.getContext('2d');
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  const n = cv.width * cv.height;
  const L = new Float32Array(n), Ls = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
  const lin = function (u) { u /= 255; return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
  const f = function (t) { return t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116); };
  for (let i = 0; i < n; i++) {
    const r = d[i * 4], g2 = d[i * 4 + 1], b = d[i * 4 + 2];
    L[i] = 0.2126 * r + 0.7152 * g2 + 0.0722 * b;
    const rl = lin(r), gl = lin(g2), bl = lin(b);
    const X = (0.4124 * rl + 0.3576 * gl + 0.1805 * bl) / 0.95047;
    const Y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    const Z = (0.0193 * rl + 0.1192 * gl + 0.9505 * bl) / 1.08883;
    const fx = f(X), fy = f(Y), fz = f(Z);
    Ls[i] = 116 * fy - 16; A[i] = 500 * (fx - fy); B[i] = 200 * (fy - fz);
  }
  const q = function (a) { const o = new Array(n); for (let i = 0; i < n; i++) o[i] = Math.round(a[i] * 10) / 10; return o; };
  return { w: cv.width, h: cv.height, L: q(L), Ls: q(Ls), A: q(A), B: q(B), ground: GROUND, hx: HX };
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
// One pass over centre and surround, three scores out of it. `luma` is the original
// measure, unchanged. `croma` is the same idea run in the (a*,b*) plane only — the mean
// distance of the block's pixels from the ring's mean colour, with value thrown away, so
// a grey figure on a grey street scores zero however light it is and a saturated figure
// on a muted street scores high however close its value sits. `de` is CIE76 over all
// three axes: what the eye actually gets. `cstar` is the block's own mean chroma, which
// is not a contrast at all — it is there to check the "he is the only saturated thing in
// the frame" claim against the frame.
function bloco(p, x0, y0, bw, bh) {
  const m = 7;
  let sl = 0, sa = 0, sb = 0, sls = 0, n2 = 0;
  for (let y = y0 - m; y < y0 + bh + m; y++) for (let x = x0 - m; x < x0 + bw + m; x++) {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) continue;
    if (x >= x0 && x < x0 + bw && y >= y0 && y < y0 + bh) continue;
    const i = y * p.w + x;
    sl += p.L[i]; sls += p.Ls[i]; sa += p.A[i]; sb += p.B[i]; n2++;
  }
  const fL = n2 ? sl / n2 : 0, fLs = n2 ? sls / n2 : 0, fA = n2 ? sa / n2 : 0, fB = n2 ? sb / n2 : 0;
  let l = 0, c = 0, e = 0, cs = 0, n = 0;
  for (let y = y0; y < y0 + bh; y++) for (let x = x0; x < x0 + bw; x++) {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) continue;
    const i = y * p.w + x, da = p.A[i] - fA, db = p.B[i] - fB, dl = p.Ls[i] - fLs;
    l += Math.abs(p.L[i] - fL);
    c += Math.sqrt(da * da + db * db);
    e += Math.sqrt(dl * dl + da * da + db * db);
    cs += Math.sqrt(p.A[i] * p.A[i] + p.B[i] * p.B[i]);
    n++;
  }
  return n ? { luma: l / n, croma: c / n, de: e / n, cstar: cs / n }
           : { luma: 0, croma: 0, de: 0, cstar: 0 };
}
// mean C* over a rectangle — a plain reading, no surround
function croma(p, y0, y1) {
  let s = 0, n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < p.w; x++) {
    const i = y * p.w + x; s += Math.sqrt(p.A[i] * p.A[i] + p.B[i] * p.B[i]); n++;
  }
  return n ? s / n : 0;
}

const HW = 22, HH = 34;                       // the hero's own footprint, in world pixels
const EIXOS = ['luma', 'croma', 'de'];
function legibilidade(p) {
  const hx0 = p.hx - 4, hy0 = p.ground - HH;
  const heroi = bloco(p, hx0, hy0, HW, HH);
  const todos = [];
  // the proscenium: the foliage frame closing both edges is architecture, not a prop
  // competing for the eye, so it is counted separately rather than quietly excluded
  const margem = Math.round(p.w * 0.16);
  for (let y = 8; y + HH < p.ground + 16; y += 5) {
    for (let x = 0; x + HW < p.w; x += 5) {
      if (Math.abs(x - hx0) < HW && Math.abs(y - hy0) < HH) continue;  // skip the hero himself
      const v = bloco(p, x, y, HW, HH);
      // The proscenium closes THREE sides now, not two, so a block lying against the top
      // edge is frame for the same reason a block in the side columns is. This is a
      // positional rule and it applies to whatever happens to be up there — before the
      // canopy the top-of-frame block at (100,8) was already the strongest rival in the
      // picture, at 64.0, because that is where the sun's corona sits.
      v.x = x; v.y = y; v.m = x < margem || x + HW > p.w - margem || y < 16;
      todos.push(v);
    }
  }
  const eixo = {};
  EIXOS.forEach(function (k) {
    const ord = todos.slice().sort(function (a, b) { return b[k] - a[k]; });
    eixo[k] = {
      heroi: heroi[k],
      posicao: todos.filter(function (t) { return t[k] > heroi[k]; }).length + 1,
      total: todos.length + 1,
      posicaoP: todos.filter(function (t) { return !t.m && t[k] > heroi[k]; }).length + 1,
      totalP: todos.filter(function (t) { return !t.m; }).length + 1,
      topo: ord.slice(0, 3),
      topoP: ord.filter(function (t) { return !t.m; }).slice(0, 3)
    };
  });
  return { eixo: eixo, cstarHeroi: heroi.cstar, blocos: todos };
}

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate(() => { S.introSeen = true; document.getElementById('lore').classList.add('escondido'); });

  // The street scrolls and the props sway, so two runs of this harness never framed quite
  // the same picture and the before/after numbers were never quite comparable. Pinned:
  // one fixed stretch of street, one fixed phase of every sway, one seeded particle field.
  await page.evaluate(() => {
    window.FIXO_X = 4000; window.FIXO_T = 100;
    // `desenhar()` is the HUD, not the picture: the canvas is painted by `drawScene()` +
    // `desenharMundo()` from the rAF loop, so every earlier prep here was measuring
    // whatever frame the loop happened to have left behind. And the loop advances worldX
    // and animT on every tick, which is what un-pinned the pinning. Frozen and explicit.
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; };
  });
  // The game's own loop keeps running, so "set up the frame, wait, then read the canvas"
  // was reading a different frame from the one that was set up — mobs respawned into the
  // no-mob control and the street had scrolled. MEDE is installed IN the page so setup and
  // read happen inside one evaluate and nothing can interleave.
  await page.evaluate('window.MEDE = ' + MEDE.toString());

  const SAO = { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' };

  // ---- (1) the two hours, quiet street ----
  const horas = [['MANHA', 0], ['TARDE', 0.25], ['POSCHUVA', 0.5], ['NOITE', 0.75]];
  for (const [nome, frac] of horas) {
    const p = await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
      chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG;
      worldX = FIXO_X; animT = FIXO_T; QUADRO(); return MEDE();
    }, { st: SAO, frac });
    const e = estat(p, 0, p.ground + 20);
    console.log('LUZ  ' + nome.padEnd(9) + ' media ' + e.media.toFixed(1) +
      '  p99.5 ' + e.p995.toFixed(1) + '  >150 ' + e.claros.toFixed(2) + '%' +
      '  C* ' + croma(p, 0, p.ground + 20).toFixed(1));
  }

  // ---- (1b) the arc the board actually runs on: sick -> healed, at one fixed hour, is it
  // a chroma move or a value move? The direction says chroma. Now it is a number.
  for (const [nome, st] of [['DOENTE', { geradores: 2, energia: 40, energiaTotal: 40, poluicao: 900, modo: 'sujo' }],
                            ['SA', SAO]]) {
    for (const [h, frac] of [['MANHA', 0], ['NOITE', 0.75]]) {
      const p = await page.evaluate(({ st, frac }) => {
        Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
        chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG;
        worldX = FIXO_X; animT = FIXO_T; QUADRO(); return MEDE();
      }, { st: st, frac: frac });
      const e = estat(p, 0, p.ground + 20);
      console.log('ARCO ' + (nome + '/' + h).padEnd(14) + ' luma ' + e.media.toFixed(1) +
        '  C* ' + croma(p, 0, p.ground + 20).toFixed(1));
    }
  }

  // ---- (1c) WHERE THE FRAME IS EMPTY. "The sky is the largest area and the least
  // authored" was an impression three waves running. Split the world canvas into bands and
  // score each one the way blocks are scored — mean local contrast over a grid — so "least
  // authored" means "fewest events per pixel" instead of "looks bare to me".
  for (const [nome, frac] of [['MANHA', 0], ['NOITE', 0.75]]) {
    const p = await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
      chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG;
      worldX = FIXO_X; animT = FIXO_T; QUADRO(); return MEDE();
    }, { st: SAO, frac });
    // the horizon line is GROUND; the skyline and the ridges live in the ~40 px above it
    const faixas = [['CEU alto', 4, Math.round(p.ground * 0.45)],
                    ['CEU baixo', Math.round(p.ground * 0.45), p.ground - 42],
                    ['HORIZONTE', p.ground - 42, p.ground - 8],
                    ['RUA', p.ground - 8, Math.min(p.h, p.ground + 22)]];
    const linha = [];
    for (const [fn, y0, y1] of faixas) {
      let s = 0, n = 0;
      for (let y = y0; y + 12 < y1; y += 6) for (let x = 0; x + 12 < p.w; x += 6) { s += bloco(p, x, y, 12, 12).de; n++; }
      linha.push(fn + ' ' + ((y1 - y0) / (p.ground + 22) * 100).toFixed(0) + '% do quadro, dE local ' +
        (n ? s / n : 0).toFixed(1) + ', C* ' + croma(p, y0, y1).toFixed(1));
    }
    console.log('FAIXA ' + nome + '  ' + linha.join('  |  '));
  }

  // ---- (2) the worst-case frame ----
  // the worst case as a page-side function, so the frame that is measured, the frame that
  // is screenshotted and the no-mob control are all built by the same code from the same seed
  await page.evaluate(({ st }) => {
    window.PIOR = function (frac, comMobs) {
      Object.assign(S, st); relogio = frac * DIA_SEG;
      worldX = FIXO_X; animT = FIXO_T;
      mobs.length = 0; drops.length = 0; chamada = null; cartaoT = 0; S.capVisto = 9;
      // three monsters queued across the lane, one of each kind
      if (comMobs) ['smog', 'barrel', 'cash'].forEach(function (t, i) {
        mobs.push({ type: t, wx: worldX + W * (0.52 + i * 0.16), hp: 6, hpMax: 6, flash: 0, t: i * 9 });
      });
      // and the particle field at its cap
      parts.length = 0;
      let sem = 12345;
      const rnd = function () { sem = (sem * 1103515 + 12345) % 2147483647; return sem / 2147483647; };
      for (let i = 0; i < 190; i++) {
        parts.push({ x: rnd() * W, y: rnd() * (GROUND + 10),
          vx: -8, vy: 4, life: 5, amb: 1,
          c: i % 3 === 0 ? '#6fdd94' : i % 3 === 1 ? '#ff7d9c' : '#b0a08a', grav: 0 });
      }
      QUADRO();
    };
  }, { st: SAO });
  for (const [nome, frac] of [['MANHA', 0], ['NOITE', 0.75]]) {
    const p = await page.evaluate(f => { PIOR(f, true); return MEDE(); }, frac);
    await page.evaluate(f => PIOR(f, true), frac);
    await page.screenshot({ path: path.resolve(__dirname, '..', 'medida-pior-' + nome.toLowerCase() + '.png') });
    const r = legibilidade(p);
    const cq = croma(p, 0, p.ground + 20);
    console.log('LER  ' + nome + '   C* do heroi ' + r.cstarHeroi.toFixed(1) +
      ' contra C* do quadro ' + cq.toFixed(1) + '  (razao ' + (r.cstarHeroi / cq).toFixed(2) + ')');
    EIXOS.forEach(function (k) {
      const e = r.eixo[k];
      const fmt = function (t) { return t[k].toFixed(1) + '@(' + t.x + ',' + t.y + ')' + (t.m ? 'M' : ''); };
      console.log('  ' + k.toUpperCase().padEnd(5) + ' heroi ' + e.heroi.toFixed(1).padStart(5) +
        '  posicao ' + String(e.posicao).padStart(3) + '/' + e.total +
        '  (fora da moldura ' + e.posicaoP + '/' + e.totalP + ')' +
        '  razao heroi/rival ' + (e.heroi / e.topo[0][k]).toFixed(2));
      console.log('        rivais ' + e.topo.map(fmt).join('  ') +
        '  |  dentro do quadro ' + e.topoP.map(fmt).join('  '));
    });
    // ---- the health pips, isolated: the same frame drawn without the mobs, diffed over
    // the world band. Whatever the mobs add above luma 150/200 at NOITE is body + pips,
    // and at NOITE the bodies take the hour while the pips do not, so the top of that
    // difference IS the pips.
    const p0 = await page.evaluate(f => { PIOR(f, false); return MEDE(); }, frac);
    const conta = function (q, lim) {
      let n = 0; for (let y = 0; y < q.ground + 20; y++) for (let x = 0; x < q.w; x++) if (q.L[y * q.w + x] > lim) n++;
      return n;
    };
    const pico = function (q) {
      let m = 0; for (let y = 0; y < q.ground + 20; y++) for (let x = 0; x < q.w; x++) m = Math.max(m, q.L[y * q.w + x]);
      return m;
    };
    // and the pips alone: only the pixels the mobs put there, and only the light ones —
    // a night monster body is floored at 0.26 and cannot reach 150, so above that line
    // what the mobs add is the readout and nothing else.
    let picoM = 0, nM150 = 0, nM200 = 0;
    for (let y = 0; y < p.ground + 20; y++) for (let x = 0; x < p.w; x++) {
      const i = y * p.w + x;
      if (Math.abs(p.L[i] - p0.L[i]) < 3) continue;
      if (p.L[i] > 150) { nM150++; if (p.L[i] > picoM) picoM = p.L[i]; }
      if (p.L[i] > 200) nM200++;
    }
    console.log('PIPS ' + nome + '  faixa do mundo: com mobs >150 ' + conta(p, 150) + ' px, >200 ' +
      conta(p, 200) + ' px, pico ' + pico(p).toFixed(0) +
      '  |  sem mobs >150 ' + conta(p0, 150) + ' px, >200 ' + conta(p0, 200) +
      ' px, pico ' + pico(p0).toFixed(0));
    console.log('      so o que os mobs poem no quadro: >150 ' + nM150 + ' px  >200 ' + nM200 +
      ' px  pico ' + picoM.toFixed(0));
  }
  // ---- (3) the constraint the previous wave set: at NOITE the Cetro must stay the
  // brightest thing on him. Luma of the lit poncho against the wheel's core, the crystal
  // and the core while he is casting. If a legibility fix ever inverts this, back it out.
  const lum = await page.evaluate(() => {
    relogio = 0.75 * DIA_SEG; heroPasso = -1; heroLuzPasso();
    const L = function (s) {
      const c = s.charAt(0) === '#' ? hexA(s) : s.match(/\d+/g).map(Number);
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    return { poncho: L(hc('#f0e6c8')), madeira: L(cc('#6d4620')),
      cristal: L(CETRO.cristalL), miolo: L('#f3c05c'), conjura: L('#fffbe8') };
  });
  console.log('FONTE NOITE  poncho ' + lum.poncho.toFixed(1) +
    '  |  miolo ' + lum.miolo.toFixed(1) + '  cristal ' + lum.cristal.toFixed(1) +
    '  conjurando ' + lum.conjura.toFixed(1));
  await browser.close();
})();
