// THE REGRESSION TEST FOR A REFACTOR THAT IS NOT ALLOWED TO CHANGE A PIXEL.
// Run: node test/igual.js            -> prints one hash per cell
//      node test/igual.js > a.txt    -> before; run again after and `diff` the two
//
// Nineteen waves of measured work landed on RUA DO BAIRRO. Turning the street into a named,
// parameterised scenario moves several hundred lines of drawing code out of `drawScene()`
// and into a scenario object — and the only acceptable outcome of that move is that the
// street comes out IDENTICAL. Means and ranks cannot prove that: two frames can carry the
// same mean luma and be different pictures. Pixel identity can.
//
// So: the same twelve cells `cruz.js` prints (three health levels x four hours), the frame
// frozen exactly the way every other harness here freezes it, and a SHA-1 of the canvas
// pixels of each. A single changed pixel anywhere in any of the twelve changes a hash.
// CEN=<id> measures a different scenario; the hashes of one scenario say nothing about
// another, they are only ever compared against themselves across a commit.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const RAIZ = path.resolve(__dirname, '..');
const CEN = process.env.CEN || 'rua';
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
(async () => {
  const file = 'file://' + path.resolve(RAIZ, 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate((cen) => {
    S.introSeen = true; document.getElementById('lore').classList.add('escondido');
    if (window.setCenario) setCenario(cen);
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; };
  }, CEN);
  const niveis = [
    ['sick', { geradores: 2, energia: 300, energiaTotal: 400, poluicao: 200, modo: 'carvao' }],
    ['mid', { geradores: 18, energia: 9000, energiaTotal: 16000, poluicao: 40, modo: 'limpo' }],
    ['healed', { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' }]
  ];
  const horas = [['manha', 0], ['tarde', 0.28], ['poschuva', 0.52], ['noite', 0.78]];
  console.log('cenario ' + CEN);
  for (const [nn, st] of niveis) for (const [hn, frac] of horas) {
    const png = await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); relogio = frac * DIA_SEG; worldX = 4000; animT = 100;
      mobs.length = 0; drops.length = 0; parts.length = 0; chamada = null; cartaoT = 0; S.capVisto = 9;
      // everything that walks on its own has to be pinned or the hash is a clock: `tick`
      // drives the antenna's blink, the chimney's puffs and the ipê's falling petals, and
      // the weather easing is a function of wall time
      sprouts.length = 0; tick = 0;
      ritmoV = st.modo === 'carvao' ? 1 : 0; ritmoVirou = 0; ritmoUlt = st.modo;
      // the ambient weather spawns ash, cinders, leaves and motes with `Math.random()` from
      // inside the same `drawScene()` that then draws them, so a frame is only reproducible
      // with the dice pinned. Same seed every cell, reset before the frame.
      let _s = 12345;
      Math.random = function () { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
      ['smog', 'barrel', 'cash'].forEach(function (t, i) {
        mobs.push({ type: t, wx: worldX + W * (0.52 + i * 0.16), hp: 4 + i, hpMax: 6, flash: 0, t: i * 9 });
      });
      QUADRO();
      return document.querySelector('canvas').toDataURL('image/png');
    }, { st, frac });
    const hash = crypto.createHash('sha1').update(png).digest('hex').slice(0, 16);
    console.log((nn + '-' + hn).padEnd(16) + hash);
  }
  if (errs.length) console.log(errs.join('\n'));
  await browser.close();
})();
