// The game's economy, in Node, with no browser and no canvas.
//
// CFG is not copied — it is read straight out of index.html, so the tuning numbers
// here can never drift from the ones that ship. The formulas below are hand-mirrored
// from the "formulas" section of index.html; test/smoke.js re-checks them against the
// real page on every run, so a change there fails the build instead of rotting quietly.
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

function lerCFG() {
  const m = SRC.match(/const CFG = (\{[\s\S]*?\});/);
  if (!m) throw new Error('could not find CFG in index.html');
  return eval('(' + m[1] + ')');
}
const CFG = lerCFG();

// how fast the main button repeats while held: setInterval(clicar, N)
function toquesPorSegundoSegurando() {
  const m = SRC.match(/setInterval\(clicar,\s*(\d+)\)/);
  if (!m) throw new Error('could not find the hold-to-attack interval in index.html');
  return 1000 / Number(m[1]);
}
const HOLD_TPS = toquesPorSegundoSegurando();

const novoEstado = (over = {}) => Object.assign({
  energia: 0, energiaTotal: 0, poluicao: 0,
  geradores: 0, modo: 'carvao', tempoLimpo: 0,
  u1: false, u2: false, u3: false, u4: false, u5: false, u6: false, u7: false,
  inovacao: 0, transicoes: 0
}, over);

const eficiencia = S => 100 / (100 + S.poluicao);
const bonusInovacao = S => 1 + 0.1 * S.inovacao;
const custoGerador = S => Math.ceil(CFG.custoGeradorBase * Math.pow(CFG.custoGeradorFator, S.geradores));
const bonusJusto = S => (S.u6 ? CFG.bonusJustoU6 : 1);
const forcaToque = S => (S.u5 ? CFG.forcaToqueU5 : 1);
const ganhoClique = S => 1 * forcaToque(S) * bonusInovacao(S) * eficiencia(S) * bonusJusto(S);

const tetoLimpoAtual = S => (S.u3 ? 4 : CFG.tetoLimpo);
function rampaAtual(S) {
  const dur = S.u3 ? CFG.rampaLimpoSeg / 2 : CFG.rampaLimpoSeg;
  return 1 + (tetoLimpoAtual(S) - 1) * Math.min(S.tempoLimpo / dur, 1);
}
function prodPorSegundo(S) {
  const porGerador = S.modo === 'carvao'
    ? CFG.prodCarvao * (S.u1 ? 2 : 1)
    : CFG.prodLimpoBase * rampaAtual(S);
  return S.geradores * porGerador * bonusInovacao(S) * eficiencia(S) * bonusJusto(S);
}
function poluicaoPorSegundo(S) {
  if (S.modo !== 'carvao') return 0;
  return S.geradores * CFG.poluicaoPorGerador * (S.u1 ? 1.5 : 1);
}
const inovacaoAoTransicionar = S => Math.floor(Math.sqrt(S.energiaTotal / CFG.divisorInovacao) * eficiencia(S));

// one tick of the world: production, then tiredness in closed form
function simular(S, dt) {
  S.tempoLimpo = (S.modo === 'limpo') ? S.tempoLimpo + dt : 0;
  const ganho = prodPorSegundo(S) * dt;
  S.energia += ganho; S.energiaTotal += ganho;
  const k = -Math.log(1 - CFG.decaimentoPoluicao * (S.u7 ? CFG.descansoU7 : 1));
  const eq = poluicaoPorSegundo(S) / k;
  S.poluicao = eq + (S.poluicao - eq) * Math.exp(-k * dt);
  if (S.poluicao < 0.01) S.poluicao = 0;
  return ganho;
}

// one swing (the economic half of clicar(); the rest is sprites)
function clicar(S) {
  const g = ganhoClique(S);
  S.energia += g; S.energiaTotal += g;
  if (S.u2) S.poluicao = Math.max(0, S.poluicao - 2);
  return g;
}

const comprarGerador = S => {
  const c = custoGerador(S);
  if (S.energia < c) return false;
  S.energia -= c; S.geradores++; return true;
};
const comprar = (S, u, custo) => {
  if (S[u] || S.energia < custo) return false;
  S.energia -= custo; S[u] = true; return true;
};

const UPGRADES = [
  { id: 'u1', custo: CFG.custoU1, nome: 'Big campaigns' },
  { id: 'u2', custo: CFG.custoU2, nome: 'Friends help friends' },
  { id: 'u3', custo: CFG.custoU3, nome: 'Team training' },
  { id: 'u4', custo: CFG.custoU4, nome: 'Neighbors join in' },
  { id: 'u5', custo: CFG.custoU5, nome: 'Better tools for all' },
  { id: 'u6', custo: CFG.custoU6, nome: 'Fair share' },
  { id: 'u7', custo: CFG.custoU7, nome: 'Rest days' }
];

module.exports = {
  CFG, HOLD_TPS, UPGRADES, novoEstado,
  eficiencia, bonusInovacao, custoGerador, bonusJusto, forcaToque, ganhoClique,
  tetoLimpoAtual, rampaAtual, prodPorSegundo, poluicaoPorSegundo,
  inovacaoAoTransicionar, simular, clicar, comprarGerador, comprar
};
