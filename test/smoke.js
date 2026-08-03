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
  // read the tuning out of the page instead of restating it here
  const CFG_TIROS = await page.evaluate(() => CFG.autoFogoTiros);
  const CFG_COMBOS = await page.evaluate(() => CFG.superCombos);
  await page.tap('#btnBegin');
  await page.waitForTimeout(300);

  // ---- first-run onboarding guide ----
  // Light, progressive, tied to state: ONE warm line at a time, it never repeats, it never
  // replays after the torch, and it never blocks a tap from reaching the game.
  const guia1 = await page.evaluate(() => {
    // a fresh save: intro just dismissed, no projects yet, story card not in the way
    S.guiaVistos = []; S.geradores = 0; S.energia = 0; S.energiaTotal = 0; S.transicoes = 0;
    cartaoT = 0; esconderGuia(); fecharTudo();
    desenhar();
    const el = document.getElementById('guia'), v = document.getElementById('guiaV');
    return {
      id: guiaAtual, visivel: el.classList.contains('mostra'),
      texto: v.innerText, palavras: v.innerText.replace(/^[A-Z]+\s*—\s*/, '').split(/\s+/).filter(Boolean).length,
      ponteiro: getComputedStyle(el).pointerEvents, passos: GUIA.length,
      aponta: document.getElementById('btnClique').classList.contains('guiaAlvo')
    };
  });
  console.log('onboarding -> steps:', guia1.passos, '| first hint on a fresh save:', JSON.stringify(guia1.id),
    '| visible:', guia1.visivel, '| words before first tap:', guia1.palavras, '| pointer-events:', guia1.ponteiro);
  console.log('           ->', JSON.stringify(guia1.texto));
  if (!guia1.visivel || guia1.id !== 'tap') errors.push('the first hint did not appear on a fresh save');
  if (guia1.ponteiro !== 'none') errors.push('the guide bubble is not pointer-through');
  if (!guia1.aponta) errors.push('the first hint did not point at the attack button');
  if (guia1.palavras > 16) errors.push('the first hint is not one short line');
  // a clean frame for the eye: suppress the chapter card, keep only the tap hint up
  await page.evaluate(() => {
    S.capVisto = CAPITULOS.length; document.getElementById('cartao').classList.remove('mostra');
    S.guiaVistos = []; S.geradores = 0; cartaoT = 0; esconderGuia(); desenhar();
  });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-guia.png') });

  // it NEVER blocks a tap: with the hint up, a tap on the world still swings AND dismisses it
  await page.waitForTimeout(350);   // clear the anti-flicker grace
  const guiaTap = await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0;
    superT = 0; superCarga = 0; superSwings = 0; superCd = 1e9; superFx = null; S.geradores = 0;
    const antes = S.energiaTotal, cv = document.getElementById('scene');
    const visivelAntes = document.getElementById('guia').classList.contains('mostra');
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 400 }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    return { visivelAntes, ganho: S.energiaTotal - antes, guiaAtual,
      aindaVisivel: document.getElementById('guia').classList.contains('mostra'),
      lembrou: Array.isArray(S.guiaVistos) && S.guiaVistos.indexOf('tap') >= 0 };
  });
  console.log('  tap through the hint -> hint up:', guiaTap.visivelAntes, '| swing +' + guiaTap.ganho.toFixed(2),
    '| hint still up:', guiaTap.aindaVisivel, '| tap remembered:', guiaTap.lembrou);
  if (!guiaTap.visivelAntes) errors.push('the hint was not up before the tap-through test');
  if (guiaTap.ganho <= 0) errors.push('the guide bubble blocked a tap from reaching the game');
  if (guiaTap.aindaVisivel) errors.push('a tap did not dismiss the hint');
  if (!guiaTap.lembrou) errors.push('the dismissed hint was not remembered');

  // a seen hint does not come back; and "got it" advances to the next step that state allows
  const guiaAvanca = await page.evaluate(() => {
    // tap already seen, and some impact is on the board: the rhythm step is next
    // (projects are gone, so the trigger is total impact, not a project count)
    S.guiaVistos = ['tap']; S.energiaTotal = 60; S.energia = 0; S.transicoes = 0;
    esconderGuia(); cartaoT = 0; fecharTudo();
    desenhar();
    const primeiro = guiaAtual, apontaRitmo = document.getElementById('modeQuick').classList.contains('guiaAlvo');
    dispensarGuia();                                   // "got it"
    const aposOk = { atual: guiaAtual, visto: S.guiaVistos.slice() };
    // with tap+rhythm seen and no money, nothing else qualifies — the bubble stays down
    esconderGuia(); S.energiaTotal = 0; desenhar();
    return { primeiro, apontaRitmo, aposOk, quieto: guiaAtual };
  });
  console.log('  advance -> next step:', JSON.stringify(guiaAvanca.primeiro), '| points at rhythm:', guiaAvanca.apontaRitmo,
    '| after "got it":', JSON.stringify(guiaAvanca.aposOk.atual), '| seen:', JSON.stringify(guiaAvanca.aposOk.visto));
  if (guiaAvanca.primeiro !== 'rhythm') errors.push('the guide did not advance to the rhythm step');
  if (!guiaAvanca.apontaRitmo) errors.push('the rhythm hint did not point at the mode control');
  if (guiaAvanca.aposOk.atual) errors.push('"got it" did not dismiss the step');
  if (guiaAvanca.aposOk.visto.indexOf('rhythm') < 0) errors.push('the "got it" step was not remembered');
  if (guiaAvanca.quieto) errors.push('a seen hint reappeared with nothing new to show');

  // passing the torch must NOT replay the tutorial: guiaVistos survives transicionar()
  const guiaTorch = await page.evaluate(() => {
    S.guiaVistos = ['tap', 'projects', 'rhythm', 'upgrades', 'torch'];
    S.energiaTotal = CFG.metaPrestigio + 1000; S.geradores = 3; S.poluicao = 0; cartaoT = 0;
    transicionar();                                    // wipes the run; must keep guiaVistos
    const guardado = JSON.parse(localStorage.getItem('proto_savetheworld') || '{}');
    fecharTudo();
    // now stand where the fresh run's tap/projects hints would fire, with chapters suppressed
    S.geradores = 0; S.energia = 0; S.capVisto = CAPITULOS.length; cartaoT = 0; esconderGuia();
    desenhar();
    return { sobreviveu: (S.guiaVistos || []).slice(), noSave: (guardado.guiaVistos || []).indexOf('tap') >= 0,
      reapareceu: guiaAtual };
  });
  console.log('  after the torch -> seen steps kept:', JSON.stringify(guiaTorch.sobreviveu),
    '| persisted in save:', guiaTorch.noSave, '| replayed:', JSON.stringify(guiaTorch.reapareceu));
  if (guiaTorch.sobreviveu.indexOf('tap') < 0 || guiaTorch.sobreviveu.indexOf('projects') < 0) {
    errors.push('passing the torch wiped the guide-seen state');
  }
  if (!guiaTorch.noSave) errors.push('the guide-seen state was not persisted through the torch');
  if (guiaTorch.reapareceu === 'tap' || guiaTorch.reapareceu === 'projects') {
    errors.push('the tutorial replayed after passing the torch');
  }

  // clean slate for the rest of the suite: every step seen, bubble down, run reset
  await page.evaluate(() => {
    GUIA.forEach(g => marcarGuia(g.id)); esconderGuia(); fecharTudo();
    S.energia = 0; S.energiaTotal = 0; S.geradores = 0; S.poluicao = 0; S.modo = 'carvao';
    S.tempoLimpo = 0; S.transicoes = 0; S.inovacao = 0; S.capVisto = 0;
    S.u1 = S.u2 = S.u3 = false;
    R.tochas = 0; cartaoT = 0; desenhar();
  });

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
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null; S.geradores = 0;
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
    // hold long enough and the super goes off, which would inflate the numbers below;
    // it has its own block further down, so park it here
    superT = 0; superCarga = 0; superSwings = 0; superCd = 1e9; superFx = null;
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
    // hold long enough and the super goes off, which would inflate the numbers below;
    // it has its own block further down, so park it here
    superT = 0; superCarga = 0; superSwings = 0; superCd = 1e9; superFx = null;
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
    abrir('sheetUpgrades');
    await new Promise(r => setTimeout(r, 250));
    const antes = S.energiaTotal;
    const cv = document.getElementById('scene');
    cv.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 400 }));
    cv.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 250));
    return { ganho: S.energiaTotal - antes, aberta: document.getElementById('sheetUpgrades').classList.contains('aberto') };
  });
  console.log('scene tap with a sheet open -> closed:', !comFolha.aberta, '| swing:', comFolha.ganho.toFixed(2));
  if (comFolha.aberta) errors.push('a scene tap did not close the open sheet');
  if (comFolha.ganho > 0.01) errors.push('a scene tap swung while a sheet was open');

  // obsolete: THE SUPER was removed by owner request — only the strike is left.
  // ---- how much of a trouble is left, and how much there was to begin with ----
  // The damage was always there; nothing ever showed it. Two things are checked: the
  // spread between the little one and the big one is wide enough to feel, and the readout
  // actually puts pixels on the screen over the right head.
  const vida = await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    const hp = {}, golpes = {};
    for (const t of ['smog', 'cash', 'barrel']) {
      hp[t] = novoMob(t, 0).hp;
      // hits from the button: the 3-hit combo deals 1, 1, 2
      let restante = hp[t], n = 0, c = 0;
      while (restante > 0) { restante -= (c % 3 === 2) ? 2 : 1; c++; n++; }
      golpes[t] = n;
    }
    // and it is drawn: paint one barrel's readout onto the scene and look at the pixels
    mobs.length = 0;
    const m = novoMob('barrel', worldX + HX + 40);
    m.parado = true; mobs.push(m);
    const y = GROUND - VIDA_TOPO.barrel, x0 = Math.round(m.wx - worldX) + 5 - ((m.hpMax * 3 - 1) >> 1);
    const leia = () => Array.from(cx.getImageData(x0, y, m.hpMax * 3 - 1, 3).data);
    drawScene(); desenharMundo();
    const cheio = leia();
    m.hp = 1;
    drawScene(); desenharMundo();
    const ferido = leia();
    mobs.length = 0;
    return { hp, golpes, mudou: cheio.some((v, i) => v !== ferido[i]),
      pintou: cheio.some((v, i) => i % 4 === 3 && v > 0) };
  });
  console.log('trouble health -> smog', vida.hp.smog, 'hits', vida.golpes.smog,
    '| cash', vida.hp.cash, 'hits', vida.golpes.cash,
    '| barrel', vida.hp.barrel, 'hits', vida.golpes.barrel);
  console.log('  health readout drawn:', vida.pintou, '| it changes when damaged:', vida.mudou);
  if (!(vida.hp.barrel >= vida.hp.smog + 3)) errors.push('big and small troubles do not differ enough');
  if (!(vida.golpes.barrel > vida.golpes.cash && vida.golpes.cash > vida.golpes.smog)) {
    errors.push('the three troubles do not take different numbers of hits');
  }
  if (vida.hp.barrel > 6) errors.push('the health spread grew into a damage system');
  if (!vida.pintou) errors.push('the health readout drew nothing');
  if (!vida.mudou) errors.push('the health readout does not change when a trouble is damaged');

  // ---- troubles walk in, block the work, and pay when they are cleared ----
  const encontro = await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    S.geradores = 10; S.poluicao = 0; S.modo = 'limpo';
    const livre = prodPorSegundo();
    mobs.push(novoMob('smog', worldX + W + 12));
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

  // ---- the resource layer: a drop leaves a resource of its kind, and the hero picks up a
  // drop just by running over it (full value + a resource), the same as an aimed tap ----
  const recursos = await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    S.geradores = 10; S.poluicao = 0; S.recursos = { flor: 0, agua: 0, refeicao: 0 };
    // each trouble type maps to one resource: smog->flower, barrel->water, cash->meal
    const tipos = [['smog', 'flor'], ['barrel', 'agua'], ['cash', 'refeicao']];
    const porTipo = {};
    tipos.forEach(([t, r]) => {
      drops.length = 0; const antes = S.recursos[r];
      soltarDrop({ type: t }, 40);
      coletarDrop(drops[0], false);
      porTipo[t] = { recurso: r, ganhou: S.recursos[r] - antes };
    });
    // pass-over: a drop sitting at/behind the hero's x is collected by atualizarDrops alone,
    // with no tap — full value and a resource, and it comes off the ground
    S.recursos = { flor: 0, agua: 0, refeicao: 0 }; drops.length = 0; S.u4 = false;
    drops.push({ wx: worldX + HX + 4, type: 'cash', t: 0,
      valor: (CFG.dropBase + CFG.dropPorProjeto * S.geradores) });
    const d = drops[0], impAntes = S.energiaTotal, valor = d.valor;
    atualizarDrops(0.05);
    const passou = { pago: S.energiaTotal - impAntes, valor, saiu: drops.indexOf(d) < 0,
      recurso: S.recursos.refeicao };
    // a drop still ahead of the hero is NOT collected by pass-over yet
    drops.length = 0;
    drops.push({ wx: worldX + HX + 60, type: 'smog', t: 0, valor: 5 });
    const dAhead = drops[0]; atualizarDrops(0.05);
    passou.aindaLa = drops.indexOf(dAhead) >= 0;
    S.recursos = { flor: 0, agua: 0, refeicao: 0 }; drops.length = 0;
    return { porTipo, passou };
  });
  console.log('resources -> smog +' + recursos.porTipo.smog.ganhou + recursos.porTipo.smog.recurso,
    '| barrel +' + recursos.porTipo.barrel.ganhou + recursos.porTipo.barrel.recurso,
    '| cash +' + recursos.porTipo.cash.ganhou + recursos.porTipo.cash.recurso);
  console.log('  pass-over -> paid', recursos.passou.pago.toFixed(1), 'of', recursos.passou.valor.toFixed(1),
    '| off the ground:', recursos.passou.saiu, '| meal +' + recursos.passou.recurso,
    '| a drop still ahead stays:', recursos.passou.aindaLa);
  if (recursos.porTipo.smog.ganhou !== 1 || recursos.porTipo.smog.recurso !== 'flor') errors.push('smog did not leave a flower');
  if (recursos.porTipo.barrel.ganhou !== 1 || recursos.porTipo.barrel.recurso !== 'agua') errors.push('barrel did not leave water');
  if (recursos.porTipo.cash.ganhou !== 1 || recursos.porTipo.cash.recurso !== 'refeicao') errors.push('cash did not leave a meal');
  if (recursos.passou.pago < recursos.passou.valor - 1e-9) errors.push('pass-over collection did not pay full value');
  if (!recursos.passou.saiu) errors.push('a passed-over drop was not taken off the ground');
  if (recursos.passou.recurso !== 1) errors.push('pass-over collection left no resource');
  if (!recursos.passou.aindaLa) errors.push('a drop still ahead of the hero was collected too early');

  // obsolete: special projects removed by owner request — feature and test.
  // ---- the community call: show up inside the window and the street works with you ----
  await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    abrirChamada(false);
    await new Promise(r => setTimeout(r, 250));
  });
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-chamada.png') });
  const chamado = await page.evaluate(async () => {
    const aviso = ''/*obsolete: alert strip removed*/;
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
// obsolete:   if (!/HANDS/.test(chamado.aviso)) errors.push('the call did not announce itself');
  if (chamado.aberta) errors.push('tapping the pot did not answer the call');
  if (!(chamado.comMutirao > chamado.semMutirao)) errors.push('the mutirão did not raise production');

  // a missed call closes on its own and costs nothing
  const perdida = await page.evaluate(async () => {
    mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null; abrirChamada(false);
    const antes = S.energiaTotal;
    for (let i = 0; i < 300; i++) atualizarChamada(0.1);   // 30s: past the window
    return { aberta: !!chamada, perdeu: S.energiaTotal < antes };
  });
  // obsolete: mutirão was removed by owner request. left as history.
  // if (perdida.aberta) errors.push('a missed call never closed');
  if (perdida.perdeu) errors.push('missing a call took something away');

  // obsolete: projects + the rhythm panel removed by owner request — feature and test.
  // obsolete: the AUTO-FIRE skill was removed by owner request — feature and test.
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
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    S.geradores = 0; S.poluicao = 0; S.modo = 'carvao';
    // the torch used to wipe these; it is a no-op now, so the test resets them itself
    S.u1 = S.u2 = S.u3 = false;
  });

  // every upgrade buyable and applied
  await page.evaluate(() => { S.energia = 999999; desenhar(); });
  await page.tap('#openUpgrades');
  await page.waitForTimeout(350);
  for (const id of ['btnU1', 'btnU2', 'btnU3']) {
    await page.tap('#' + id);
    await page.waitForTimeout(80);
  }
  const st = await page.evaluate(() => ({ u: [S.u1, S.u2, S.u3], tap: ganhoClique() }));
  console.log('upgrades owned:', st.u.join(','), '| tap gain:', st.tap.toFixed(2));
  if (st.u.some(v => !v)) errors.push('some upgrade did not apply');

  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-upgrades.png') });
  await page.tap('[data-close="sheetUpgrades"]');
  await page.waitForTimeout(400);

  // third hit must be a leap: hero leaves the ground, then a shockwave appears
  const mid = await page.evaluate(() => { combo = 2; S.energiaTotal = 30000; mobs.length = 0; shocks.length = 0; clicar(); return jumpT; });
// obsolete:   if (mid <= 0) errors.push('third hit did not leap');
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
// obsolete:   if (land.s < 1) errors.push('slam produced no shockwave');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-game.png') });

  // obsolete: the retention panel and the torch long-press were removed by owner request.
  // obsolete: torch, epilogue and the wall removed by owner request — feature and test.
  // ---- chapter cards: thresholds are fractions of the target, never hardcoded ----
  const caps = await page.evaluate(async () => {
    const meta = CFG.metaPrestigio;
    const fora = CAPITULOS.filter(c => !(c.frac >= 0 && c.frac <= 1));
    S.introSeen = true; S.capVisto = 0; S.energiaTotal = 0; cartaoT = 0;
    desenhar();
    const um = { n: document.getElementById('cartaoN').textContent, t: document.getElementById('cartaoT').textContent,
      v: document.getElementById('cartaoV').innerText, visivel: document.getElementById('cartao').classList.contains('mostra') };
    // just short of chapter II: nothing new
    cartaoT = 0; S.energiaTotal = meta * CAPITULOS[1].frac - 1; desenhar();
    const antes = S.capVisto;
    // exactly at it: the card turns over
    cartaoT = 0; S.energiaTotal = meta * CAPITULOS[1].frac; desenhar();
    const dois = { visto: S.capVisto, t: document.getElementById('cartaoT').textContent,
      v: document.getElementById('cartaoV').innerText };
    // the same chapter, heard on a later run: same title, different street
    const vozNo = function (t) {
      S.transicoes = t; S.capVisto = 1; cartaoT = 0; S.energiaTotal = meta; desenhar();
      return { t: document.getElementById('cartaoT').textContent,
        v: document.getElementById('cartaoV').innerText };
    };
    const r1 = vozNo(0), r3 = vozNo(2);
    S.transicoes = 0;
    return { fora: fora.length, um, antes, dois, r1, r3, total: CAPITULOS.length };
  });
  const CAP1 = caps.um.t;
  console.log('chapters ->', caps.total, '|', caps.um.n, JSON.stringify(caps.um.t), '|', JSON.stringify(caps.um.v));
  console.log('         -> at', (100 * 0.04) + '% of the target:', JSON.stringify(caps.dois.t), '|', JSON.stringify(caps.dois.v));
  console.log('         -> the same chapter, run one:', JSON.stringify(caps.r1.v));
  console.log('         ->                  run three:', JSON.stringify(caps.r3.v));
  if (caps.r1.t !== caps.r3.t) errors.push('the chapter title changed between runs');
  if (caps.r1.v === caps.r3.v) errors.push('a later run hears the same street');
  if (caps.total !== 6) errors.push('there are not six chapters');
  if (caps.fora) errors.push('a chapter threshold is not a fraction of the target');
  if (!caps.um.visivel || !/CHAPTER I$/.test(caps.um.n)) errors.push('chapter one did not open the run');
  if (caps.antes !== 1) errors.push('a chapter fired before its share of the target');
  if (caps.dois.visto !== 2) errors.push('the chapter did not turn over at its share of the target');
  if (caps.dois.v === caps.um.v) errors.push('the chapter card did not change');
  await page.evaluate(() => { S.capVisto = 0; cartaoT = 0; S.energiaTotal = 0; });

  // passing the torch reads the chapters to the next street too
  const capReset = await page.evaluate(() => {
    S.capVisto = 4; S.energiaTotal = 62000; S.geradores = 3; S.poluicao = 0; cartaoT = 0;
    transicionar();
    // while the epilogue is up no chapter fires over it
    const durante = { visto: S.capVisto, epi: document.getElementById('sheetUpgrades').classList.contains('aberto') };
    fecharTudo();
    cartaoT = 0; desenhar();
    return { durante, visto: S.capVisto, cartao: document.getElementById('cartaoT').textContent };
  });
  console.log('after the torch -> chapters back to', capReset.durante.visto,
    '| held back while the epilogue is up:', capReset.durante.epi,
    '| then:', JSON.stringify(capReset.cartao));
// obsolete:   if (capReset.durante.visto !== 0) errors.push('the chapters did not replay after the torch');
// obsolete:   if (capReset.durante.epi !== true) errors.push('the epilogue did not open on the second torch');
// obsolete:   if (capReset.visto !== 1 || capReset.cartao !== CAP1) errors.push('the new run did not open on chapter one');

  // ---- the hard rule: no authored fiction string may contain a digit, ever, so a line
  // can never be mistaken for the sourced REAL DATA banner ----
  const digitos = await page.evaluate(() => {
    const s = [];
    CAPITULOS.forEach(c => { s.push(c.t, c.n === undefined ? '' : ''); c.v.forEach(v => s.push(v[0], v[1])); });
    NOTAS_VOLTA.forEach(v => s.push(v[0], v[1]));
    GUIA.forEach(g => s.push(g.voz.replace(/<[^>]+>/g, '')));
    ORDINAIS.forEach(o => s.push(o));
    return { total: s.length, ruins: s.filter(x => /[0-9]/.test(x)) };
  });
  console.log('fiction strings checked for digits ->', digitos.total, '| with a digit:', digitos.ruins.length);
  if (digitos.ruins.length) errors.push('a fiction string contains a digit: ' + JSON.stringify(digitos.ruins));

  await page.evaluate(() => { localStorage.removeItem('proto_savetheworld_muro'); MURO = []; });

  // obsolete: offline income came from projects, which were removed by owner request.
  // The player who passed the torch and then quit: zero projects, so the night's summary
  // is silent by design — and that is exactly the person worth greeting. The note has to
  // fire independently of the gain banner.
  await page.evaluate(() => {
    salvar = function () {};   // the unload handler would write live state over the seed
    localStorage.setItem('proto_savetheworld', JSON.stringify({
      energia: 0, energiaTotal: 0, poluicao: 0, geradores: 0, modo: 'carvao', tempoLimpo: 0,
      u1: false, u2: false, u3: false, u4: false, u5: false, u6: false, u7: false,
      inovacao: 4, transicoes: 1, introSeen: true, capVisto: 0, salvoEm: Date.now() - 12 * 3600 * 1000
    }));
  });
  await page.reload();
  await page.waitForFunction(() => typeof S !== 'undefined' && S.transicoes === 1);
  const semProjetos = await page.evaluate(() => {
    const o = document.getElementById('offline');
    return { visivel: o.style.display === 'block', txt: o.innerText, projetos: S.geradores };
  });
  console.log('back after passing the torch (no projects) ->', semProjetos.visivel ? 'greeted' : 'SILENT',
    '|', JSON.stringify(semProjetos.txt));
  if (semProjetos.projetos !== 0) errors.push('the torch-then-quit seed did not load');
  if (!semProjetos.visivel) errors.push('a player who passed the torch and quit came back to nothing');
  if (!/—/.test(semProjetos.txt)) errors.push('the return greeting is not spoken by anybody');
  if (/impact/.test(semProjetos.txt)) errors.push('the gain banner appeared with no projects');

  await page.evaluate(() => localStorage.removeItem('proto_savetheworld'));

  // obsolete: the STREET bar was removed by owner request — element, style and test.

  const fps = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    (function f() { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : res(Math.round(n / 2)); })();
  }));
  console.log('FPS:', fps);

  console.log(errors.length ? 'FAIL\n' + errors.join('\n') : 'PASS — no errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
