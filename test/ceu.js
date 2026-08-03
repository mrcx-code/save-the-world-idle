// What the board's sky actually IS, as numbers: how much cloud, at what value separation
// from the sky behind it, at what chroma, at what size, and where the bank sits against the
// roofline. Same treatment run on the game frame so the two are comparable.
// Run: node test/ceu.js
//
// `medir.js` counts BARE SKY — a pixel still carrying what `skyCanvas` put there — which
// answers "how much of the frame is unauthored" and nothing about what the authored part
// looks like. `board.js` averages the whole picture, which cannot see the sky at all once
// the ground is in the same average. This one splits sky from cloud inside the sky and
// reports the relationship: share, value separation, chroma of each, and size of the pieces.
//
// AND IT CROPS THE BOARD TO OUR ASPECT RATIO. Every wave from 11 on has chased "the board
// gives open sky about a quarter of the picture", which was read off a 2.15:1 landscape
// plate while we are composing a 0.85:1 portrait one. A tall canvas over a side-scrolling
// street necessarily shows more sky. The like-for-like crop is the honest target.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
const BOARD = process.env.BOARD || path.resolve(
  'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-OneDrive-Documentos-game/9e48b8f1-799a-446d-ab30-84fa6af2e465/scratchpad/design/board.png');

// A pixel is SKY-ish if it is blue-dominant or near-white and light. Cloud = the light,
// low-chroma part of that; sky = the rest. Reported per row so the bank's position shows.
const ANA = function (d, w, h, nome) {
  const out = { nome: nome, w: w, h: h };
  const L = new Float32Array(w * h), C = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    L[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    C[i] = mx - mn;
    // sky-ish: blue is the max channel and it is light
    out.sky = out.sky || new Uint8Array(w * h);
    out.sky[i] = (b >= g && b > r && L[i] > 90) || (L[i] > 175 && C[i] < 45) ? 1 : 0;
  }
  // cloud = sky-ish pixel that is markedly lighter than the median sky-ish luma
  const v = []; for (let i = 0; i < w * h; i++) if (out.sky[i]) v.push(L[i]);
  v.sort((a, b) => a - b);
  const med = v.length ? v[Math.floor(v.length / 2)] : 0;
  const lim = med + 22;
  let nc = 0, sc = 0, ns = 0, ss = 0, csC = 0, csS = 0;
  const lin = function (u) { u /= 255; return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
  const ff = function (t) { return t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116); };
  const cst = function (i) {
    const rl = lin(d[i * 4]), gl = lin(d[i * 4 + 1]), bl = lin(d[i * 4 + 2]);
    const X = (0.4124 * rl + 0.3576 * gl + 0.1805 * bl) / 0.95047;
    const Y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    const Z = (0.0193 * rl + 0.1192 * gl + 0.9505 * bl) / 1.08883;
    const fx = ff(X), fy = ff(Y), fz = ff(Z);
    const A = 500 * (fx - fy), B2 = 200 * (fy - fz);
    return Math.sqrt(A * A + B2 * B2);
  };
  const cloud = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!out.sky[i]) continue;
    if (L[i] > lim) { cloud[i] = 1; nc++; sc += L[i]; csC += cst(i); } else { ns++; ss += L[i]; csS += cst(i); }
  }
  // horizontal runs of cloud, per row, to get a size distribution
  const runs = [];
  for (let y = 0; y < h; y++) { let r0 = -1;
    for (let x = 0; x <= w; x++) {
      const on = x < w && cloud[y * w + x];
      if (on && r0 < 0) r0 = x;
      if (!on && r0 >= 0) { runs.push(x - r0); r0 = -1; }
    } }
  runs.sort((a, b) => a - b);
  const rows = [];
  for (let k = 0; k < 6; k++) {
    let a = 0, n = 0;
    for (let y = Math.floor(h * k / 6); y < Math.floor(h * (k + 1) / 6); y++)
      for (let x = 0; x < w; x++) { a += cloud[y * w + x]; n++; }
    rows.push((a / n * 100).toFixed(0));
  }
  // CONNECTED PIECES, which is what "a chain of small puffs" versus "four soft continents"
  // actually means. Row-runs cannot see it: adjacent puffs sitting on the same flat base
  // merge into one long row. 8-connected labelling over the top 60% of the frame, then the
  // count of pieces bigger than 6 px and the width of each.
  const H60 = Math.floor(h * 0.6);
  const lab = new Int32Array(w * h).fill(-1);
  const pecas = [];
  for (let y = 0; y < H60; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!cloud[i] || lab[i] >= 0) continue;
    const id = pecas.length; const pilha = [i]; lab[i] = id;
    let x0 = x, x1 = x, np = 0;
    while (pilha.length) {
      const j = pilha.pop(); const jy = Math.floor(j / w), jx = j % w; np++;
      if (jx < x0) x0 = jx; if (jx > x1) x1 = jx;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const ny = jy + dy, nx = jx + dx;
        if (ny < 0 || nx < 0 || ny >= H60 || nx >= w) continue;
        const nj = ny * w + nx;
        if (cloud[nj] && lab[nj] < 0) { lab[nj] = id; pilha.push(nj); }
      }
    }
    pecas.push({ larg: x1 - x0 + 1, n: np });
  }
  const bons = pecas.filter(p => p.n > 6).map(p => p.larg).sort((a, b) => a - b);
  const pecaN = bons.length;
  const pecaMed = bons.length ? bons[Math.floor(bons.length / 2)] : 0;
  const pecaP90 = bons.length ? bons[Math.floor(bons.length * 0.9)] : 0;
  // topmost / bottommost row that carries cloud, as a fraction of frame height
  let y0 = -1, y1 = -1;
  for (let y = 0; y < h; y++) { let a = 0; for (let x = 0; x < w; x++) a += cloud[y * w + x];
    if (a > w * 0.01) { if (y0 < 0) y0 = y; y1 = y; } }
  return { nome: nome,
    ceuPct: ((nc + ns) / (w * h) * 100).toFixed(1),
    nuvemDoCeu: (nc / Math.max(1, nc + ns) * 100).toFixed(1),
    nuvemDoQuadro: (nc / (w * h) * 100).toFixed(1),
    Lnuvem: (sc / Math.max(1, nc)).toFixed(0),
    Lceu: (ss / Math.max(1, ns)).toFixed(0),
    sep: (sc / Math.max(1, nc) - ss / Math.max(1, ns)).toFixed(0),
    CceU: (csS / Math.max(1, ns)).toFixed(1),
    Cnuv: (csC / Math.max(1, nc)).toFixed(1),
    runMed: runs.length ? runs[Math.floor(runs.length / 2)] : 0,
    runP90: runs.length ? runs[Math.floor(runs.length * 0.9)] : 0,
    runMax: runs.length ? runs[runs.length - 1] : 0,
    runLarg: (runs.length ? runs[Math.floor(runs.length * 0.9)] / w * 100 : 0).toFixed(1),
    faixas: rows.join(' '),
    pecaN: pecaN, pecaMed: pecaMed, pecaP90: pecaP90,
    pecaLarg: (pecaP90 / w * 100).toFixed(1),
    banda: y0 < 0 ? '-' : (y0 / h * 100).toFixed(0) + '%..' + (y1 / h * 100).toFixed(0) + '%' };
};

const PAINEIS = [
  ['BOARD RUA', 18, 724, 228, 106],
  ['BOARD PRACA', 252, 724, 228, 106],
  ['BOARD MANHA', 843, 886, 156, 90],
  ['BOARD TARDE', 1006, 886, 156, 90],
  ['BOARD POSCHUVA', 1168, 886, 156, 90],
  ['BOARD NOITE', 1330, 886, 156, 90],
  // the same panels cropped to OUR aspect ratio (160x189 visible = 0.85:1) instead of their
  // own landscape one, centred on the street: like for like, because a tall portrait canvas
  // over a side-scrolling street necessarily shows more sky than a 2.15:1 landscape plate
  ['RUA 0.85:1', 18 + Math.round((228 - 90) / 2), 724, 90, 106],
  ['PRACA 0.85:1', 252 + Math.round((228 - 90) / 2), 724, 90, 106],
  ['MANHA 0.85:1', 843 + Math.round((156 - 76) / 2), 886, 76, 90]
];

(async () => {
  const b = await chromium.launch({ executablePath: chromiumPath() });
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  // CEN=<id> stands the whole harness in another scenario; unset means RUA DO BAIRRO.
  await page.addInitScript(function (c) { window.__CEN = c; }, process.env.CEN || '');
  const b64 = fs.readFileSync(BOARD).toString('base64');
  await page.goto('about:blank');
  await page.evaluate('window.ANA = ' + ANA.toString());
  await page.evaluate(async b64 => {
    window.IMG = new Image();
    await new Promise(r => { window.IMG.onload = r; window.IMG.src = 'data:image/png;base64,' + b64; });
  }, b64);
  const linhas = [];
  for (const [n, x, y, w, h] of PAINEIS) {
    linhas.push(await page.evaluate(({ n, x, y, w, h }) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.drawImage(window.IMG, x, y, w, h, 0, 0, w, h);
      return ANA(g.getImageData(0, 0, w, h).data, w, h, n);
    }, { n, x, y, w, h }));
  }
  // ---- the game ----
  const IDX = 'file://' + path.resolve(__dirname, '..', 'index.html');
  await page.goto(IDX);
  await page.waitForTimeout(700);
  await page.evaluate(() => { S.introSeen = true; document.getElementById('lore').classList.add('escondido'); if (window.setCenario && window.__CEN) setCenario(window.__CEN);
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; }; });
  await page.evaluate('window.ANA = ' + ANA.toString());
  const SAO = { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' };
  for (const [nome, frac] of [['JOGO MANHA', 0], ['JOGO TARDE', 0.25], ['JOGO POSCHUVA', 0.5], ['JOGO NOITE', 0.75]]) {
    linhas.push(await page.evaluate(({ st, frac, nome }) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
      chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG;
      worldX = 4000; animT = 100; QUADRO();
      const cv = document.querySelector('canvas'), g = cv.getContext('2d');
      const topo = Math.round(document.getElementById('barraTopo').getBoundingClientRect().bottom / (window.innerWidth / W));
      const y1 = Math.min(cv.height, GROUND + 22);
      return ANA(g.getImageData(0, topo, cv.width, y1 - topo).data, cv.width, y1 - topo, nome);
    }, { st: SAO, frac, nome }));
  }
  console.log('nome'.padEnd(16) + 'ceu%  nuvem/ceu  nuvem/quadro  Lnuvem  Lceu  sep  runMed runP90 runMax  larg%  faixas(topo->chao)  banda');
  for (const r of linhas) console.log(r.nome.padEnd(16) + String(r.ceuPct).padStart(4) + '  ' +
    String(r.nuvemDoCeu).padStart(8) + '  ' + String(r.nuvemDoQuadro).padStart(11) + '  ' +
    String(r.Lnuvem).padStart(6) + '  ' + String(r.Lceu).padStart(4) + '  ' + String(r.sep).padStart(3) + ' C*ceu ' + String(r.CceU).padStart(4) + ' C*nuv ' + String(r.Cnuv).padStart(4) + ' pecas ' + String(r.pecaN).padStart(3) + ' med ' + String(r.pecaMed).padStart(3) + ' p90 ' + String(r.pecaP90).padStart(3) + '=' + String(r.pecaLarg).padStart(5) + '%  ' +
    String(r.runMed).padStart(6) + String(r.runP90).padStart(7) + String(r.runMax).padStart(7) + '  ' +
    String(r.runLarg).padStart(5) + '  ' + r.faixas.padStart(18) + '  ' + r.banda);
  await b.close();
})();
