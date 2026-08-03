// HOW MUCH OF THE WORLD THE PLAYER CAN ACTUALLY SEE.
// Run: node test/mundo.js            ·  CEN=<id> stands it in another scenario
//
// This bench exists because its absence cost the project four waves of work. Waves 11 to 14
// chased ONE framing number — "open sky is 23.6% of the picture and the board gives it about
// a quarter" — and every cheap way to move that number is to put something in front of the
// sky. So the proscenium grew, wave after wave, each step measured and each step an
// improvement by the only measure on the bench, until the frame stopped framing the street
// and became a wall with a street-shaped hole in it. The owner said it in one line: *cadê o
// Brasil?* Everything is still drawn — the matriz, the arcade, the painted morro, the town,
// the ipê, the bunting, the washing line — and none of it can be seen.
//
// The lesson is not "open sky was the wrong number". It is that a single framing number with
// no opposing number is an instruction to close the frame. So this is the opposing number:
//
//   MUNDO%   the share of the picture that is neither proscenium nor bare sky — i.e. the
//            part of the frame that is the game. Proscenium is measured EXACTLY, by drawing
//            the frame twice, once with the scenario's `moldura` hook and once without, and
//            taking the pixels that differ; bare sky is measured against `skyCanvas` the way
//            `quinto.js` does it. Neither is a heuristic.
//   MOLDURA% the share the frame itself takes.
//   CEU%     the share still showing raw sky.
//   and then, per named landmark family, whether it is on the screen at all and how many
//            pixels of it there are — because "the matriz is drawn" and "you can see the
//            matriz" are different claims and only the second one is worth anything.
//
// Read it at several world positions, because the landmarks are one per stretch and a single
// frame says nothing about a world.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
const POS = process.env.POS ? JSON.parse(process.env.POS) : [1400, 2600, 3800, 5000, 6200];
const NIVEIS = {
  sick: { geradores: 2, energia: 300, energiaTotal: 400, poluicao: 200, modo: 'carvao' },
  mid: { geradores: 18, energia: 9000, energiaTotal: 16000, poluicao: 40, modo: 'limpo' },
  healed: { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' }
};
(async () => {
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.addInitScript(function (c) { window.__CEN = c; }, process.env.CEN || '');
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    S.introSeen = true; document.getElementById('lore').classList.add('escondido');
    if (window.setCenario && window.__CEN) setCenario(window.__CEN);
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; };
  });
  const linhas = [];
  for (const nivel of (process.env.NIVEIS ? JSON.parse(process.env.NIVEIS) : ['healed', 'mid'])) {
    for (const wx of POS) {
      linhas.push(await page.evaluate(({ st, wx, nivel }) => {
        const cv = document.querySelector('canvas'), g = cv.getContext('2d');
        const prep = function () {
          Object.assign(S, st); relogio = 0; worldX = wx; animT = 100;
          mobs.length = 0; drops.length = 0; parts.length = 0; sprouts.length = 0;
          chamada = null; cartaoT = 0; S.capVisto = 9; tick = 0;
          let _s = 12345;
          Math.random = function () { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; };
          // the weather eases on WALL TIME, so two renders a millisecond apart are two
          // different frames unless it is pinned — without this the first cell of every run
          // came out 83% proscenium, which is the bench measuring its own warm-up
          ritmoV = st.modo === 'carvao' ? 1 : 0; ritmoVirou = 0; ritmoUlt = st.modo;
        };
        const topo = Math.round(document.getElementById('barraTopo').getBoundingClientRect().bottom / (window.innerWidth / W));
        const y1 = Math.min(cv.height, GROUND + 22), alt = y1 - topo;
        prep(); QUADRO();                 // warm every cache before anything is compared
        // (1) the frame as it ships
        prep(); QUADRO();
        const A = g.getImageData(0, topo, W, alt).data;
        // (2) the same frame with the scenario's framing mass switched off — the difference
        // IS the proscenium, exactly, with no assumption about how wide it is or where
        const C = CEN(), guarda = C.moldura;
        C.moldura = function () {};
        prep(); QUADRO();
        const B = g.getImageData(0, topo, W, alt).data;
        C.moldura = guarda;
        // (3) the sky it was all drawn over
        prep();
        const sc = skyCanvas(worldHealth());
        const sd = sc.getContext('2d').getImageData(0, 0, sc.width, sc.height).data;
        // (4) name every colour the palette can put on the screen, so a landmark can be
        // counted by the entries that draw it (the `quinto.js` attribution, per family)
        const P = pal(worldHealth());
        const fam = {
          marco: ['marcoC', 'marcoL', 'marcoE', 'marcoR', 'marcoRL'],
          morro: ['parede', 'paredeL', 'telha', 'telhaL', 'morro'],
          cidade: ['cidade'],
          rua: ['ruaPar', 'ruaParB', 'ruaSom', 'ruaTel', 'ruaTelL', 'ruaVao'],
          serra: ['serraFar', 'serraFarL', 'serraNear', 'serraNearL']
        };
        const dono = {};
        Object.keys(fam).forEach(function (f) {
          fam[f].forEach(function (k) {
            const v = P[k];
            if (typeof v === 'string') dono[v] = dono[v] || f;
            else if (Array.isArray(v)) v.forEach(function (u) { if (typeof u === 'string') dono[u] = dono[u] || f; });
          });
        });
        let nMold = 0, nCeu = 0, n = 0;
        const cont = { marco: 0, morro: 0, cidade: 0, rua: 0, serra: 0 };
        for (let y = 0; y < alt; y++) for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          n++;
          const difMold = A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2];
          if (difMold) { nMold++; continue; }
          const j = ((y + topo) * sc.width + x) * 4;
          if (y + topo < sc.height && A[i] === sd[j] && A[i + 1] === sd[j + 1] && A[i + 2] === sd[j + 2]) { nCeu++; continue; }
          const key = 'rgb(' + A[i] + ',' + A[i + 1] + ',' + A[i + 2] + ')';
          const f = dono[key];
          if (f) cont[f]++;
        }
        return { nivel: nivel, wx: wx,
          mundo: ((n - nMold - nCeu) / n * 100),
          moldura: (nMold / n * 100), ceu: (nCeu / n * 100),
          marco: cont.marco / n * 100, morro: cont.morro / n * 100, cidade: cont.cidade / n * 100,
          rua: cont.rua / n * 100, serra: cont.serra / n * 100 };
      }, { st: NIVEIS[nivel], wx, nivel }));
    }
  }
  console.log('nivel   worldX   MUNDO%  moldura%   ceu%  |  marco%  morro%  cidade%   rua%  serra%');
  let sm = 0, sf = 0, sc2 = 0, nm = 0, comMarco = 0, comMorro = 0;
  for (const r of linhas) {
    console.log(r.nivel.padEnd(8) + String(r.wx).padStart(6) + '   ' +
      r.mundo.toFixed(1).padStart(5) + '   ' + r.moldura.toFixed(1).padStart(6) + '  ' +
      r.ceu.toFixed(1).padStart(5) + '  |  ' + r.marco.toFixed(2).padStart(5) + '   ' +
      r.morro.toFixed(2).padStart(5) + '   ' + r.cidade.toFixed(2).padStart(5) + '  ' +
      r.rua.toFixed(2).padStart(5) + '   ' + r.serra.toFixed(2).padStart(5));
    sm += r.mundo; sf += r.moldura; sc2 += r.ceu; nm++;
    if (r.marco > 0.10) comMarco++;
    if (r.morro > 0.10) comMorro++;
  }
  console.log('-'.repeat(78));
  console.log('MEDIA            ' + (sm / nm).toFixed(1).padStart(5) + '   ' + (sf / nm).toFixed(1).padStart(6) +
    '  ' + (sc2 / nm).toFixed(1).padStart(5) +
    '   | quadros com marco visivel ' + comMarco + '/' + nm + ', com morro ' + comMorro + '/' + nm);
  await browser.close();
})();
