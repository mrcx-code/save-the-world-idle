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
const PATCHES = {
  none: { cura: S => (S.modo === 'limpo' ? 2 : 0), cansa: () => 0 },
  u2Sempre: { cura: () => 2, cansa: () => 0 },
  tapCansa: { cura: () => 2, cansa: S => (S.modo === 'carvao' ? F.CFG.poluicaoPorGerador * (S.u1 ? 1.5 : 1) : 0) },
  curaCap: {
    limite: 3,
    cura(S, st) { const c = Math.min(2, st.curaBudget); st.curaBudget -= c; return c; },
    cansa: () => 0
  }
};

// one swing, with a candidate patch applied
function tocar(S, patch, st) {
  const g = F.ganhoClique(S);
  S.energia += g; S.energiaTotal += g;
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
  }
];

function jogar(est, patch = PATCHES.none) {
  const S = F.novoEstado();
  const compraveis = F.UPGRADES.filter(u => est.compras.includes(u.id));
  const st = { curaBudget: patch.limite || 0 };
  let t = 0, tapAcc = 0, autoAcc = 0;
  let deToque = 0, deProjeto = 0, tempoSegurando = 0, piorSaude = 1;

  while (S.energiaTotal < META && t < LIMITE) {
    const novoModo = est.modo(S);
    if (novoModo !== S.modo) { S.modo = novoModo; S.tempoLimpo = 0; }

    deProjeto += F.simular(S, DT);
    if (patch.limite) st.curaBudget = Math.min(patch.limite, st.curaBudget + patch.limite * DT);

    // holding the main button repeats at HOLD_TPS; duty cycle < 1 means the player
    // only holds part of the time (nobody holds a phone button for three hours)
    if (est.hold > 0) {
      tapAcc += DT * F.HOLD_TPS * est.hold;
      tempoSegurando += DT * est.hold;
      while (tapAcc >= 1) { deToque += tocar(S, patch, st); tapAcc--; }
    } else if (est.projetos && S.geradores === 0) {
      tapAcc += DT * TOQUE_HUMANO;       // bootstrap: poke until project #1 is affordable
      while (tapAcc >= 1) { deToque += tocar(S, patch, st); tapAcc--; }
    }
    if (S.u4) {                          // neighbours keep tapping on their own
      autoAcc += DT * F.CFG.autoTapsPorSeg;
      while (autoAcc >= 1) { deToque += tocar(S, patch, st); autoAcc--; }
    }
    piorSaude = Math.min(piorSaude, F.eficiencia(S));

    // spend: next upgrade first, otherwise another project
    const prox = compraveis.find(u => !S[u.id]);
    if (prox && S.energia >= prox.custo) F.comprar(S, prox.id, prox.custo);
    else if (est.projetos) while (F.comprarGerador(S)) { /* buy as many as we can afford */ }

    t += DT;
  }
  return {
    nome: est.nome, t, chegou: S.energiaTotal >= META,
    geradores: S.geradores, poluicao: S.poluicao, eficiencia: F.eficiencia(S), piorSaude,
    deToque, deProjeto, tempoSegurando,
    upgrades: F.UPGRADES.filter(u => S[u.id]).map(u => u.id).join(' ')
  };
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

console.log(`\nTime to ${META.toLocaleString('en-US')} total impact — hold repeats at ${F.HOLD_TPS.toFixed(2)} taps/s`
  + (arg === 'none' ? ' — as shipped\n' : ` — PATCH: ${arg}\n`));
const linhas = ESTRATEGIAS.map(e => jogar(e, patch)).sort((a, b) => (a.chegou ? a.t : Infinity) - (b.chegou ? b.t : Infinity));
const largura = Math.max(...linhas.map(r => r.nome.length));
console.log('  ' + 'strategy'.padEnd(largura) + '   time      projects  worst team  tap share');
console.log('  ' + '-'.repeat(largura + 42));
for (const r of linhas) {
  const total = r.deToque + r.deProjeto;
  const share = total > 0 ? r.deToque / total * 100 : 0;
  console.log('  ' + r.nome.padEnd(largura) + '   ' + (r.chegou ? hms(r.t) : '>24h    ')
    + '  ' + String(r.geradores).padStart(6)
    + '  ' + (r.piorSaude * 100).toFixed(0).padStart(8) + '%'
    + '  ' + share.toFixed(0).padStart(7) + '%');
  if (detalhe) {
    console.log('    '.padEnd(largura) + `     taps ${Math.round(r.deToque).toLocaleString('en-US')}`
      + ` · projects ${Math.round(r.deProjeto).toLocaleString('en-US')}`
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
