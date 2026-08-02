// Headless economy simulation — no browser, just the formulas from test/formulas.js.
// Answers task (a) of CLAUDE.md: does holding the button beat playing the rhythm?
//
// Run: node test/sim.js            (table of strategies, sorted by time to 50k)
//      node test/sim.js --detail   (also prints where the impact came from)
//      node test/sim.js --patch=X  (try a candidate balance fix before shipping it)
const F = require('./formulas');

const DT = 0.05;                       // 20 ticks/s; the page runs on rAF with dt clamped to 0.25
const LIMITE = 24 * 3600;              // give up after a day of game time
const META = F.CFG.metaPrestigio;
const TOQUE_HUMANO = 5;                // taps/s of ordinary poking, not holding

// With no projects there is no income at all, so *every* strategy has to tap its way to
// the first one. Runs that are not holding tap by hand until project #1 is paid for and
// then keep their hands off.

// Balance variants, so a change can be measured before it is written into the game.
// `none` must behave exactly like the shipped clicar() — asserted at startup.
//   u2Sempre  — what shipped before 2026-08-02: U2 healed on every tap, in any mode.
//               Held at 6.9 taps/s that is 13.8 tiredness/s, more than 43 projects
//               emit, so GO FAST became free. Kept here so the regression stays visible.
//   tapCansa  — rejected: a swing in GO FAST tires the team, like one more project
//   curaCap   — rejected: U2 heals 2 per tap but never faster than 3 tiredness/s
//   semMundo  — turns off everything added on 2026-08-02 (troubles that block the work,
//               drops, community calls, the per-day bonus), so the table from before that
//               session can be reproduced on demand and the delta stays measurable.
const PATCHES = {
  none: { cura: S => (S.modo === 'limpo' ? 2 : 0), cansa: () => 0 },
  u2Sempre: { cura: () => 2, cansa: () => 0 },
  tapCansa: { cura: () => 2, cansa: S => (S.modo === 'carvao' ? F.CFG.poluicaoPorGerador * (S.u1 ? 1.5 : 1) : 0) },
  curaCap: {
    limite: 3,
    cura(S, st) { const c = Math.min(2, st.curaBudget); st.curaBudget -= c; return c; },
    cansa: () => 0
  },
  semMundo: { cura: S => (S.modo === 'limpo' ? 2 : 0), cansa: () => 0, mundo: false },
  //   semSuper  — turns off the super (three combos → the road clears and the street works
  //               with you for a few seconds), so its own delta stays measurable the way
  //               semMundo keeps the world layer's delta measurable.
  semSuper: { cura: S => (S.modo === 'limpo' ? 2 : 0), cansa: () => 0, super: false },
  // Is the GO STEADY ramp reset (S.tempoLimpo = 0 on every switch) too harsh? It is the
  // sharpest hidden cost in the game, so measure the alternatives instead of arguing.
  //   rampaMeia — a switch keeps half the time already climbed
  //   rampaFica — the ramp survives switching entirely
  rampaMeia: { cura: S => (S.modo === 'limpo' ? 2 : 0), cansa: () => 0, rampaMantida: 0.5 },
  rampaFica: { cura: S => (S.modo === 'limpo' ? 2 : 0), cansa: () => 0, rampaMantida: 1 }
};

// ---- the world, mirrored ----
// A nominal phone viewport decides how long a trouble takes to walk in, computed the way
// fitCanvas() computes it on a 390px screen. Everything else comes straight from CFG.
const VP_W = Math.max(160, Math.ceil(390 / 2));
const VP_HX = Math.round(VP_W * 0.26);
const VIAGEM = (VP_W + 12 - (VP_HX + 26)) / F.CFG.mobVel;   // seconds of warning before it blocks
// how many hits an arrival takes, on average, in the rhythm you are in — F.hpMedio()
// reads CFG.mobHp and CFG.mobMix, so widening the spread moves this table with it
const DANO_TOQUE = 4 / 3;           // the 3-hit combo deals 1, 1, 2
const MIRA_POR_SEG = 1;             // aimed presses a world-tapper makes per second
const DANO_MIRA = 2;                // ...each landing double a blind swing on what it hits

function novoMundo() {
  return { mobs: [], drops: [], spawnT: 0, chamadaT: 0, chamada: 0, atendidas: 0, perdidas: 0,
    foco: 0, canalizando: 0, canais: 0, tiros: 0,
    // the super: charged by the player's own swings, gated by its cooldown
    sCarga: 0, sSwings: 0, sCd: 0, supers: 0 };
}

// THE SUPER, mirrored. One player swing's worth of bookkeeping: three completed combos arm
// it, the next swing spends it, and it then stops charging for superRecarga seconds — which
// is what makes it a once-per-~23s event whether you hold the button or poke at it.
// The payoff is deliberately NOT swing damage (taps are 4–7% of total impact): the road is
// cleared, everything on it drops what it held, and a mutirão-shaped window opens. It never
// touches tiredness — there is no path from here to S.poluicao, in either direction.
function swingDoJogador(S, m) {
  if (m.sCarga >= F.CFG.superCombos) {
    m.sCarga = 0; m.sSwings = 0; m.sCd = F.CFG.superRecarga; m.supers++;
    S.superT = F.CFG.superSeg;
    for (const mob of m.mobs) m.drops.push({ t: 0, valor: F.valorDrop(S) });
    m.mobs = []; S.mobsParados = 0;
    return;
  }
  if (m.sCd > 0) return;
  m.sSwings++;
  if (m.sSwings % F.CFG.superCombos === 0) m.sCarga++;
}
// AUTO-FIRE's fuel. Focus only comes from showing up for the world, and the world is
// rate-capped, so the skill cannot run away no matter how long it is left alone.
function ganharFoco(S, m, n) {
  if (!S.skillAuto || m.canalizando > 0) return;
  const antes = m.foco;
  m.foco = Math.min(F.CFG.focoMax, m.foco + n);
  if (m.foco >= F.CFG.focoMax && antes < F.CFG.focoMax) {
    m.canalizando = F.CFG.focoMax / F.CFG.autoFogoDreno;
    m.canais++;
  }
}
// one tick of troubles, drops and calls. `toques` is how many swings happened this tick —
// swings hit everything already standing in front of the hero, exactly like clicar() does.
function passoMundo(S, est, m, DT, toques) {
  const smog = Math.min(0.8, (1 - F.eficiencia(S)) * 1.6);
  m.spawnT += DT;
  if (m.spawnT >= F.CFG.mobIntervalo / (1 + smog)) {
    m.spawnT = 0;
    if (m.mobs.length < F.CFG.mobMax) m.mobs.push({ viagem: VIAGEM, hp: F.hpMedio(S.modo) });
  }
  const dano = toques * DANO_TOQUE;
  let ganho = 0, mira = est.mundo ? DANO_MIRA * MIRA_POR_SEG * DT : 0;
  for (const mob of m.mobs) {
    if (mob.viagem > 0) { mob.viagem -= DT; continue; }
    mob.hp -= dano;
    if (mira > 0) { mob.hp -= mira; mira = 0; }        // the aim goes to the front one
    if (mob.hp <= 0) {
      mob.morto = true; m.drops.push({ t: 0, valor: F.valorDrop(S) });
      ganharFoco(S, m, F.CFG.focoMob);
    }
  }
  m.mobs = m.mobs.filter(x => !x.morto);
  S.mobsParados = m.mobs.filter(x => x.viagem <= 0).length;

  for (const d of m.drops) {
    d.t += DT;
    if (est.mundo) { ganho += d.valor; d.morto = true; ganharFoco(S, m, F.CFG.focoDrop); }
    else if (S.u4 && d.t >= F.CFG.dropAuto) { ganho += d.valor * F.CFG.dropAutoValor; d.morto = true; }
    else if (d.t >= F.CFG.dropVida) d.morto = true;
  }
  S.energia += ganho; S.energiaTotal += ganho;
  m.drops = m.drops.filter(d => !d.morto);

  if (S.mutirao > 0) S.mutirao = Math.max(0, S.mutirao - DT);
  if (m.chamada > 0) {
    m.chamada -= DT;
    if (est.mundo) {                                   // someone is watching: they show up
      m.chamada = 0; m.atendidas++;
      S.mutirao = F.CFG.mutiraoSeg;
      ganharFoco(S, m, F.CFG.focoChamada);
      for (const mob of m.mobs) m.drops.push({ t: 0, valor: F.valorDrop(S) });
      m.mobs = []; S.mobsParados = 0;
    } else if (m.chamada <= 0) m.perdidas++;
  } else {
    m.chamadaT += DT;
    if (m.chamadaT >= F.CFG.chamadaIntervalo) { m.chamadaT = 0; m.chamada = F.CFG.chamadaJanela; }
  }
  return ganho;
}

// one swing, with a candidate patch applied.
// `auto` marks a shot the wand fired by itself: it earns like any other swing but never
// touches tiredness, in either direction.
function tocar(S, patch, st, auto) {
  const g = F.ganhoClique(S);
  S.energia += g; S.energiaTotal += g;
  if (auto) return g;
  let d = 0;
  if (S.u2) d -= patch.cura(S, st);
  d += patch.cansa(S);
  S.poluicao = Math.max(0, S.poluicao + d);
  return g;
}

// Each strategy plays *well*: it only buys upgrades that do something for it, so the
// comparison measures the strategy and not a handicap. u1/u3 are mode-specific, u2/u7
// only matter when something is making the team tired, u5/u6 only pay off if you tap.
const ESTRATEGIAS = [
  { nome: 'hold only (no projects)', hold: 1, projetos: false, modo: () => 'carvao', compras: ['u4', 'u5', 'u6'] },
  { nome: 'projects, GO FAST', hold: 0, projetos: true, modo: () => 'carvao', compras: ['u1', 'u6', 'u7'] },
  { nome: 'projects, GO STEADY', hold: 0, projetos: true, modo: () => 'limpo', compras: ['u3', 'u6'] },
  { nome: 'projects FAST + hold', hold: 1, projetos: true, modo: () => 'carvao', compras: ['u1', 'u2', 'u4', 'u5', 'u6', 'u7'] },
  { nome: 'projects STEADY + hold', hold: 1, projetos: true, modo: () => 'limpo', compras: ['u3', 'u4', 'u5', 'u6'] },
  { nome: 'projects FAST + hold 25%', hold: 0.25, projetos: true, modo: () => 'carvao', compras: ['u1', 'u2', 'u4', 'u5', 'u6', 'u7'] },
  // control: same run, but never buys U2 — isolates tap income from U2's healing
  { nome: 'projects FAST + hold, no U2', hold: 1, projetos: true, modo: () => 'carvao', compras: ['u1', 'u4', 'u5', 'u6', 'u7'] },
  {
    // the intended game: push until the team is worn out, then organise until they recover
    nome: 'rhythm (fast/steady swap)', hold: 0, projetos: true, compras: ['u1', 'u3', 'u6', 'u7'],
    modo: S => (S.modo === 'carvao' ? (F.eficiencia(S) < 0.75 ? 'limpo' : 'carvao')
      : (F.eficiencia(S) > 0.95 ? 'carvao' : 'limpo'))
  },
  {
    nome: 'rhythm + hold', hold: 1, projetos: true, compras: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
    modo: S => (S.modo === 'carvao' ? (F.eficiencia(S) < 0.75 ? 'limpo' : 'carvao')
      : (F.eficiencia(S) > 0.95 ? 'carvao' : 'limpo'))
  },
  // ---- runs that actually look at the screen (added 2026-08-02) ----
  // `mundo` means the player taps the world too: aims at what is in the way, picks up
  // what it drops, and shows up when the kitchen calls.
  {
    nome: 'rhythm + hold + world', hold: 1, mundo: true, projetos: true,
    compras: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
    modo: S => (S.modo === 'carvao' ? (F.eficiencia(S) < 0.75 ? 'limpo' : 'carvao')
      : (F.eficiencia(S) > 0.95 ? 'carvao' : 'limpo'))
  },
  { nome: 'projects STEADY + hold + world', hold: 1, mundo: true, projetos: true, modo: () => 'limpo', compras: ['u3', 'u4', 'u5', 'u6'] },
  { nome: 'projects FAST + hold + world', hold: 1, mundo: true, projetos: true, modo: () => 'carvao', compras: ['u1', 'u2', 'u4', 'u5', 'u6', 'u7'] },
  // idle answer to the new pressure: U4 keeps the road clear without you
  { nome: 'projects, GO STEADY + U4', hold: 0, projetos: true, modo: () => 'limpo', compras: ['u3', 'u4', 'u6'] },
  // ---- the skill (added 2026-08-02) ----
  // It cannot be bought before the first torch, so in a single-cycle table these rows are
  // identical to their skill-less twins by construction. Run with --ciclos=2 to see it.
  {
    nome: 'rhythm + hold + world + SKILL', hold: 1, mundo: true, skill: true, projetos: true,
    compras: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
    modo: S => (S.modo === 'carvao' ? (F.eficiencia(S) < 0.75 ? 'limpo' : 'carvao')
      : (F.eficiencia(S) > 0.95 ? 'carvao' : 'limpo'))
  },
  { nome: 'projects STEADY + hold + world + SKILL', hold: 1, mundo: true, skill: true, projetos: true, modo: () => 'limpo', compras: ['u3', 'u4', 'u5', 'u6'] },
  // The pair that actually matters: nobody holds a phone button for seven minutes. These
  // two are the same player at a realistic duty cycle, with and without the wand — the
  // skill exists for the hands you do not have.
  { nome: 'STEADY + hold 25% + world', hold: 0.25, mundo: true, projetos: true, modo: () => 'limpo', compras: ['u3', 'u4', 'u5', 'u6'] },
  { nome: 'STEADY + hold 25% + world + SKILL', hold: 0.25, mundo: true, skill: true, projetos: true, modo: () => 'limpo', compras: ['u3', 'u4', 'u5', 'u6'] }
];

function jogar(est, patch = PATCHES.none, S0) {
  const S = S0 || F.novoEstado();
  const compraveis = F.UPGRADES.filter(u => est.compras.includes(u.id));
  const st = { curaBudget: patch.limite || 0 };
  const m = novoMundo();
  const comMundo = patch.mundo !== false;
  // the super belongs to the world layer (it pays in the road and in a mutirão-shaped
  // window), so --patch=semMundo turns it off with everything else
  const comSuper = comMundo && patch.super !== false;
  let t = 0, tapAcc = 0, autoAcc = 0, miraAcc = 0, wandAcc = 0;
  let deToque = 0, deProjeto = 0, deMundo = 0, deWand = 0, tempoSegurando = 0, piorSaude = 1;
  const alvo = S.energiaTotal + META;   // a cycle is always another 50K from where it starts

  while (S.energiaTotal < alvo && t < LIMITE) {
    // The ramp reset is not really in definirModo() — simular() zeroes tempoLimpo on every
    // tick spent in GO FAST, so the climb evaporates the instant you leave GO STEADY.
    // A patch that softens it has to keep the clock alive across the whole fast stretch.
    const guardaRampa = patch.rampaMantida !== undefined;
    const novoModo = est.modo(S);
    if (novoModo !== S.modo) {
      if (novoModo === 'carvao') S.tempoLimpo *= guardaRampa ? patch.rampaMantida : 0;
      S.modo = novoModo;
    }

    const tlAntes = S.tempoLimpo;
    deProjeto += F.simular(S, DT);
    if (guardaRampa && S.modo !== 'limpo') S.tempoLimpo = tlAntes;
    if (patch.limite) st.curaBudget = Math.min(patch.limite, st.curaBudget + patch.limite * DT);

    // holding the main button repeats at HOLD_TPS; duty cycle < 1 means the player
    // only holds part of the time (nobody holds a phone button for three hours)
    // the super's cooldown and window run on the clock, like the mutirão does
    if (m.sCd > 0) m.sCd = Math.max(0, m.sCd - DT);
    if (S.superT > 0) S.superT = Math.max(0, S.superT - DT);

    let toques = 0;
    // `mao` marks a swing made by the player's own hand: only those charge the super.
    const mao = () => { if (comSuper) swingDoJogador(S, m); };
    if (est.hold > 0) {
      tapAcc += DT * F.HOLD_TPS * est.hold;
      tempoSegurando += DT * est.hold;
      while (tapAcc >= 1) { deToque += tocar(S, patch, st); tapAcc--; toques++; mao(); }
    } else if (est.projetos && S.geradores === 0) {
      tapAcc += DT * TOQUE_HUMANO;       // bootstrap: poke until project #1 is affordable
      while (tapAcc >= 1) { deToque += tocar(S, patch, st); tapAcc--; toques++; mao(); }
    }
    if (S.u4) {                          // neighbours keep tapping on their own — and, like
      autoAcc += DT * F.CFG.autoTapsPorSeg;   // the wand, they never charge your super
      while (autoAcc >= 1) { deToque += tocar(S, patch, st); autoAcc--; toques++; }
    }
    // a tap on the world is also a swing on the CTA, so aiming pays its own way
    if (comMundo && est.mundo) {
      miraAcc += DT * MIRA_POR_SEG;
      while (miraAcc >= 1) { deToque += tocar(S, patch, st); miraAcc--; toques++; mao(); }
    }
    if (comMundo) deMundo += passoMundo(S, est, m, DT, toques);
    else { S.mobsParados = 0; S.mutirao = 0; }

    // AUTO-FIRE: while the wand is channelling it shoots on its own, through the same
    // swing the player makes — but those shots never heal (see tocar's `auto`).
    if (comMundo && m.canalizando > 0) {
      m.canalizando = Math.max(0, m.canalizando - DT);
      m.foco = Math.max(0, m.foco - F.CFG.autoFogoDreno * DT);
      wandAcc += DT * F.CFG.autoFogoTiros;
      while (wandAcc >= 1) { deWand += tocar(S, patch, st, true); wandAcc--; m.tiros++; }
      if (m.canalizando <= 0) m.foco = 0;
    }
    piorSaude = Math.min(piorSaude, F.eficiencia(S));

    // Spend: next upgrade first, then the skill if this run wants it, otherwise projects.
    // Note what the greedy buyer implies about prices in this economy: buying every project
    // it can afford every tick keeps the balance just under the *next project's* cost, so a
    // lump-sum item is only ever affordable once `15·1.15^n` has grown past it. That is why
    // u5/u6/u7 are never bought in a 50K run, and it is what sets a reachable skill price.
    const prox = compraveis.find(u => !S[u.id]);
    const querSkill = est.skill && !S.skillAuto && S.transicoes > 0;
    if (prox && S.energia >= prox.custo) F.comprar(S, prox.id, prox.custo);
    else if (querSkill && S.energia >= F.CFG.custoSkillAuto) {
      S.energia -= F.CFG.custoSkillAuto; S.skillAuto = true;
    } else if (est.projetos) {
      while (F.comprarGerador(S)) { /* buy as many as we can afford */ }
    }

    t += DT;
  }
  return {
    nome: est.nome, t, chegou: S.energiaTotal >= alvo,
    geradores: S.geradores, poluicao: S.poluicao, eficiencia: F.eficiencia(S), piorSaude,
    deToque, deProjeto, deMundo, deWand, tempoSegurando, mutiroes: m.atendidas, supers: m.supers,
    canais: m.canais, tiros: m.tiros, skill: S.skillAuto, sabedoria: S.inovacao,
    upgrades: F.UPGRADES.filter(u => S[u.id]).map(u => u.id).join(' ')
  };
}

// A skill survives the torch, so its worth can only be seen across cycles: run to 50K,
// pass it on, run again from the wisdom (and the wand) you kept.
function jogarCiclos(est, patch, n) {
  const S = F.novoEstado();
  const saidas = [];
  for (let c = 0; c < n; c++) {
    saidas.push(jogar(est, patch, S));
    if (c < n - 1) F.transicionar(S);
  }
  return saidas;
}

const hms = s => {
  if (!isFinite(s)) return '   —    ';
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60);
  return `${h}h${String(m).padStart(2, '0')}m${String(x).padStart(2, '0')}s`;
};

// with no patch the lab tap must match the shipped one exactly
(function conferir() {
  for (const modo of ['carvao', 'limpo']) {
    for (const u2 of [false, true]) {
      const a = F.novoEstado({ u2, modo, poluicao: 10 }), b = F.novoEstado({ u2, modo, poluicao: 10 });
      F.clicar(a); tocar(b, PATCHES.none, {});
      if (a.poluicao !== b.poluicao || a.energiaTotal !== b.energiaTotal) {
        throw new Error(`sim tap drifted from clicar() (modo=${modo} u2=${u2})`);
      }
    }
  }
})();

const detalhe = process.argv.includes('--detail');
const arg = (process.argv.find(a => a.startsWith('--patch=')) || '').split('=')[1] || 'none';
const patch = PATCHES[arg];
if (!patch) { console.error(`unknown patch "${arg}" — try: ${Object.keys(PATCHES).join(', ')}`); process.exit(2); }

// --ciclos=N: a skill is kept through the torch, so its worth only shows across runs
const ciclos = Number((process.argv.find(a => a.startsWith('--ciclos=')) || '').split('=')[1] || 0);
if (ciclos > 1) {
  console.log(`\n${ciclos} torches back to back — ${META.toLocaleString('en-US')} each`
    + (arg === 'none' ? ' — as shipped\n' : ` — PATCH: ${arg}\n`));
  const rows = ESTRATEGIAS.map(e => ({ nome: e.nome, quer: !!e.skill, ciclos: jogarCiclos(e, patch, ciclos) }))
    .sort((a, b) => a.ciclos.reduce((s, r) => s + r.t, 0) - b.ciclos.reduce((s, r) => s + r.t, 0));
  const larg = Math.max(...rows.map(r => r.nome.length));
  console.log('  ' + 'strategy'.padEnd(larg) + '   ' + rows[0].ciclos.map((_, i) => `run ${i + 1}`.padStart(9)).join('  ')
    + '     total   skill  wisdom');
  console.log('  ' + '-'.repeat(larg + 20 + ciclos * 11));
  for (const r of rows) {
    const total = r.ciclos.reduce((s, x) => s + x.t, 0);
    const ultimo = r.ciclos[r.ciclos.length - 1];
    console.log('  ' + r.nome.padEnd(larg) + '   ' + r.ciclos.map(x => hms(x.t).padStart(9)).join('  ')
      + '  ' + hms(total) + '  ' + (ultimo.skill ? ' yes' : '  no').padStart(6)
      + '  ' + String(ultimo.sabedoria).padStart(6));
    if (detalhe) {
      console.log('    '.padEnd(larg) + `     wand ${r.ciclos.map(x => Math.round(x.deWand).toLocaleString('en-US')).join(' / ')}`
        + ` · channels ${r.ciclos.map(x => x.canais).join(' / ')}`
        + ` · shots ${r.ciclos.map(x => x.tiros).join(' / ')}`);
    }
  }
  console.log('');
  process.exit(0);
}

console.log(`\nTime to ${META.toLocaleString('en-US')} total impact — hold repeats at ${F.HOLD_TPS.toFixed(2)} taps/s`
  + (arg === 'none' ? ' — as shipped\n' : ` — PATCH: ${arg}\n`));
const linhas = ESTRATEGIAS.map(e => jogar(e, patch)).sort((a, b) => (a.chegou ? a.t : Infinity) - (b.chegou ? b.t : Infinity));
const largura = Math.max(...linhas.map(r => r.nome.length));
console.log('  ' + 'strategy'.padEnd(largura) + '   time      projects  worst team  tap share  world share');
console.log('  ' + '-'.repeat(largura + 54));
for (const r of linhas) {
  const total = r.deToque + r.deProjeto + r.deMundo + r.deWand;
  const share = total > 0 ? (r.deToque + r.deWand) / total * 100 : 0;
  const shareM = total > 0 ? r.deMundo / total * 100 : 0;
  console.log('  ' + r.nome.padEnd(largura) + '   ' + (r.chegou ? hms(r.t) : '>24h    ')
    + '  ' + String(r.geradores).padStart(6)
    + '  ' + (r.piorSaude * 100).toFixed(0).padStart(8) + '%'
    + '  ' + share.toFixed(0).padStart(7) + '%'
    + '  ' + shareM.toFixed(0).padStart(9) + '%');
  if (detalhe) {
    console.log('    '.padEnd(largura) + `     taps ${Math.round(r.deToque).toLocaleString('en-US')}`
      + ` · projects ${Math.round(r.deProjeto).toLocaleString('en-US')}`
      + ` · world ${Math.round(r.deMundo).toLocaleString('en-US')}`
      + ` · wand ${Math.round(r.deWand).toLocaleString('en-US')} (${r.canais} channels)`
      + ` · mutirões ${r.mutiroes} · supers ${r.supers}`
      + ` · held ${hms(r.tempoSegurando)} · bought ${r.upgrades || '(none)'}`);
  }
}

const melhor = linhas[0], semHold = linhas.filter(r => r.tempoSegurando === 0 && r.chegou)[0];
console.log('');
if (melhor.tempoSegurando === 0) {
  console.log(`  Fastest run does not hold at all (${melhor.nome}). The rhythm still decides the game.`);
} else if (!semHold) {
  console.log(`  Fastest run holds: ${melhor.nome}. No hands-off run finished at all.`);
} else {
  console.log(`  Fastest run holds: ${melhor.nome} — ${(semHold.t / melhor.t).toFixed(1)}× faster than`
    + ` the best hands-off run (${semHold.nome}).`);
  console.log(melhor.piorSaude > 0.95
    ? `  Its team never drops below ${(melhor.piorSaude * 100).toFixed(0)}% — holding erases tiredness,`
      + ` so the fast/steady decision costs that run nothing.`
    : `  Its team still bottoms out at ${(melhor.piorSaude * 100).toFixed(0)}% — holding helps,`
      + ` but tiredness is still a real cost.`);
}
console.log('');
module.exports = { jogar, ESTRATEGIAS };
