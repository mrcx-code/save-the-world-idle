// Visual check: load the game, force a state, screenshot. Not part of the smoke test.
// Run: node test/shot.js [name]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
(async () => {
  const tag = process.argv[2] || 'look';
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate(() => { S.introSeen = true; document.getElementById('lore').classList.add('escondido'); });
  for (const [nome, st] of [
    ['sick', { geradores: 2, energia: 300, energiaTotal: 400, poluicao: 200, modo: 'carvao' }],
    ['mid', { geradores: 18, energia: 9000, energiaTotal: 16000, poluicao: 40, modo: 'limpo' }],
    ['healed', { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' }]
  ]) {
    await page.evaluate((st) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; chamada = null; cartaoT = 0; S.capVisto = 9;
      desenhar();
    }, st);
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.resolve(__dirname, '..', 'look-' + tag + '-' + nome + '.png') });
  }
  // the four light states, at a healed street
  for (const [nome, frac] of [['manha', 0], ['tarde', 0.25], ['poschuva', 0.5], ['noite', 0.75]]) {
    await page.evaluate(({ frac }) => {
      Object.assign(S, { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' });
      relogio = frac * DIA_SEG; desenhar();
    }, { frac });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.resolve(__dirname, '..', 'look-' + tag + '-' + nome + '.png') });
  }
  const fps = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    (function f() { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : res(Math.round(n / 2)); })();
  }));
  console.log('FPS', fps, errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
