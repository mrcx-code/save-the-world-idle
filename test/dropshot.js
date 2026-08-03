// Focused drop screenshot harness (not part of the suite). Lays one of each drop on the
// ground and captures the world canvas. Usage: node test/dropshot.js [hour]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) { if (p && fs.existsSync(p)) return p; }
  return undefined;
}
const hour = process.argv[2] !== undefined ? parseInt(process.argv[2]) : 12;
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.tap('#btnBegin');
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.requestAnimationFrame = function () { return 0; }; });
  await page.waitForTimeout(60);
  const box = await page.evaluate((hour) => {
    fecharTudo();
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; parts.length = 0;
    superT = 0; superCarga = 0; superSwings = 0; superCd = 1e9; superFx = null; modoAviso = null;
    S.geradores = 0; S.poluicao = 0; S.modo = 'limpo';
    if (typeof relogio !== 'undefined') relogio = hour / 24 * (typeof DIA_SEG !== 'undefined' ? DIA_SEG : 240);
    try { S.capVisto = CAPITULOS.length; } catch (e) {}
    cartaoT = 0; try { document.getElementById('cartao').classList.remove('mostra'); } catch (e) {}
    try { GUIA.forEach(function (g) { marcarGuia(g.id); }); esconderGuia(); } catch (e) {}
    tick = 40; animT = 0.2;
    ['smog', 'barrel', 'cash'].forEach(function (t, i) {
      drops.push({ wx: worldX + 45 + i * 52, type: t, t: 0, valor: 10 });
    });
    const cv = document.getElementById('scene');
    const r = cv.getBoundingClientRect();
    drawScene(); desenharMundo(); desenhar();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, hour);
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-drops.png'),
    clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h * 0.86 } });
  console.log('wrote shot-drops.png');
  await browser.close();
})();
