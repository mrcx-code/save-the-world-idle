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

  // ---- what a project is, and buying more than one of them ----
  // the sheet has to say what you GET, not only what you pay
  const explica = await page.evaluate(() => {
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0;
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
    mobs.length = 0; drops.length = 0; chamada = null; mutiraoT = 0; modoAviso = null;
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

  // NOTES records this regression once already: no panel may cover the menu bar
  const cobre = await page.evaluate(async () => {
    document.getElementById('openProjects').click();
    await new Promise(r => setTimeout(r, 350));
    const s = document.getElementById('sheetProjects').getBoundingClientRect();
    const m = document.getElementById('menuRow').getBoundingClientRect();
    return { fundoFolha: s.bottom, topoMenu: m.top, altura: s.height, jan: window.innerHeight };
  });
  console.log('projects sheet bottom', Math.round(cobre.fundoFolha), 'vs menu top', Math.round(cobre.topoMenu),
    '| sheet height', Math.round(cobre.altura), 'of', cobre.jan);
  if (cobre.fundoFolha > cobre.topoMenu) errors.push('the projects sheet covers the menu bar');
  await page.screenshot({ path: path.resolve(__dirname, '..', 'shot-ritmo.png') });
  await page.evaluate(() => {
    fecharTudo();
    S.geradores = 0; S.poluicao = 0; S.modo = 'carvao'; S.tempoLimpo = 0;
    S.u1 = S.u3 = S.u6 = false; modoAviso = null; desenhar();
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
