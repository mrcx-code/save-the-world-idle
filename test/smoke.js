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
    // tap already seen, and now a couple of projects are running: the rhythm step is next
    S.guiaVistos = ['tap']; S.geradores = 2; S.energia = 0; S.transicoes = 0;
    esconderGuia(); cartaoT = 0; fecharTudo();
    desenhar();
    const primeiro = guiaAtual, apontaRitmo = document.getElementById('modeQuick').classList.contains('guiaAlvo');
    dispensarGuia();                                   // "got it"
    const aposOk = { atual: guiaAtual, visto: S.guiaVistos.slice() };
    // with tap+rhythm seen and no money, nothing else qualifies — the bubble stays down
    esconderGuia(); S.geradores = 0; desenhar();
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
    S.u1 = S.u2 = S.u3 = S.u4 = S.u5 = S.u6 = S.u7 = false;
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

  // ---- THE SUPER: three combos land, and the next swing is not a swing ----
  const sup = await page.evaluate(async () => {
    fecharTudo();
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0;
    superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    S.geradores = 10; S.poluicao = 0; S.modo = 'limpo'; S.u2 = false; S.u4 = false;
    const passos = [];
    // exactly CFG.superCombos completed combos arm it, and not one swing sooner
    for (let i = 0; i < CFG.superCombos * 3; i++) { clicar(); passos.push(superCarga); }
    const armado = superPronto(), cargaCheia = superCarga;
    const botao = document.getElementById('btnClique').className;   // read it while it is armed
    const dica = document.getElementById('dicaHold').textContent;
    const pipsAcesos = document.querySelectorAll('#cargaSuper i.on').length;
    // a swing one short of a full combo must not arm it
    const antesDeArmar = passos[CFG.superCombos * 3 - 2];

    // the road is full when it goes off
    ['smog', 'barrel', 'cash'].forEach((t, i) => {
      const m = novoMob(t, worldX + HX + 26 + i * 20); m.parado = true; mobs.push(m);
    });
    const bloqueadoAntes = bloqueioMundo(), taxaAntes = prodPorSegundo();
    const cansacoAntes = S.poluicao, dropsAntes = drops.length;
    clicar();                                   // ...and this is the super
    const emPe = mobs.filter(m => m.dying <= 0).length;
    const r = { armado, cargaCheia, antesDeArmar, bloqueadoAntes, taxaAntes,
      bloqueadoDepois: bloqueioMundo(), taxaDepois: prodPorSegundo(),
      cansacoAntes, cansacoDepois: S.poluicao, emPe, novosDrops: drops.length - dropsAntes,
      janela: superT, recarga: superCd, cargaDepois: superCarga, fx: !!superFx,
      classeFlash: document.getElementById('flash').className,
      botao, dica, pipsAcesos };

    // while it is recharging, swings do not build it
    for (let i = 0; i < CFG.superCombos * 3 + 3; i++) clicar();
    r.cargaNaRecarga = superCarga;

    // neither the wand's shots nor the neighbours' auto-taps charge it
    superCd = 0; superCarga = 0; superSwings = 0;
    for (let i = 0; i < CFG.superCombos * 3; i++) clicar(true);        // wand
    for (let i = 0; i < CFG.superCombos * 3; i++) clicar(false, true); // neighbours
    r.cargaSemMao = superCarga;

    // and the whole thing never touches tiredness
    superCd = 0; superCarga = 0; superSwings = 0; S.poluicao = 100; S.u2 = false;
    for (let i = 0; i < CFG.superCombos * 3 + 1; i++) clicar();
    r.cansacoDepoisDoSuper = S.poluicao;
    r.disparouDeNovo = superT > 0;

    superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    mobs.length = 0; drops.length = 0; S.poluicao = 0;
    return r;
  });
  console.log('super -> armed after', CFG_COMBOS * 3, 'swings:', sup.armado,
    '| charge', sup.antesDeArmar, '->', sup.cargaCheia, '| pips lit', sup.pipsAcesos, '| button "' + sup.botao + '" says "' + sup.dica + '"');
  console.log('  it fires -> road', sup.emPe, 'left standing (was 3), drops +' + sup.novosDrops,
    '| block ×' + sup.bloqueadoAntes.toFixed(2), '-> ×' + sup.bloqueadoDepois.toFixed(2),
    '| rate', sup.taxaAntes.toFixed(1), '->', sup.taxaDepois.toFixed(1));
  console.log('  window', sup.janela.toFixed(1) + 's · recharge', sup.recarga.toFixed(0) + 's'
    + ' | screen effect:', sup.fx, '| flash "' + sup.classeFlash + '"');
  console.log('  charge while recharging:', sup.cargaNaRecarga,
    '| from the wand and the neighbours:', sup.cargaSemMao,
    '| tiredness 100 ->', sup.cansacoDepoisDoSuper);
  if (!sup.armado) errors.push('three combos did not arm the super');
  if (sup.antesDeArmar >= sup.cargaCheia) errors.push('the super armed before the third combo finished');
  if (sup.cargaDepois !== 0) errors.push('the super did not spend its charge');
  if (sup.emPe > 0) errors.push('the super did not clear the road');
  if (sup.novosDrops < 3) errors.push('the super cleared the road without leaving the drops');
  if (!(sup.bloqueadoDepois > sup.bloqueadoAntes)) errors.push('clearing the road did not lift the block');
  if (!(sup.taxaDepois > sup.taxaAntes)) errors.push('the super did not raise production');
  if (!(sup.janela > 0)) errors.push('the super opened no window');
  if (!(sup.recarga > 0)) errors.push('the super has no cooldown — it would fire every 1.3s while held');
  if (!sup.fx) errors.push('the super produced no screen effect state');
  if (!/super/.test(sup.classeFlash)) errors.push('the super did not wash the frame');
  if (!/super/.test(sup.botao)) errors.push('the button never showed the super was ready');
  if (sup.pipsAcesos !== CFG_COMBOS) errors.push('the charge readout does not show a full super');
  if (sup.dica !== 'SUPER') errors.push('the button still said HOLD with a super armed');
  if (sup.cargaNaRecarga !== 0) errors.push('the super charged while it was recharging');
  if (sup.cargaSemMao !== 0) errors.push('the wand or the neighbours charged the super');
  if (sup.cansacoDepoisDoSuper !== 100) errors.push('THE SUPER TOUCHED TIREDNESS');
  if (!sup.disparouDeNovo) errors.push('the super never fired a second time');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-super.png') });

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
  if (recursos.passou.pago < recursos.passou.valor) errors.push('pass-over collection did not pay full value');
  if (!recursos.passou.saiu) errors.push('a passed-over drop was not taken off the ground');
  if (recursos.passou.recurso !== 1) errors.push('pass-over collection left no resource');
  if (!recursos.passou.aindaLa) errors.push('a drop still ahead of the hero was collected too early');

  // ---- special projects: a combo of resources funds a one-time, within-run bonus ----
  const esp = await page.evaluate(async () => {
    fecharTudo();
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    S.geradores = 20; S.poluicao = 30; S.modo = 'limpo'; S.tempoLimpo = 300; S.especiais = {};
    const g = CFG.especiais.find(e => e.id === 'garden');   // 12 flowers + 6 water -> +6% production
    // one short of the water it needs: not affordable, button off
    S.recursos = { flor: g.custo.flor, agua: g.custo.agua - 1, refeicao: 0 };
    desenhar();
    const pobre = { pode: podeEspecial(g), completou: completarEspecial('garden'),
      botao: document.getElementById('btnEsp_garden').disabled, feito: !!S.especiais.garden };
    // exactly the right combo: affordable
    S.recursos = { flor: g.custo.flor, agua: g.custo.agua, refeicao: 3 };
    desenhar();
    const prodAntes = prodPorSegundo(), cansacoAntes = S.poluicao;
    const podeAgora = podeEspecial(g), botaoOn = !document.getElementById('btnEsp_garden').disabled;
    const ok = completarEspecial('garden');
    const prodDepois = prodPorSegundo();
    // spends exactly the cost, leaves the rest, and cannot be built twice
    const rest = { flor: S.recursos.flor, agua: S.recursos.agua, refeicao: S.recursos.refeicao };
    const denovo = completarEspecial('garden');
    // it survives to the sheet as "built", and the multiplier is real and mode-neutral
    const cardFeito = document.getElementById('esp_garden').classList.contains('feito');
    S.especiais = {}; S.recursos = { flor: 0, agua: 0, refeicao: 0 }; S.poluicao = 0; S.geradores = 0;
    return { pobre, podeAgora, botaoOn, ok, denovo, prodAntes, prodDepois, cansacoAntes,
      cansacoDepois: cansacoAntes, mult: g.prod, rest, custo: g.custo, cardFeito };
  });
  console.log('special project (garden) -> one short: affordable', esp.pobre.pode, '| button off', esp.pobre.botao,
    '| built anyway', esp.pobre.feito);
  console.log('  right combo -> affordable', esp.podeAgora, '| built', esp.ok, '| twice', esp.denovo,
    '| prod', esp.prodAntes.toFixed(1), '->', esp.prodDepois.toFixed(1), '(×' + esp.mult + ')',
    '| resources left', JSON.stringify(esp.rest));
  if (esp.pobre.pode || esp.pobre.completou || esp.pobre.feito) errors.push('a special project was affordable without its full combo');
  if (!esp.pobre.botao) errors.push('the build button was enabled without the resources');
  if (!esp.podeAgora || !esp.botaoOn || !esp.ok) errors.push('the right combo did not fund the special project');
  if (esp.denovo) errors.push('a one-time special project was built twice');
  if (Math.abs(esp.prodDepois / esp.prodAntes - esp.mult) > 1e-6) errors.push('the special project bonus did not apply to production');
  if (esp.rest.flor !== 0 || esp.rest.agua !== 0 || esp.rest.refeicao !== 3) errors.push('completing the project spent the wrong resources');
  if (!esp.cardFeito) errors.push('a built special project is not marked built on the sheet');

  // THE hard rule: building a special project may never touch tiredness
  const espCansaco = await page.evaluate(() => {
    S.geradores = 20; S.poluicao = 100; S.modo = 'limpo'; S.especiais = {};
    S.recursos = { flor: 50, agua: 50, refeicao: 50 };
    const antes = S.poluicao;
    CFG.especiais.forEach(e => completarEspecial(e.id));   // build every one
    const depois = S.poluicao, feitos = Object.keys(S.especiais).filter(k => S.especiais[k]).length;
    S.especiais = {}; S.recursos = { flor: 0, agua: 0, refeicao: 0 }; S.poluicao = 0; S.geradores = 0;
    return { antes, depois, feitos, total: CFG.especiais.length };
  });
  console.log('  built all', espCansaco.feitos, 'of', espCansaco.total, '-> tiredness', espCansaco.antes, '->', espCansaco.depois);
  if (espCansaco.feitos !== espCansaco.total) errors.push('not every special project could be built');
  if (espCansaco.depois !== espCansaco.antes) errors.push('BUILDING A SPECIAL PROJECT TOUCHED TIREDNESS');

  // the panel opens from the projects sheet, in the sheet language
  const espPainel = await page.evaluate(async () => {
    fecharTudo(); abrir('sheetProjects');
    await new Promise(r => setTimeout(r, 150));
    document.getElementById('abrirEspeciais').click();
    await new Promise(r => setTimeout(r, 200));
    return { aberto: document.getElementById('sheetEspeciais').classList.contains('aberto'),
      projFechou: !document.getElementById('sheetProjects').classList.contains('aberto'),
      cards: document.querySelectorAll('#listaEspeciais .especialCard').length,
      linha: document.getElementById('recursoLinha').textContent };
  });
  console.log('  panel opens from projects ->', espPainel.aberto, '| cards', espPainel.cards,
    '| resource line', JSON.stringify(espPainel.linha));
  if (!espPainel.aberto) errors.push('the special projects panel did not open');
  if (espPainel.cards !== espCansaco.total) errors.push('the special projects panel is missing cards');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-especiais.png') });
  // hand the next block back the world state it expects (10 projects, GO STEADY, rested)
  await page.evaluate(() => { fecharTudo(); S.especiais = {}; S.recursos = { flor: 0, agua: 0, refeicao: 0 };
    S.geradores = 10; S.poluicao = 0; S.modo = 'limpo'; });

  // ---- the community call: show up inside the window and the street works with you ----
  await page.evaluate(async () => {
    mobs.length = 0; drops.length = 0; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
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
    mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null; abrirChamada(false);
    const antes = S.energiaTotal;
    for (let i = 0; i < 300; i++) atualizarChamada(0.1);   // 30s: past the window
    return { aberta: !!chamada, perdeu: S.energiaTotal < antes };
  });
  // obsolete: mutirão was removed by owner request. left as history.
  // if (perdida.aberta) errors.push('a missed call never closed');
  if (perdida.perdeu) errors.push('missing a call took something away');

  // ---- what a project is, and buying more than one of them ----
  // the sheet has to say what you GET, not only what you pay
  const explica = await page.evaluate(() => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null;
    S.geradores = 12; S.energia = 0; S.poluicao = 0; S.modo = 'limpo'; S.tempoLimpo = 200;
    S.u1 = S.u3 = false; S.qtdCompra = 1;
    desenhar();
    const antes = prodPorSegundo();
    const previsto = taxaDeUmProjeto();
    S.geradores++;
    const real = prodPorSegundo() - antes;
    S.geradores--;
    return { previsto, real, linha1: document.getElementById('oQueEh').textContent,
      linha2: document.getElementById('oQueDa').textContent, total: antes };
  });
  console.log('project explained ->', JSON.stringify(explica.linha1));
  console.log('                  ->', JSON.stringify(explica.linha2));
  if (Math.abs(explica.previsto - explica.real) > 1e-9) errors.push('the advertised rate per project is not the real one');
  if (explica.linha1.indexOf('12 projects') < 0) errors.push('the sheet does not connect running projects to the rate');
  if (!/forever/.test(explica.linha2)) errors.push('the sheet does not say a project is permanent');
  if (!/15%/.test(explica.linha2)) errors.push('the sheet does not say the price climbs');

  // MAX buys exactly what the money covers, and buying one at a time lands identically
  const max = await page.evaluate(() => {
    const guarda = JSON.stringify(S);
    S.geradores = 12; S.energia = 0;
    // fund exactly 7 projects, plus a little that cannot buy an eighth
    let fundo = 0;
    for (let i = 0; i < 7; i++) fundo += Math.ceil(15 * Math.pow(1.15, 12 + i));
    const oitavo = Math.ceil(15 * Math.pow(1.15, 19));
    S.energia = fundo + oitavo - 1;
    S.qtdCompra = 'max'; desenhar();
    const rotulo = document.getElementById('btnGerador').textContent;
    const n = comprarGerador('max');
    const depoisMax = { n, ger: S.geradores, energia: S.energia };

    // same balance, bought one at a time
    S.geradores = 12; S.energia = fundo + oitavo - 1;
    let um = 0;
    while (comprarGerador(1) > 0) um++;
    const depoisUm = { n: um, ger: S.geradores, energia: S.energia };

    // nothing affordable: MAX must buy zero and must not go negative
    S.geradores = 12; S.energia = 1; desenhar();
    const rotuloPobre = document.getElementById('btnGerador').textContent;
    const desabilitado = document.getElementById('btnGerador').disabled;
    const zero = comprarGerador('max');
    const pobre = { zero, ger: S.geradores, energia: S.energia, rotuloPobre, desabilitado };

    // x10 buys exactly ten when ten are affordable
    S.geradores = 0; S.energia = 1e6; S.qtdCompra = 10; desenhar();
    const dez = comprarGerador(10);

    Object.assign(S, JSON.parse(guarda));
    return { rotulo, depoisMax, depoisUm, pobre, dez, esperado: 7, sobra: oitavo - 1 };
  });
  console.log('buy MAX ->', JSON.stringify(max.rotulo), '| bought', max.depoisMax.n,
    'leaving', Math.round(max.depoisMax.energia), '(expected', max.esperado, '/', max.sobra + ')');
  console.log('one at a time ->', max.depoisUm.n, 'leaving', Math.round(max.depoisUm.energia),
    '| x10 bought', max.dez, '| broke:', JSON.stringify(max.pobre.rotuloPobre));
  if (max.depoisMax.n !== max.esperado) errors.push('MAX did not buy every project the money covered');
  if (Math.abs(max.depoisMax.energia - max.sobra) > 1e-6) errors.push('MAX left the wrong remainder');
  if (max.depoisMax.n !== max.depoisUm.n || max.depoisMax.ger !== max.depoisUm.ger) {
    errors.push('MAX and one-at-a-time bought different amounts');
  }
  if (Math.abs(max.depoisMax.energia - max.depoisUm.energia) > 1e-6) errors.push('MAX and one-at-a-time spent different money');
  if (max.pobre.zero !== 0 || max.pobre.ger !== 12) errors.push('MAX bought something it could not afford');
  if (max.pobre.energia < 0) errors.push('buying drove the balance negative');
  if (!max.pobre.desabilitado || !/NOT ENOUGH/.test(max.pobre.rotuloPobre)) errors.push('the buy button lied about being affordable');
  if (max.dez !== 10) errors.push('x10 did not buy ten');

  // ---- the rhythm: the one decision this prototype exists to measure ----
  // Mid-game, GO STEADY with the ramp fully climbed: the panel has to show that switching
  // buys a burst now and costs almost everything later.
  const ritmo = await page.evaluate(() => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null; modoAviso = null;
    S.geradores = 43; S.energia = 40000; S.energiaTotal = 30000; S.poluicao = 0;
    S.u1 = S.u3 = S.u6 = true; S.modo = 'limpo'; S.tempoLimpo = 200;
    desenhar();
    const txt = id => document.getElementById(id).textContent;
    return {
      titA: txt('rTitA'), titB: txt('rTitB'),
      agoraA: taxaAgora('limpo'), fimA: taxaAssentada('limpo'),
      agoraB: taxaAgora('carvao'), fimB: taxaAssentada('carvao'),
      mostraTaxaA: txt('rTaxaA'), mostraFimA: txt('rFimA'), mostraSaudeA: txt('rSaudeA'),
      mostraTaxaB: txt('rTaxaB'), mostraFimB: txt('rFimB'), mostraSaudeB: txt('rSaudeB'),
      aviso: txt('avisoRampa'), avisoVisivel: document.getElementById('avisoRampa').className.includes('mostra'),
      rampa: rampaAtual(), chip: txt('modeNome') + ' ' + txt('modeSub'), tend: txt('tendencia')
    };
  });
  console.log('rhythm panel · now', ritmo.mostraTaxaA, '/ settles', ritmo.mostraFimA, '/ team', ritmo.mostraSaudeA);
  console.log('             · switch', ritmo.mostraTaxaB, '/ settles', ritmo.mostraFimB, '/ team', ritmo.mostraSaudeB);
  console.log('             · chip:', JSON.stringify(ritmo.chip), '| warning:', JSON.stringify(ritmo.aviso));
  if (!(ritmo.agoraB > ritmo.agoraA)) errors.push('GO FAST is not shown as faster right now');
  if (!(ritmo.fimB < ritmo.fimA)) errors.push('the panel does not show that GO FAST settles lower');
  if (ritmo.mostraFimB === ritmo.mostraTaxaB) errors.push('now and settles read the same for GO FAST');
  if (!/100% . 5%/.test(ritmo.mostraSaudeB)) errors.push('the projected team health for GO FAST is wrong: ' + ritmo.mostraSaudeB);
  if (!ritmo.avisoVisivel) errors.push('the ramp-reset warning did not show while a ramp was built');
  if (ritmo.aviso.indexOf(ritmo.rampa.toFixed(2)) < 0) errors.push('the warning does not name the ramp being lost');
  if (!/STEADY/.test(ritmo.chip)) errors.push('the mode chip does not name the rhythm');

  // the numbers must be the real ones: what the panel promises, stepping the economy delivers
  const honesto = await page.evaluate(() => {
    const guarda = JSON.stringify(S);
    S.modo = 'carvao'; S.tempoLimpo = 0; S.poluicao = 0;
    const previsto = cansacoEm('carvao', 60), eq = cansacoEq('carvao');
    for (let i = 0; i < 60; i++) simular(1);
    const real = S.poluicao;
    Object.assign(S, JSON.parse(guarda));
    return { previsto, real, eq };
  });
  console.log('projection vs stepping the economy for 60s ->', honesto.previsto.toFixed(2),
    'vs', honesto.real.toFixed(2), '| equilibrium', Math.round(honesto.eq));
  if (Math.abs(honesto.previsto - honesto.real) > 0.5) errors.push('the tiredness projection does not match simular()');

  // the switch itself has to land: flash, floats with real numbers, a line that stays up
  await page.evaluate(() => { fecharTudo(); });
  await page.waitForTimeout(250);
  const trocou = await page.evaluate(() => {
    floats.length = 0;
    const antes = prodPorSegundo(), rampaAntes = S.tempoLimpo;
    definirModo('carvao');
    const f = document.getElementById('flash');
    return {
      classe: f.className, opacidade: parseFloat(getComputedStyle(f).opacity),
      pop: document.getElementById('modeQuick').className,
      textos: floats.map(x => x.txt), aviso: document.getElementById('alerta').textContent,
      rampaAntes, rampaDepois: S.tempoLimpo, antes, depois: prodPorSegundo()
    };
  });
  console.log('switch to GO FAST -> flash', JSON.stringify(trocou.classe), 'opacity',
    trocou.opacidade.toFixed(2), '| floats', JSON.stringify(trocou.textos));
  console.log('                  ->', JSON.stringify(trocou.aviso));
  if (!/fast/.test(trocou.classe) || !(trocou.opacidade > 0.1)) errors.push('the switch did not flash the screen');
  if (!trocou.textos.some(t => /GO FAST/.test(t))) errors.push('the switch did not announce itself');
  if (!trocou.textos.some(t => /RAMP LOST/.test(t))) errors.push('the switch did not report the ramp it threw away');
  if (!trocou.textos.some(t => />/.test(t) && /\/s/.test(t))) errors.push('the switch did not show the rate before and after');
  if (!/TEAM SINKS/.test(trocou.aviso)) errors.push('the strip did not explain the cost of GO FAST');
  if (trocou.rampaDepois !== 0) errors.push('switching did not reset the ramp');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-troca.png') });

  // the mode chip is a state readout, and it says when it is hurting
  const chip = await page.evaluate(async () => {
    S.poluicao = 700; desenhar();
    const q = document.getElementById('modeQuick'), t = document.getElementById('tendencia');
    const cabe = el => el.scrollWidth <= el.clientWidth + 1;
    const doendo = { cls: q.className, sub: document.getElementById('modeSub').textContent,
      tend: t.textContent, cabeChip: cabe(q), cabeTend: cabe(t) };
    definirModo('limpo');
    await new Promise(r => setTimeout(r, 250));
    return { doendo, curando: { cls: document.getElementById('modeQuick').className,
      sub: document.getElementById('modeSub').textContent, tend: t.textContent,
      cabeTend: cabe(t), aviso: document.getElementById('alerta').textContent } };
  });
  console.log('mode chip tiring ->', JSON.stringify(chip.doendo.cls), chip.doendo.sub, '|', chip.doendo.tend);
  console.log('mode chip healing ->', JSON.stringify(chip.curando.cls), chip.curando.sub, '|', chip.curando.tend);
  if (!/doi/.test(chip.doendo.cls)) errors.push('the mode chip does not show that GO FAST is hurting');
  if (/doi/.test(chip.curando.cls)) errors.push('the mode chip still says it hurts in GO STEADY');
  if (!chip.doendo.cabeChip) errors.push('the mode chip text overflows its button');
  if (!chip.doendo.cabeTend || !chip.curando.cabeTend) errors.push('the team trend line is cut off');
  if (!/BACK TO 90%/.test(chip.curando.aviso)) errors.push('the strip did not say when the team recovers');

  // the mode line has to fade on its own and hand the strip back
  const decaiu = await page.evaluate(async () => {
    for (let i = 0; i < 60; i++) { if (modoAviso) modoAviso.t -= 0.1; }
    if (modoAviso && modoAviso.t <= 0) modoAviso = null;
    desenhar();
    return document.getElementById('alerta').textContent;
  });
  if (/GO STEADY —/.test(decaiu)) errors.push('the mode line never goes away');

  // NOTES records this regression once already: no panel may cover the control block.
  // Measured against #controls, not one row inside it, so re-planning the block cannot
  // quietly move the thing the test is protecting.
  const cobre = await page.evaluate(async () => {
    document.getElementById('openProjects').click();
    await new Promise(r => setTimeout(r, 350));
    const s = document.getElementById('sheetProjects').getBoundingClientRect();
    const m = document.getElementById('controls').getBoundingClientRect();
    const f = document.getElementById('fato').getBoundingClientRect();
    const h = getComputedStyle(document.documentElement).getPropertyValue('--hControles');
    return { fundoFolha: s.bottom, topoMenu: m.top, altura: s.height, jan: window.innerHeight,
      hVar: parseFloat(h), hReal: m.height, fundoFato: f.bottom };
  });
  console.log('projects sheet bottom', Math.round(cobre.fundoFolha), 'vs controls top', Math.round(cobre.topoMenu),
    '| sheet height', Math.round(cobre.altura), 'of', cobre.jan);
  console.log('  --hControles', Math.round(cobre.hVar), 'measured from a', Math.round(cobre.hReal),
    'px control block | REAL DATA ends at', Math.round(cobre.fundoFato));
  if (cobre.fundoFolha > cobre.topoMenu) errors.push('the projects sheet covers the control block');
  if (cobre.fundoFato > cobre.topoMenu) errors.push('the REAL DATA ticker covers the control block');
  // the variable has to keep coming from the real block, not from a hardcoded number
  if (!(cobre.hVar >= cobre.hReal && cobre.hVar <= cobre.hReal + 24)) {
    errors.push('--hControles is no longer measured from the control block');
  }

  // ...and it has to be re-measured on resize, which is the other half of that rule
  const aposResize = await page.evaluate(async () => {
    const c = document.getElementById('controls');
    const antes = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hControles'));
    const cresce = document.createElement('div');   // a row growing by 40px, the way a button that gains a line would
    cresce.style.height = '40px';
    c.appendChild(cresce);
    window.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 120));
    const depois = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hControles'));
    const alto = c.getBoundingClientRect().height;
    c.removeChild(cresce);
    window.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 120));
    return { antes, depois, alto,
      volta: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hControles')) };
  });
  console.log('  a button that grows ->', Math.round(aposResize.antes), '->', Math.round(aposResize.depois),
    '(block', Math.round(aposResize.alto) + 'px), back to', Math.round(aposResize.volta));
  if (!(aposResize.depois >= aposResize.alto)) errors.push('--hControles did not follow a control block that grew');
  if (!(aposResize.depois >= aposResize.antes + 38)) errors.push('--hControles did not grow with the block');
  if (Math.abs(aposResize.volta - aposResize.antes) > 1) errors.push('--hControles did not come back down');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-ritmo.png') });
  await page.evaluate(() => {
    fecharTudo();
    S.geradores = 0; S.poluicao = 0; S.modo = 'carvao'; S.tempoLimpo = 0;
    S.u1 = S.u3 = S.u6 = false; modoAviso = null; desenhar();
  });

  // ---- the special skill: AUTO-FIRE ----
  // locked until the first torch, and it cannot be bought by wishing
  const trava = await page.evaluate(() => {
    fecharTudo();
    S.geradores = 0; S.energia = 999999; S.energiaTotal = 0; S.poluicao = 0; S.modo = 'carvao';
    S.u1 = S.u2 = S.u3 = S.u4 = S.u5 = S.u6 = S.u7 = false;
    S.skillAuto = false; S.transicoes = 0; foco = 0; canalizando = 0;
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; superT = 0; superCarga = 0; superSwings = 0; superCd = 0; superFx = null; modoAviso = null;
    desenhar();
    comprarSkill();                       // should refuse: no torch has been passed
    return { comprou: S.skillAuto, botao: document.getElementById('btnSkillAuto').disabled,
      nota: document.getElementById('skillTrava').textContent,
      rotulo: document.getElementById('skillsNota').textContent };
  });
  console.log('skill before the first torch -> bought:', trava.comprou, '| button off:', trava.botao,
    '|', JSON.stringify(trava.rotulo));
  if (trava.comprou) errors.push('the skill was bought before any torch was passed');
  if (!trava.botao) errors.push('the locked skill still offered its buy button');
  if (!/torch/.test(trava.nota)) errors.push('the skills sheet does not say how it unlocks');

  // after a torch it can be learned, and focus does NOT accrue on its own
  const compra = await page.evaluate(async () => {
    S.transicoes = 1; desenhar();
    const antes = S.energia;
    comprarSkill();
    const parado = foco;
    await new Promise(r => setTimeout(r, 700));   // nothing happening: no focus may appear
    return { tem: S.skillAuto, gasto: antes - S.energia, focoParado: parado, focoDepois: foco,
      texto: document.getElementById('focoTexto').textContent };
  });
  console.log('skill learned ->', compra.tem, '| cost', compra.gasto,
    '| focus while idle:', compra.focoParado, '->', compra.focoDepois);
  if (!compra.tem) errors.push('the skill could not be learned after a torch');
  if (compra.gasto !== 2000 && compra.gasto <= 0) errors.push('the skill was free');
  if (compra.focoDepois > 0) errors.push('focus accrued with nothing happening — it is passive after all');

  // focus comes from showing up: clearing a trouble, picking a drop up, answering a call
  const fontes = await page.evaluate(() => {
    foco = 0; canalizando = 0; drops.length = 0;
    soltarDrop({ type: 'smog' }, 40);
    const porMob = foco;
    coletarDrop(drops[0], false);
    const porDrop = foco - porMob;
    foco = 0; drops.length = 0;
    soltarDrop({ type: 'cash' }, 40);
    const antesAuto = foco;
    coletarDrop(drops[0], true);           // the neighbours picking it up gives no focus
    const porAuto = foco - antesAuto;
    return { porMob, porDrop, porAuto };
  });
  console.log('focus per trouble', fontes.porMob, '| per drop picked up', fontes.porDrop,
    '| per drop the neighbours take', fontes.porAuto);
  if (fontes.porMob <= 0) errors.push('clearing a trouble gave no focus');
  if (fontes.porDrop <= 0) errors.push('picking a drop up gave no focus');
  if (fontes.porAuto !== 0) errors.push('focus can be farmed without touching anything');

  // full focus arms it, and it fires on its own with no input at all
  const fogo = await page.evaluate(async () => {
    foco = 0; canalizando = 0; drops.length = 0; mobs.length = 0;
    S.geradores = 0; S.energia = 0; S.energiaTotal = 0; S.poluicao = 0;
    ganharFoco(CFG.focoMax);
    const armou = canalizando, aviso = (desenhar(), document.getElementById('alerta').textContent);
    const t0 = performance.now(), e0 = S.energiaTotal;
    await new Promise(r => setTimeout(r, 1000));
    const disparos = (S.energiaTotal - e0) / ganhoClique();
    return { armou, aviso, disparos, segundos: (performance.now() - t0) / 1000,
      botao: document.getElementById('btnClique').className, restante: canalizando };
  });
  console.log('armed for', fogo.armou.toFixed(1), 's ->', Math.round(fogo.disparos),
    'shots with no input in', fogo.segundos.toFixed(2), 's |', JSON.stringify(fogo.aviso));
  if (fogo.armou <= 0) errors.push('full focus did not arm the wand');
  if (fogo.disparos < 5) errors.push('the wand did not fire on its own');
  if (fogo.disparos > CFG_TIROS * 1.6) errors.push('the wand fired faster than CFG says');
  if (!/CHANNELLING/.test(fogo.aviso)) errors.push('the strip did not announce the channelling');
  if (!/canal/.test(fogo.botao)) errors.push('the attack button does not show it is channelling');

  // holding at the same time must not double the wand's own rate
  const junto = await page.evaluate(async () => {
    foco = 0; canalizando = 0; ganharFoco(CFG.focoMax);
    const e0 = S.energiaTotal;
    const bc = document.getElementById('btnClique');
    bc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await new Promise(r => setTimeout(r, 1000));
    bc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    const total = (S.energiaTotal - e0) / ganhoClique();
    return { total };
  });
  console.log('wand + holding ->', Math.round(junto.total), 'shots/s (wand alone was',
    Math.round(fogo.disparos) + ', hold alone ~7)');
  if (junto.total > CFG_TIROS + 8 + 4) errors.push('holding and channelling doubled each other up');

  // it stops on its own when the focus runs out
  const parou = await page.evaluate(async () => {
    for (let i = 0; i < 400; i++) atualizarWand(0.05);   // 20s: past any channel
    const e0 = S.energiaTotal;
    await new Promise(r => setTimeout(r, 500));
    return { canalizando, foco, ganhouDepois: S.energiaTotal - e0 };
  });
  console.log('after the channel ->', parou.canalizando, 'left | focus', parou.foco,
    '| still earning:', parou.ganhouDepois.toFixed(2));
  if (parou.canalizando > 0 || parou.foco > 0) errors.push('the channel never ended');
  if (parou.ganhouDepois > 0.5) errors.push('the wand kept firing after its focus ran out');

  // THE hard constraint: a shot the wand fired may never touch tiredness
  const cansaco = await page.evaluate(() => {
    S.u2 = true; S.modo = 'limpo'; S.poluicao = 100;
    foco = 0; canalizando = 0; ganharFoco(CFG.focoMax);
    const antes = S.poluicao;
    for (let i = 0; i < 200; i++) atualizarWand(0.05);   // a whole channel of auto shots
    const depoisAuto = S.poluicao;
    S.poluicao = 100;
    for (let i = 0; i < 20; i++) clicar();               // the same count, by hand
    const depoisMao = S.poluicao;
    S.u2 = false; S.modo = 'carvao'; S.poluicao = 0;
    return { antes, depoisAuto, depoisMao };
  });
  console.log('tiredness after a full auto channel:', cansaco.antes, '->', cansaco.depoisAuto,
    '| after 20 taps by hand:', cansaco.depoisMao);
  if (cansaco.depoisAuto !== cansaco.antes) errors.push('AUTO-FIRE moved tiredness — the known failure shape');
  if (cansaco.depoisMao >= cansaco.antes) errors.push('U2 stopped healing on a real tap');

  // and it survives the torch, which is what makes it a skill and not an upgrade
  const skillFicou = await page.evaluate(() => {
    S.u1 = true; S.geradores = 9; S.energiaTotal = CFG.metaPrestigio + 1000; S.poluicao = 0;
    transicionar();
    return { skill: S.skillAuto, u1: S.u1, projetos: S.geradores, foco: foco, sabedoria: S.inovacao };
  });
  console.log('after passing the torch -> skill kept:', skillFicou.skill, '| upgrades reset:',
    !skillFicou.u1, '| projects', skillFicou.projetos, '| focus', skillFicou.foco);
  if (!skillFicou.skill) errors.push('the skill did not survive the torch');
  if (skillFicou.u1 || skillFicou.projetos !== 0) errors.push('the torch stopped resetting the run');
  if (skillFicou.foco !== 0) errors.push('focus carried across the torch');
  await page.evaluate(() => { abrir('sheetSkills'); });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-skills.png') });
  await page.evaluate(() => {
    fecharTudo();
    S.skillAuto = false; S.transicoes = 0; S.inovacao = 0; foco = 0; canalizando = 0;
    S.energia = 0; S.energiaTotal = 0; S.geradores = 0; S.poluicao = 0; S.modo = 'carvao';
    R.tochas = 0; desenhar();
  });

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

  // ---- the epilogue: the torch names a successor and says what the run left behind ----
  // The projects count is read BEFORE transicionar() wipes it; if that ever regresses it
  // shows up here as a zero.
  const epi = await page.evaluate(() => ({
    aberto: document.getElementById('sheetEpilogo').classList.contains('aberto'),
    corpo: document.getElementById('epilogoCorpo').innerText,
    wisdom: document.getElementById('epilogoWisdom').textContent,
    voz: document.getElementById('epilogoVoz').innerText,
    botao: document.getElementById('btnEpilogo').textContent,
    muroBtn: document.getElementById('btnEpilogoMuro').textContent
  }));
  console.log('epilogue ->', epi.aberto ? 'open' : 'NOT OPEN', '|',
    JSON.stringify(epi.corpo.replace(/\n/g, ' / ')), '|', JSON.stringify(epi.botao));
  console.log('         ->', JSON.stringify(epi.voz), '|', JSON.stringify(epi.wisdom));
  if (!epi.aberto) errors.push('passing the torch showed no epilogue');
  if (!/NIA ran the first year/.test(epi.corpo)) errors.push('the epilogue did not name the spark');
  if (!/12 projects/.test(epi.corpo)) errors.push('the epilogue lost the run it was describing (projects read after the wipe?)');
  if (!/MARA/.test(epi.corpo) || !/MARA/.test(epi.botao)) errors.push('the epilogue named no successor');
  if (!/—/.test(epi.voz)) errors.push('the epilogue line is not spoken by anybody');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-epilogo.png') });

  // ---- the wall: written by the torch, and it only ever grows ----
  const muro1 = await page.evaluate(async () => {
    document.getElementById('btnEpilogoMuro').click();
    await new Promise(r => setTimeout(r, 250));
    return {
      aberto: document.getElementById('sheetMuro').classList.contains('aberto'),
      corpo: document.getElementById('muroCorpo').innerText.replace(/\n+/g, ' · '),
      n: MURO.length, nomes: muroNomes(), ultimo: MURO[MURO.length - 1],
      guardado: localStorage.getItem('proto_savetheworld_muro')
    };
  });
  console.log('the wall ->', muro1.n, 'name(s):', JSON.stringify(muro1.corpo));
  if (!muro1.aberto) errors.push('the wall did not open');
  if (!muro1.n) errors.push('the torch wrote no name on the wall');
  if (!muro1.ultimo || muro1.ultimo.nome !== 'NIA' || muro1.ultimo.proj !== 12) {
    errors.push('the wall entry does not describe the run that just ended: ' + JSON.stringify(muro1.ultimo));
  }
  if (!muro1.guardado) errors.push('the wall was not written to its own storage key');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-muro.png') });

  // it must survive the thing that wipes everything else: the game save going away
  const muro2 = await page.evaluate(() => {
    localStorage.removeItem('proto_savetheworld');
    MURO = []; carregarMuro();
    const u = MURO[MURO.length - 1] || {};
    return { n: MURO.length, nome: u.nome, proj: u.proj };
  });
  console.log('wall after the game save is wiped ->', muro2.n, 'entries, last:', JSON.stringify(muro2.nome), muro2.proj, 'projects');
  if (muro2.n !== muro1.n || muro2.nome !== 'NIA') errors.push('the wall did not survive losing the game save');

  // a hand-edited wall must be repaired, never thrown
  const muro3 = await page.evaluate(() => {
    const bom = localStorage.getItem('proto_savetheworld_muro');
    try {
      localStorage.setItem('proto_savetheworld_muro', '[{"nome":"OK"},{"lixo":1},7,null]');
      MURO = []; carregarMuro(); mostrarMuro();
      const meio = MURO.length;
      localStorage.setItem('proto_savetheworld_muro', '{not an array}');
      MURO = []; carregarMuro(); mostrarMuro();
      const vazio = MURO.length;
      localStorage.setItem('proto_savetheworld_muro', bom);
      MURO = []; carregarMuro();
      return { meio: meio, vazio: vazio, voltou: MURO.length };
    } catch (e) { return { erro: String(e) }; }
  });
  console.log('hand-edited wall -> junk rows dropped, kept', muro3.meio, '| not-an-array ->', muro3.vazio,
    '| the real one still loads:', muro3.voltou);
  if (muro3.erro || muro3.meio !== 1 || muro3.vazio !== 0 || muro3.voltou !== muro1.n) {
    errors.push('a corrupted wall broke the game: ' + JSON.stringify(muro3));
  }
  // and it is capped, so a very long-lived device cannot grow localStorage forever
  const muroCap = await page.evaluate(() => {
    const bom = localStorage.getItem('proto_savetheworld_muro');
    for (let i = 0; i < 60; i++) escreverNoMuro('X', 'Y', i, i + 1);
    const n = MURO.length, primeiro = MURO[0].n;
    localStorage.setItem('proto_savetheworld_muro', bom); MURO = []; carregarMuro();
    return { n: n, primeiro: primeiro, max: MURO_MAX };
  });
  console.log('wall cap -> after 60 torches it holds', muroCap.n, '(max', muroCap.max + ') starting at', muroCap.primeiro);
  if (muroCap.n !== muroCap.max) errors.push('the wall is not capped');

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
    const durante = { visto: S.capVisto, epi: document.getElementById('sheetEpilogo').classList.contains('aberto') };
    fecharTudo();
    cartaoT = 0; desenhar();
    return { durante, visto: S.capVisto, cartao: document.getElementById('cartaoT').textContent };
  });
  console.log('after the torch -> chapters back to', capReset.durante.visto,
    '| held back while the epilogue is up:', capReset.durante.epi,
    '| then:', JSON.stringify(capReset.cartao));
  if (capReset.durante.visto !== 0) errors.push('the chapters did not replay after the torch');
  if (capReset.durante.epi !== true) errors.push('the epilogue did not open on the second torch');
  if (capReset.visto !== 1 || capReset.cartao !== CAP1) errors.push('the new run did not open on chapter one');

  // ---- the hard rule: no authored fiction string may contain a digit, ever, so a line
  // can never be mistaken for the sourced REAL DATA banner ----
  const digitos = await page.evaluate(() => {
    const s = [];
    CAPITULOS.forEach(c => { s.push(c.t, c.n === undefined ? '' : ''); c.v.forEach(v => s.push(v[0], v[1])); });
    EPILOGO_VOZ.forEach(v => s.push(v[0], v[1]));
    NOTAS_VOLTA.forEach(v => s.push(v[0], v[1]));
    GUIA.forEach(g => s.push(g.voz[0], g.voz[1].replace(/<[^>]+>/g, '')));
    ELENCO.forEach(n => s.push(n));
    ORDINAIS.forEach(o => s.push(o));
    [1, 2, 3, 5, 6, 9, 10, 40].forEach(t => s.push(caudaMuro(t)));
    s.push(document.getElementById('sheetMuro').querySelector('.avisoPrestigio').textContent);
    return { total: s.length, ruins: s.filter(x => /[0-9]/.test(x)) };
  });
  console.log('fiction strings checked for digits ->', digitos.total, '| with a digit:', digitos.ruins.length);
  if (digitos.ruins.length) errors.push('a fiction string contains a digit: ' + JSON.stringify(digitos.ruins));

  await page.evaluate(() => { localStorage.removeItem('proto_savetheworld_muro'); MURO = []; });

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

  // obsolete: mutirão was removed by owner request. left as history.
  // await page.waitForFunction(() => !!chamada, null, { timeout: 15000 })
  //   .catch(() => errors.push('no call was waiting after a night away'));
  const volta = await page.evaluate(() => {
    const a = document.getElementById('alerta').getBoundingClientRect();
    const o = document.getElementById('offline');
    return { dobrada: chamada && chamada.dobrada, aviso: document.getElementById('alerta').textContent,
      topoAlerta: a.top, fundoOffline: o.getBoundingClientRect().bottom,
      offlineVisivel: o.style.display === 'block' };
  });
  console.log('back after a night ->', JSON.stringify(volta.aviso), '| doubled:', volta.dobrada,
    '| night banner up:', volta.offlineVisivel);
  // obsolete: mutirão was removed by owner request. left as history.
  // if (!volta.dobrada) errors.push('the call kept for a returning player was not doubled');
  // obsolete: mutirão was removed by owner request. left as history.
  // if (volta.offlineVisivel && volta.topoAlerta < volta.fundoOffline) {
  //   errors.push('the call banner is sitting on top of the night summary');
  // }
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-volta.png') });

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

  // ---- the STREET progress moved to a vertical bar on the right edge ----
  // Same state drives it (worldHealth via ruaPct); it now grows in HEIGHT, not width, and it
  // must sit clear of the control block and to the right of the world. A silent regression
  // would be setting width again (no visible fill) — so the fill height is what is checked.
  const rua = await page.evaluate(async () => {
    const guarda = JSON.stringify(S);
    const settle = () => new Promise(r => setTimeout(r, 360));   // clear the .3s height transition
    S.inovacao = 0;
    S.energiaTotal = CFG.metaPrestigio * 0.05; desenhar(); await settle();
    const baixo = document.getElementById('barRua').getBoundingClientRect().height;
    S.energiaTotal = CFG.metaPrestigio * 0.95; desenhar(); await settle();
    const barra = document.getElementById('barRua');
    const alto = barra.getBoundingClientRect().height;
    const track = barra.parentElement.getBoundingClientRect();
    const box = document.getElementById('barraRua').getBoundingClientRect();
    const ctr = document.getElementById('controls').getBoundingClientRect();
    const pct = document.getElementById('ruaPct').textContent;
    Object.assign(S, JSON.parse(guarda)); desenhar();
    return { baixo, alto, trackH: track.height, boxRight: box.right, boxBottom: box.bottom,
      janW: window.innerWidth, ctrTop: ctr.top, pct };
  });
  console.log('street bar -> fill', Math.round(rua.baixo), '->', Math.round(rua.alto),
    'px of', Math.round(rua.trackH), '| readout', rua.pct,
    '| right edge', Math.round(rua.boxRight), 'of', rua.janW, '| bottom', Math.round(rua.boxBottom),
    'vs controls top', Math.round(rua.ctrTop));
  if (!(rua.alto > rua.baixo + 10)) errors.push('the street bar does not grow in height with progress');
  if (rua.boxRight > rua.janW) errors.push('the street bar runs off the right edge');
  if (rua.boxRight < rua.janW - 60) errors.push('the street bar is not pinned to the right side');
  if (rua.boxBottom > rua.ctrTop) errors.push('the street bar overlaps the control block');

  const fps = await page.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    (function f() { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : res(Math.round(n / 2)); })();
  }));
  console.log('FPS:', fps);

  console.log(errors.length ? 'FAIL\n' + errors.join('\n') : 'PASS — no errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
