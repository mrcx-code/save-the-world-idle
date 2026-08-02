// What the frozen offline rate was worth, and what integrating pays instead.
// Run: node test/offline.js
const F = require('./formulas');

// the old behaviour: read the rate once, multiply by the whole night
function congelado(S, total) {
  const ganho = F.prodPorSegundo(S) * total;
  S.energia += ganho; S.energiaTotal += ganho;
  return ganho;
}

const CENARIOS = [
  { nome: 'slept right after GO FAST, team rested', modo: 'carvao', poluicao: 0, u1: true },
  { nome: 'slept in GO FAST, team already worn', modo: 'carvao', poluicao: 900, u1: true },
  { nome: 'slept in GO STEADY, team worn out', modo: 'limpo', poluicao: 900, u3: true },
  { nome: 'slept in GO STEADY, team rested', modo: 'limpo', poluicao: 0, u3: true }
];
const HORAS = [1, 12];

console.log('\n12h cap · 20 projects · what the night pays\n');
console.log('  ' + 'scenario'.padEnd(38) + ' hours        frozen      integrated   frozen paid');
console.log('  ' + '-'.repeat(88));
for (const c of CENARIOS) {
  for (const h of HORAS) {
    const base = { geradores: 20, modo: c.modo, poluicao: c.poluicao, u1: !!c.u1, u3: !!c.u3, tempoLimpo: 0 };
    const a = F.novoEstado(base), b = F.novoEstado(base);
    const t = h * 3600;
    const velho = congelado(a, t);
    const novo = F.simularOffline(b, t);
    const razao = novo > 0 ? velho / novo : Infinity;
    console.log('  ' + c.nome.padEnd(38) + String(h).padStart(3) + 'h  '
      + Math.round(velho).toLocaleString('en-US').padStart(12)
      + Math.round(novo).toLocaleString('en-US').padStart(14)
      + (razao.toFixed(2) + '×').padStart(13));
  }
}
console.log('\n  Over 1× the frozen rate overpaid; under 1× it shortchanged the player.\n');
