// cross-check: health level x hour, with monsters on screen so the readout is in frame
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
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    S.introSeen = true; document.getElementById('lore').classList.add('escondido');
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
    await page.screenshot({ path: path.resolve(RAIZ, 'cruz-' + nn + '-' + hn + '.png') });
  }
  console.log(errs.length ? errs.join('\n') : 'sem erros de console');
  await browser.close();
})();
