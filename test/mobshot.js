// Focused monster screenshot harness (not part of the suite). Poses one of each trouble in a
// given state and captures the world canvas. Usage: node test/mobshot.js [state] [hour]
//   state: walk | block | dying   (default walk)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) { if (p && fs.existsSync(p)) return p; }
  return undefined;
}
const state = process.argv[2] || 'walk';
const hour = process.argv[3] !== undefined ? parseInt(process.argv[3]) : 12;
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.tap('#btnBegin');
  await page.waitForTimeout(300);
  // freeze the rAF loop so a posed state (esp. m.dying, which counts down every frame) holds
  // still for the shot instead of animating away before the screenshot is taken
  await page.evaluate(() => { window.requestAnimationFrame = function () { return 0; }; });
  await page.waitForTimeout(60);
  const box = await page.evaluate(async (arg) => {
    const [state, hour] = arg;
    fecharTudo();
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; parts.length = 0;
    superT = 0; superCarga = 0; superSwings = 0; superCd = 1e9; superFx = null; modoAviso = null;
    S.geradores = 0; S.poluicao = 0; S.modo = 'limpo';
    if (typeof relogio !== 'undefined') relogio = hour / 24 * (typeof DIA_SEG !== 'undefined' ? DIA_SEG : 240);
    try { S.capVisto = CAPITULOS.length; } catch (e) {}
    cartaoT = 0; try { document.getElementById('cartao').classList.remove('mostra'); } catch (e) {}
    try { GUIA.forEach(function (g) { marcarGuia(g.id); }); esconderGuia(); } catch (e) {}
    tick = 40; animT = 0.2;
    const types = ['smog', 'barrel', 'cash'];
    types.forEach(function (t, i) {
      const m = { wx: worldX + 45 + i * 52, type: t, hp: 5, hpMax: 5, flash: 0, dying: 0, parado: false };
      if (state === 'block') m.parado = true;
      if (state === 'dying') m.dying = 6;
      mobs.push(m);
    });
    const cv = document.getElementById('scene');
    const r = cv.getBoundingClientRect();
    drawScene(); desenharMundo(); desenhar();          // redraw the world with the loop frozen
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, [state, hour]);
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-mob-' + state + '.png'),
    clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h * 0.86 } });
  console.log('wrote shot-mob-' + state + '.png');
  await browser.close();
})();
