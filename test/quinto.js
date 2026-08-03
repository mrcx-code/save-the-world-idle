// WHERE THE BRIGHTNESS IN THE BOTTOM TWO FIFTHS ACTUALLY COMES FROM.
// Run: node test/quinto.js
//
// `board.js` says the profile top->ground is 136 125 111 115 99 against the board's
// 141 101 83 60 66, i.e. fifths 4 and 5 are 55 and 33 points too bright. That is a number
// about a STRIP, and a strip is not a thing you can paint. This splits each fifth by EXACT
// PIXEL COLOUR and maps the colour back to the palette entry that produced it, so "the
// brightness lives in X" is an attribution instead of a guess. Anything drawn with an alpha
// overlay lands in "outros" and is reported as such rather than silently attributed.
//
// Same window as board.js: below the HUD bar, down to GROUND+22.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
(async () => {
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    S.introSeen = true; document.getElementById('lore').classList.add('escondido');
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; };
  });
  const SAO = { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' };
  const horas = process.env.HORAS ? JSON.parse(process.env.HORAS) : [['MANHA', 0], ['NOITE', 0.75]];
  for (const [nome, frac] of horas) {
    const r = await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
      chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG;
      worldX = 4000; animT = 100; QUADRO();
      const cv = document.querySelector('canvas'), g = cv.getContext('2d');
      const topo = Math.round(document.getElementById('barraTopo').getBoundingClientRect().bottom / (window.innerWidth / W));
      const y0 = topo, y1 = Math.min(cv.height, GROUND + 22);
      const d = g.getImageData(0, y0, cv.width, y1 - y0).data;
      const alt = y1 - y0;
      // name every colour the palette can put on the screen, once
      const P = pal(worldHealth());
      const nome = {};
      const por = function (k, v) {
        if (typeof v === 'string' && v.indexOf('rgb(') === 0) { if (!nome[v]) nome[v] = k; }
        else if (Array.isArray(v)) v.forEach(function (u, i) { por(k + '[' + i + ']', u); });
      };
      Object.keys(P).forEach(function (k) { por(k, P[k]); });
      // HOW MUCH OF EACH FIFTH IS STILL BARE SKY, and what that sky is worth. The board's
      // fourth fifth is 60 and contains no sky at all — it is the lower facades of a street
      // between two buildings. Ours cannot go there by paint however dark the paint is: a
      // fifth that is s% sky at luma Lc has a floor of s*Lc even if every drawn pixel in it
      // goes to zero. This is the difference between "we have not painted it dark enough"
      // and "the board is a different picture", and it is the one thing a strip average
      // cannot tell you.
      const sc = skyCanvas(worldHealth());
      const sd = sc.getContext('2d').getImageData(0, 0, sc.width, sc.height).data;
      const quintos = [];
      for (let q = 0; q < 5; q++) {
        const ya = Math.floor(alt * q / 5), yb = Math.floor(alt * (q + 1) / 5);
        const cont = {}; let s = 0, n = 0, nCeu = 0, sCeu = 0;
        for (let y = ya; y < yb; y++) for (let x = 0; x < cv.width; x++) {
          const i = (y * cv.width + x) * 4, j = ((y + y0) * sc.width + x) * 4;
          if (y + y0 < sc.height && d[i] === sd[j] && d[i + 1] === sd[j + 1] && d[i + 2] === sd[j + 2]) {
            nCeu++; sCeu += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          }
        }
        for (let y = ya; y < yb; y++) for (let x = 0; x < cv.width; x++) {
          const i = (y * cv.width + x) * 4;
          const key = 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')';
          const L = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          if (!cont[key]) cont[key] = { n: 0, L: L, sy: 0, ymin: 1e9, ymax: -1 };
          cont[key].n++; cont[key].sy += y + y0; s += L; n++;
          if (y + y0 < cont[key].ymin) cont[key].ymin = y + y0;
          if (y + y0 > cont[key].ymax) cont[key].ymax = y + y0;
        }
        const lista = Object.keys(cont).map(function (k) {
          return { cor: k, n: cont[k].n, L: cont[k].L, nome: nome[k] || '?',
            yc: cont[k].sy / cont[k].n, ymin: cont[k].ymin, ymax: cont[k].ymax };
        }).sort(function (a, b) { return b.n - a.n; });
        quintos.push({ q: q + 1, y0: y0 + ya, y1: y0 + yb, luma: s / n, n: n, top: lista.slice(0, 30),
          ceu: nCeu / n, ceuL: nCeu ? sCeu / nCeu : 0, piso: nCeu ? sCeu / n : 0,
          nomeados: lista.filter(function (t) { return t.nome !== '?'; }).reduce(function (a, t) { return a + t.n; }, 0) / n });
      }
      return { ground: GROUND, topo: topo, quintos: quintos };
    }, { st: SAO, frac });
    console.log('=== ' + nome + '  (janela y' + r.topo + '..' + (r.ground + 22) + ', GROUND ' + r.ground + ') ===');
    for (const q of r.quintos) {
      console.log(' quinto ' + q.q + '  y' + q.y0 + '-' + q.y1 + '  luma ' + q.luma.toFixed(1) +
        '   nomeados ' + (q.nomeados * 100).toFixed(0) + '%' +
        '   ceu aberto ' + (q.ceu * 100).toFixed(1) + '% a L ' + q.ceuL.toFixed(0) +
        ' -> piso do quinto ' + q.piso.toFixed(1));
      for (const t of q.top) {
        const contrib = t.n / q.n * t.L;
        console.log('    ' + (t.n / q.n * 100).toFixed(1).padStart(5) + '%  L ' + t.L.toFixed(0).padStart(3) +
          '  contrib ' + contrib.toFixed(1).padStart(5) + '  y' + t.ymin + '-' + t.ymax +
          ' (c ' + t.yc.toFixed(0) + ')  ' + t.cor.padEnd(18) + ' ' + t.nome);
      }
    }
  }
  await browser.close();
})();
