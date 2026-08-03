// THE GRID THAT CATCHES WHAT A SINGLE FRAME HIDES: health level x hour, twelve prints.
// Run: node test/cruz.js   ->   cruz-<sick|mid|healed>-<manha|tarde|poschuva|noite>.png
//
// Every other harness here measures ONE frame — `medir.js` and `board.js` both stand at
// MANHÃ and NOITE on a healed street. Two things in the direction only break in the cells
// between: the sick->healed arc runs on SATURATION and not on brightness (so a sick street
// must come out BLEACHED AND LIGHTER than a healed one, never darker), and a correction
// authored for daylight gets charged after dark unless somebody looks. Wave 15 caught a
// chroma gain inverting the hero at night this way; wave 17 caught the near ridge paying a
// daylight pull at NOITE. It also fails on any console error in any of the twelve.
// Monsters are queued on screen so the readout is measured in the frame that ships.
//
// It prints nothing but errors on purpose. The output is the twelve PNGs, and this project's
// rule since wave 11 is that the print outranks the number when the two disagree.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const RAIZ = path.resolve(__dirname, '..');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
(async () => {
  const file = 'file://' + path.resolve(RAIZ, 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  // CEN=<id> stands the whole harness in another scenario; unset means RUA DO BAIRRO.
  await page.addInitScript(function (c) { window.__CEN = c; }, process.env.CEN || '');
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    S.introSeen = true; document.getElementById('lore').classList.add('escondido'); if (window.setCenario && window.__CEN) setCenario(window.__CEN);
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; };
  });
  const niveis = [
    ['sick', { geradores: 2, energia: 300, energiaTotal: 400, poluicao: 200, modo: 'carvao' }],
    ['mid', { geradores: 18, energia: 9000, energiaTotal: 16000, poluicao: 40, modo: 'limpo' }],
    ['healed', { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' }]
  ];
  const horas = [['manha', 0], ['tarde', 0.28], ['poschuva', 0.52], ['noite', 0.78]];
  for (const [nn, st] of niveis) for (const [hn, frac] of horas) {
    await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); relogio = frac * DIA_SEG; worldX = 4000; animT = 100;
      mobs.length = 0; drops.length = 0; chamada = null; cartaoT = 0; S.capVisto = 9;
      ['smog', 'barrel', 'cash'].forEach(function (t, i) {
        mobs.push({ type: t, wx: worldX + W * (0.52 + i * 0.16), hp: 4 + i, hpMax: 6, flash: 0, t: i * 9 });
      });
      QUADRO();
    }, { st, frac });
    await page.screenshot({ path: path.resolve(RAIZ, 'cruz-' + (process.env.CEN ? process.env.CEN + '-' : '') + nn + '-' + hn + '.png') });
  }
  console.log(errs.length ? errs.join('\n') : 'sem erros de console');
  await browser.close();
})();
