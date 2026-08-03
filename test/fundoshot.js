// Visual check for the seven HD painted backdrops. Not part of the smoke suite.
// Run: node test/fundoshot.js  ->  writes shot-fundo-0.png .. shot-fundo-6.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.goto(file);
  await page.waitForTimeout(900);
  await page.evaluate(() => { S.introSeen = true; document.getElementById('lore').classList.add('escondido'); });
  const loaded = await page.evaluate(() => CENARIO_FUNDO.map(im => im.complete && im.naturalWidth > 0));
  console.log('paintings loaded:', JSON.stringify(loaded));
  for (let n = 0; n < 7; n++) {
    await page.evaluate((n) => { setFundo(n); }, n);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-fundo-' + n + '.png') });
  }
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
