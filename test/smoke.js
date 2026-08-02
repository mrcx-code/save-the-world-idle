// Headless smoke test: no console errors, upgrades buyable, hold-to-attack repeats, fps sane.
// Run: node test/smoke.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Use the sandbox chromium when it is there, otherwise whatever playwright installed.
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) {
    if (p && fs.existsSync(p)) return p;
  }
  return undefined;   // let playwright resolve its own download
}

(async () => {
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_(TUNNEL|NAME|CONNECTION)/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });

  await page.goto(file);
  await page.waitForTimeout(900);
  await page.tap('#btnBegin');
  await page.waitForTimeout(300);

  // hold the attack button: should fire many hits, not one
  const before = await page.evaluate(() => S.energiaTotal);
  await page.mouse.move(195, 800);
  await page.mouse.down();
  await page.waitForTimeout(1000);
  await page.mouse.up();
  const after = await page.evaluate(() => S.energiaTotal);
  const hits = Math.round(after - before);
  console.log('hold 1s ->', hits, 'impact (expect >= 4)');
  if (hits < 4) errors.push('HOLD-TO-ATTACK did not repeat');

  // released: must stop swinging
  const idleA = await page.evaluate(() => S.energiaTotal);
  await page.waitForTimeout(600);
  const idleB = await page.evaluate(() => S.energiaTotal);
  if (idleB - idleA > 0.5) errors.push('HOLD did not stop on release');

  // every upgrade buyable and applied
  await page.evaluate(() => { S.energia = 999999; desenhar(); });
  await page.tap('#openUpgrades');
  await page.waitForTimeout(350);
  for (const id of ['btnU1', 'btnU2', 'btnU3', 'btnU4', 'btnU5', 'btnU6', 'btnU7']) {
    await page.tap('#' + id);
    await page.waitForTimeout(80);
  }
  const st = await page.evaluate(() => ({ u: [S.u1, S.u2, S.u3, S.u4, S.u5, S.u6, S.u7], tap: ganhoClique() }));
  console.log('upgrades owned:', st.u.join(','), '| tap gain:', st.tap.toFixed(2));
  if (st.u.some(v => !v)) errors.push('some upgrade did not apply');

  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-upgrades.png') });
  await page.tap('[data-close="sheetUpgrades"]');
  await page.waitForTimeout(400);

  // third hit must be a leap: hero leaves the ground, then a shockwave appears
  const mid = await page.evaluate(() => { combo = 2; S.energiaTotal = 30000; mobs.length = 0; shocks.length = 0; clicar(); return jumpT; });
  if (mid <= 0) errors.push('third hit did not leap');
  // hold him at the top of the arc for the screenshot
  await page.evaluate(() => new Promise(r => { jumpT = Math.round(JUMPF * 0.55); attackT = jumpT; requestAnimationFrame(() => r()); }));
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-jump.png') });
  // land it deterministically, then grab the exact impact frame and one mid-wave frame
  await page.evaluate(() => new Promise(r => {
    jumpT = 1;
    requestAnimationFrame(() => requestAnimationFrame(() => r()));
  }));
  const land = await page.evaluate(() => ({ j: jumpT, s: shocks.length, t: shocks[0] && shocks[0].t }));
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-slam.png') });
  await page.evaluate(() => new Promise(r => { shocks.forEach(s => s.t = 11); requestAnimationFrame(() => r()); }));
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-wave.png') });
  console.log('leap -> jumpT mid:', mid, '| after landing jumpT:', land.j, 'shockwaves:', land.s);
  if (land.s < 1) errors.push('slam produced no shockwave');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-game.png') });

  // retention: long-press the torch opens the counters, a normal tap still passes it
  const ret = await page.evaluate(async () => {
    const bt = document.getElementById('openTorch');
    bt.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 700));
    bt.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    bt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 250));
    return {
      stats: document.getElementById('sheetStats').classList.contains('aberto'),
      torch: document.getElementById('sheetTorch').classList.contains('aberto'),
      dias: R.dias.length, segundos: R.segundos
    };
  });
  console.log('long-press torch -> stats:', ret.stats, '| torch sheet:', ret.torch,
    '| days:', ret.dias, '| seconds played:', ret.segundos.toFixed(1));
  if (!ret.stats) errors.push('long-press did not open the retention panel');
  if (ret.torch) errors.push('long-press also passed the torch');
  if (ret.dias < 1 || ret.segundos <= 0) errors.push('retention did not record the session');

  // a corrupted record must not take the game down with it
  const sobreviveu = await page.evaluate(() => {
    try {
      localStorage.setItem('proto_savetheworld_retencao', '{broken');
      R = { dias: [], segundos: 0, tochas: 0 };
      carregarRetencao(); mostrarRetencao();
      return R.dias.length === 1 && R.segundos === 0;
    } catch (e) { return false; }
  });
  if (!sobreviveu) errors.push('a corrupted retention record broke the game');
  await page.evaluate(() => localStorage.removeItem('proto_savetheworld_retencao'));
  await page.tap('[data-close="sheetStats"]');
  await page.waitForTimeout(300);

  const fps = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    (function f() { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : res(Math.round(n / 2)); })();
  }));
  console.log('FPS:', fps);

  console.log(errors.length ? 'FAIL\n' + errors.join('\n') : 'PASS — no errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
