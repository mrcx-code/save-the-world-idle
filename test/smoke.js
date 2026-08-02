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

  // ---- the world is the other half of the button ----
  // a tap on the scene swings exactly like the CTA does
  const noMundo = await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; S.geradores = 0;
    const antes = S.energiaTotal, c0 = combo;
    const cv = document.getElementById('scene');
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 400 }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    return { ganho: S.energiaTotal - antes, combo0: c0, combo1: combo };
  });
  console.log('tap the scene ->', noMundo.ganho.toFixed(2), 'impact | combo',
    noMundo.combo0, '->', noMundo.combo1);
  if (noMundo.ganho <= 0) errors.push('a tap on the world did not swing');
  if (noMundo.combo1 === noMundo.combo0) errors.push('a tap on the world did not advance the combo');

  // holding on the scene repeats, and stops on release
  const seguraMundo = await page.evaluate(async () => {
    const cv = document.getElementById('scene');
    const a = S.energiaTotal;
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 400 }));
    await new Promise(r => setTimeout(r, 1000));
    const b = S.energiaTotal;
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 600));
    return { segurando: b - a, depois: S.energiaTotal - b };
  });
  console.log('hold the scene 1s ->', Math.round(seguraMundo.segurando), 'impact | after release +',
    seguraMundo.depois.toFixed(2));
  if (seguraMundo.segurando < 4) errors.push('holding the world did not repeat');
  if (seguraMundo.depois > 0.5) errors.push('holding the world did not stop on release');

  // both surfaces held at once must NOT double the hit rate — one timer, not two
  const dobrado = await page.evaluate(async () => {
    const cv = document.getElementById('scene'), bc = document.getElementById('btnClique');
    const a = S.energiaTotal;
    bc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 400 }));
    await new Promise(r => setTimeout(r, 1000));
    const b = S.energiaTotal;
    bc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    return { juntos: b - a, parou: S.energiaTotal - b };
  });
  console.log('button + scene held together ->', Math.round(dobrado.juntos),
    'impact (one surface gave', Math.round(seguraMundo.segurando) + ')');
  if (dobrado.juntos > seguraMundo.segurando + 3) errors.push('holding both surfaces doubled the hit rate');
  if (dobrado.parou > 0.5) errors.push('releasing both surfaces did not stop the swinging');

  // with a sheet open a scene tap only dismisses it — no stray swing
  const comFolha = await page.evaluate(async () => {
    abrir('sheetProjects');
    await new Promise(r => setTimeout(r, 250));
    const antes = S.energiaTotal;
    const cv = document.getElementById('scene');
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 400 }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 250));
    return { ganho: S.energiaTotal - antes, aberta: document.getElementById('sheetProjects').classList.contains('aberto') };
  });
  console.log('scene tap with a sheet open -> closed:', !comFolha.aberta, '| swing:', comFolha.ganho.toFixed(2));
  if (comFolha.aberta) errors.push('a scene tap did not close the open sheet');
  if (comFolha.ganho > 0.01) errors.push('a scene tap swung while a sheet was open');

  // ---- troubles walk in, block the work, and pay when they are cleared ----
  const encontro = await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0;
    S.geradores = 10; S.poluicao = 0; S.modo = 'limpo';
    const livre = prodPorSegundo();
    mobs.push({ wx: worldX + W + 12, type: 'smog', hp: 3, flash: 0, dying: 0, parado: false });
    const longe = mobs[0].wx - worldX;
    for (let i = 0; i < 400; i++) atualizarMobs(0.05);      // 20s of walking
    const perto = mobs[0].wx - worldX;
    const bloqueado = prodPorSegundo();
    // they queue up instead of standing on top of each other
    const xs = mobs.filter(m => m.parado).map(m => Math.round(m.wx - worldX)).sort((a, b) => a - b);
    const empilhados = xs.some((x, i) => i > 0 && x - xs[i - 1] < 12);
    // and every one of them is inside the reach of a plain swing from the button
    const alcance = mobs.every(m => m.wx - worldX < HX + 80);
    return { livre, bloqueado, longe, perto, parado: mobs[0].parado, n: mobs.length,
      fator: bloqueioMundo(), xs, empilhados, alcance };
  });
  console.log('a trouble walks in -> from x', Math.round(encontro.longe), 'to', Math.round(encontro.perto),
    '| parked:', encontro.parado, '| rate', encontro.livre.toFixed(1), '->', encontro.bloqueado.toFixed(1),
    '(×' + encontro.fator.toFixed(2) + ')');
  console.log('  the queue sits at x', JSON.stringify(encontro.xs), '| all within reach:', encontro.alcance);
  if (encontro.perto >= encontro.longe) errors.push('the trouble did not advance');
  if (!encontro.parado) errors.push('the trouble never reached the hero');
  if (!(encontro.bloqueado < encontro.livre)) errors.push('a parked trouble did not block production');
  if (encontro.n < 2) errors.push('only one trouble showed up in 20s');
  if (encontro.empilhados) errors.push('troubles are standing on top of each other');
  if (!encontro.alcance) errors.push('a trouble parked outside the reach of a swing');

  // clearing one leaves a drop; the drop is picked up with a tap on the world
  const recolha = await page.evaluate(async () => {
    drops.length = 0;
    const m = mobs[0];
    const sx = m.wx - worldX;
    const r = document.getElementById('scene').getBoundingClientRect();
    const paraCliente = (x, y) => ({ x: r.left + x / W * r.width, y: r.top + y / H * r.height });
    const alvo = paraCliente(sx + 5, GROUND - 12);
    const cv = document.getElementById('scene');
    for (let i = 0; i < 4 && mobs.length && !mobs[0].dying; i++) {
      cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: alvo.x, clientY: alvo.y }));
      cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      await new Promise(rr => setTimeout(rr, 40));
    }
    const nDrops = drops.length, oDrop = drops[0], valor = oDrop ? oDrop.valor : 0;
    const antes = S.energiaTotal;
    const d = paraCliente(oDrop ? oDrop.wx - worldX : 0, GROUND - 14);
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: d.x, clientY: d.y }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(rr => setTimeout(rr, 60));
    // the swing that comes with the tap can fell another trouble, so check *this* drop
    return { nDrops, valor, ganho: S.energiaTotal - antes, saiu: drops.indexOf(oDrop) < 0 };
  });
  console.log('aimed taps -> drops left:', recolha.nDrops, 'worth', recolha.valor.toFixed(1),
    '| picking one up paid', recolha.ganho.toFixed(1), '| taken off the ground:', recolha.saiu);
  if (recolha.nDrops < 1) errors.push('beating a trouble left no drop');
  if (recolha.ganho < recolha.valor) errors.push('picking up a drop paid nothing');
  if (!recolha.saiu) errors.push('the drop was not taken off the ground');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-mundo.png') });

  // ---- the community call: show up inside the window and the street works with you ----
  await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; mutiraoT = 0;
    abrirChamada(false);
    await new Promise(r => setTimeout(r, 250));
  });
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-chamada.png') });
  const chamado = await page.evaluate(async () => {
    const aviso = document.getElementById('alerta').textContent;
    const semMutirao = prodPorSegundo();
    const r = document.getElementById('scene').getBoundingClientRect();
    const cv = document.getElementById('scene');
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true,
      clientX: r.left + chamada.sx / W * r.width, clientY: r.top + (GROUND - 14) / H * r.height }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(rr => setTimeout(rr, 60));
    return { aviso, semMutirao, comMutirao: prodPorSegundo(), t: mutiraoT, aberta: !!chamada,
      mult: bonusMutirao() };
  });
  console.log('community call ->', JSON.stringify(chamado.aviso), '| answered:', !chamado.aberta,
    '| rate', chamado.semMutirao.toFixed(1), '->', chamado.comMutirao.toFixed(1),
    '(×' + chamado.mult + ' for', Math.round(chamado.t) + 's)');
  if (!/HANDS/.test(chamado.aviso)) errors.push('the call did not announce itself');
  if (chamado.aberta) errors.push('tapping the pot did not answer the call');
  if (!(chamado.comMutirao > chamado.semMutirao)) errors.push('the mutirão did not raise production');

  // a missed call closes on its own and costs nothing
  const perdida = await page.evaluate(async () => {
    mutiraoT = 0; abrirChamada(false);
    const antes = S.energiaTotal;
    for (let i = 0; i < 300; i++) atualizarChamada(0.1);   // 30s: past the window
    return { aberta: !!chamada, perdeu: S.energiaTotal < antes };
  });
  if (perdida.aberta) errors.push('a missed call never closed');
  if (perdida.perdeu) errors.push('missing a call took something away');

  // ---- coming back on another day is worth something ----
  const dias = await page.evaluate(() => {
    localStorage.setItem('proto_savetheworld_retencao',
      JSON.stringify({ dias: ['2026-07-30', '2026-07-31', '2026-08-01'], segundos: 900, tochas: 0 }));
    R = { dias: [], segundos: 0, tochas: 0 };
    diaNovo = false;
    carregarRetencao();
    return { n: R.dias.length, bonus: bonusDias(), novo: diaNovo };
  });
  console.log('day streak ->', dias.n, 'days | bonus ×' + dias.bonus.toFixed(2), '| new day:', dias.novo);
  if (dias.n !== 4) errors.push('the new day was not recorded');
  if (Math.abs(dias.bonus - 1.06) > 1e-9) errors.push('the day bonus is not what CFG says');
  if (!dias.novo) errors.push('coming back on a new day was not noticed');
  await page.evaluate(() => {
    localStorage.removeItem('proto_savetheworld_retencao');
    R = { dias: [], segundos: 0, tochas: 0 }; carregarRetencao();
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0;
    S.geradores = 0; S.poluicao = 0; S.modo = 'carvao';
  });

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

  // passing the torch asks in-game, not through a browser dialog
  page.on('dialog', async d => { errors.push('BROWSER DIALOG: ' + d.message()); await d.dismiss(); });
  const pergunta = await page.evaluate(async () => {
    S.energiaTotal = 62000; S.energia = 5000; S.geradores = 12; S.poluicao = 40;
    desenhar();
    document.getElementById('openTorch').click();
    await new Promise(r => setTimeout(r, 250));
    document.getElementById('btnPrestigio').click();
    await new Promise(r => setTimeout(r, 300));
    return {
      aberto: document.getElementById('sheetConfirm').classList.contains('aberto'),
      ganha: document.getElementById('confirmaGanha').textContent,
      perde: document.getElementById('confirmaPerde').textContent
    };
  });
  console.log('pass the torch ->', pergunta.aberto ? 'panel' : 'NO PANEL',
    '|', pergunta.ganha, '|', pergunta.perde);
  if (!pergunta.aberto) errors.push('prestige did not open the confirm panel');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-torch.png') });

  // NOT YET must back out without spending anything
  const recuou = await page.evaluate(async () => {
    document.getElementById('btnConfirmaNao').click();
    await new Promise(r => setTimeout(r, 300));
    return { total: S.energiaTotal, sabedoria: S.inovacao };
  });
  if (recuou.total < 62000 || recuou.sabedoria !== 0) errors.push('NOT YET passed the torch anyway');

  // YES resets the run, banks wisdom and counts the torch
  const passou = await page.evaluate(async () => {
    document.getElementById('btnPrestigio').click();
    await new Promise(r => setTimeout(r, 300));
    document.getElementById('btnConfirmaSim').click();
    await new Promise(r => setTimeout(r, 300));
    return { total: S.energiaTotal, sabedoria: S.inovacao, projetos: S.geradores, tochas: R.tochas };
  });
  console.log('confirmed ->  wisdom:', passou.sabedoria, '| impact reset to:', Math.round(passou.total),
    '| projects:', passou.projetos, '| torches counted:', passou.tochas);
  if (passou.sabedoria <= 0) errors.push('passing the torch banked no wisdom');
  if (passou.projetos !== 0) errors.push('passing the torch did not reset the run');
  if (passou.tochas !== 1) errors.push('passing the torch was not counted');

  // offline pays what the night actually earned, not the rate frozen at bedtime:
  // 20 projects in GO FAST with a rested team wear out while you sleep
  await page.evaluate(() => {
    salvar = function () {};   // the unload handler would write live state over the seed
    localStorage.setItem('proto_savetheworld', JSON.stringify({
      energia: 0, energiaTotal: 0, poluicao: 0, geradores: 20, modo: 'carvao', tempoLimpo: 0,
      u1: true, u2: false, u3: false, u4: false, u5: false, u6: false, u7: false,
      inovacao: 0, transicoes: 0, introSeen: true, salvoEm: Date.now() - 12 * 3600 * 1000
    }));
  });
  const t0 = Date.now();
  await page.reload();
  await page.waitForFunction(() => typeof S !== 'undefined' && S.geradores === 20);
  const noite = await page.evaluate(() => ({ total: S.energiaTotal, cansaco: S.poluicao }));
  const congelado = 20 * 3 * 2 * 12 * 3600;    // what the old frozen rate would have paid
  console.log('offline 12h ->', Math.round(noite.total).toLocaleString('en-US'),
    'impact (frozen rate would pay', congelado.toLocaleString('en-US') + ')',
    '| tiredness', Math.round(noite.cansaco), '| load', Date.now() - t0, 'ms');
  if (noite.total > congelado / 3) errors.push('offline still paying near the frozen rate');
  if (noite.total < 100000) errors.push('offline paid almost nothing');
  if (noite.cansaco < 100) errors.push('the team did not get tired overnight');

  // coming back after a night away: a call is kept for you, and it is worth double.
  // It also has to sit *below* the night's summary instead of on top of it.
  await page.waitForFunction(() => !!chamada, null, { timeout: 15000 })
    .catch(() => errors.push('no call was waiting after a night away'));
  const volta = await page.evaluate(() => {
    const a = document.getElementById('alerta').getBoundingClientRect();
    const o = document.getElementById('offline');
    return { dobrada: chamada && chamada.dobrada, aviso: document.getElementById('alerta').textContent,
      topoAlerta: a.top, fundoOffline: o.getBoundingClientRect().bottom,
      offlineVisivel: o.style.display === 'block' };
  });
  console.log('back after a night ->', JSON.stringify(volta.aviso), '| doubled:', volta.dobrada,
    '| night banner up:', volta.offlineVisivel);
  if (!volta.dobrada) errors.push('the call kept for a returning player was not doubled');
  if (volta.offlineVisivel && volta.topoAlerta < volta.fundoOffline) {
    errors.push('the call banner is sitting on top of the night summary');
  }
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-volta.png') });

  await page.evaluate(() => localStorage.removeItem('proto_savetheworld'));

  const fps = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    (function f() { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : res(Math.round(n / 2)); })();
  }));
  console.log('FPS:', fps);

  console.log(errors.length ? 'FAIL\n' + errors.join('\n') : 'PASS — no errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
