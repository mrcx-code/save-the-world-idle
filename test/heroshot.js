// Focused hero screenshot harness. Not part of the suite — a tool for the rebuild.
// Usage: node test/heroshot.js [mode] [hour]
//   mode: stand | run | jump | cast   (default stand)
//   hour: 0..23 (default 12)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;
}
const mode = process.argv[2] || 'stand';
const hour = process.argv[3] !== undefined ? parseInt(process.argv[3]) : 12;
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.tap('#btnBegin');
  await page.waitForTimeout(200);
  // clear the world, freeze the scene, force an hour, and pose the hero
  const box = await page.evaluate(async (arg) => {
    const [mode, hour] = arg;
    fecharTudo();
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; parts.length = 0;
    superT = 0; superCarga = 0; superSwings = 0; superCd = 1e9; superFx = null; modoAviso = null;
    S.geradores = 0; S.poluicao = 0; S.modo = 'limpo';
    // pin the clock so hero lighting is deterministic
    if (typeof relogio !== 'undefined') relogio = hour / 24 * (typeof DIA_SEG !== 'undefined' ? DIA_SEG : 240);
    animT = 0; tick = 0; attackT = 0; jumpT = 0; combo = 0;
    if (mode === 'run') { animT = 0.15; }
    if (mode === 'jump') { jumpT = Math.round(JUMPF * 0.55); attackT = jumpT; combo = 2; attackType = 2; }
    if (mode === 'cast') { attackT = 8; attackType = 0; combo = 1; }
    // hero screen footprint, in backing px -> css px (canvas is stretched to window width)
    const cv = document.getElementById('scene');
    const sxWorld = HX - 34, syWorld = GROUND - 104, wWorld = 68, hWorld = 116;
    const cssScaleX = cv.getBoundingClientRect().width / W;
    const cssScaleY = cv.getBoundingClientRect().height / H;
    const r = cv.getBoundingClientRect();
    desenhar();
    return { x: r.left + sxWorld * cssScaleX, y: r.top + syWorld * cssScaleY,
      w: wWorld * cssScaleX, h: hWorld * cssScaleY };
  }, [mode, hour]);
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-hero-' + mode + '.png'),
    clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h } });
  console.log('wrote shot-hero-' + mode + '.png', JSON.stringify(box));
  await browser.close();
})();
