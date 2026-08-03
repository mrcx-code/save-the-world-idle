// Focused NPC lineup harness (not part of the suite). Draws the world, then overlays every
// neighbour + the dog at spaced positions on the ground. Usage: node test/npcshot.js [hour]
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
    const cv = document.getElementById('scene');
    const r = cv.getBoundingClientRect();
    drawScene(); desenharMundo(); desenhar();
    // overlay a full lineup, spaced across the ground
    const names = ['avental', 'chapeu', 'crianca', 'avo', 'bone', 'cadeira', 'cao'];
    names.forEach(function (n, i) { pessoa(n, 10 + i * 26, GROUND); });
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, hour);
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-npcs.png'),
    clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h * 0.86 } });
  console.log('wrote shot-npcs.png');
  await browser.close();
})();
