// The board, beside the game, as two numbers instead of two impressions.
// Run: node test/board.js
//
// The band table in `medir.js` answers "how much event is in this strip". It cannot answer
// "this frame is oppressive", because a frame that is closed and a frame that is dark score
// the same way — mass is mass. The one comparison that CAN answer it is the whole-frame
// average against the thing we are copying: the board's RUA DO BAIRRO panel is bright and
// airy, the street recedes into light, and the foliage frames it without pressing on it.
// So: mean luma and mean C* over the WHOLE picture, board panel against game frame, plus
// the vertical luma profile, because "the middle opens into light" is a shape, not a mean.
//
// No new dependency: the board PNG is decoded by the same headless chromium that runs every
// other harness here, drawn to a canvas, and read back with getImageData.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function chromiumPath() {
  for (const p of [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium']) if (p && fs.existsSync(p)) return p;
  return undefined;
}
const BOARD = process.env.BOARD || path.resolve(
  'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-OneDrive-Documentos-game/9e48b8f1-799a-446d-ab30-84fa6af2e465/scratchpad/design/board.png');
// the CENÁRIOS strip, in board pixels — the panel is cropped and saved so the crop itself
// can be looked at rather than trusted. The strip's panels are not equal widths: the gaps
// between them measure at x 16, 248, 466, 682, 876, 1064, 1285 and 1518.
const PAINEIS = {
  rua: { nome: 'RUA DO BAIRRO', x: 18, y: 724, w: 228, h: 106 },
  praca: { nome: 'PRACA COMUNITARIA', x: 252, y: 724, w: 212, h: 106 }
};
const PAINEL = PAINEIS[process.env.CEN || 'rua'] || PAINEIS.rua;
const CROP = { x: PAINEL.x, y: PAINEL.y, w: PAINEL.w, h: PAINEL.h };

const ANALISE = function (d, w, h) {
  const lin = function (u) { u /= 255; return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4); };
  const f = function (t) { return t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116); };
  let sL = 0, sC = 0, n = 0;
  const linhaL = new Float64Array(h), linhaN = new Float64Array(h);
  const linhaC = new Float64Array(h), linhaR = new Float64Array(h), linhaG = new Float64Array(h), linhaB = new Float64Array(h);
  // HOW MUCH OF EACH FIFTH OF THE BOARD IS BARE SKY. `quinto.js` answers this for the game
  // by comparing every pixel against `skyCanvas`, which is exact and which the board does not
  // have. Without the same number on the BOARD side, the profile comparison is a floor
  // against a raw mean: our fifth 3 reads 111 against 83 and it looks like 28 points of
  // paint, when the board's fifth 3 is 1.6% sky and ours is 49.8% and almost none of it is
  // paint at all. The heuristic is blue clearly over red and light, plus near-white for
  // cloud — good for a daylight panel, meaningless at TARDE (an orange sky is not blue) and
  // at NOITE (nothing clears the threshold), so it is printed only where it means something.
  const linhaCn = new Float64Array(h), linhaCs = new Float64Array(h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if ((b >= r + 12 && b >= g && L > 110) || (r > 200 && g > 205 && b > 205 && b >= r - 6)) {
      linhaCn[y]++; linhaCs[y] += L;
    }
    const rl = lin(r), gl = lin(g), bl = lin(b);
    const X = (0.4124 * rl + 0.3576 * gl + 0.1805 * bl) / 0.95047;
    const Y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    const Z = (0.0193 * rl + 0.1192 * gl + 0.9505 * bl) / 1.08883;
    const fx = f(X), fy = f(Y), fz = f(Z);
    const A = 500 * (fx - fy), B2 = 200 * (fy - fz);
    sL += L; sC += Math.sqrt(A * A + B2 * B2); n++;
    linhaL[y] += L; linhaN[y]++;
    linhaC[y] += Math.sqrt(A * A + B2 * B2); linhaR[y] += r; linhaG[y] += g; linhaB[y] += b;
  }
  // the vertical profile in five slices: top of frame down to the ground line
  const perfil = [], perfilC = [], perfilRGB = [], perfilCeu = [], perfilPiso = [], perfilPint = [];
  for (let k = 0; k < 5; k++) {
    let s = 0, m = 0, c2 = 0, r2 = 0, g2 = 0, b3 = 0, cn = 0, cs = 0;
    for (let y = Math.floor(h * k / 5); y < Math.floor(h * (k + 1) / 5); y++) {
      s += linhaL[y]; m += linhaN[y]; c2 += linhaC[y]; r2 += linhaR[y]; g2 += linhaG[y]; b3 += linhaB[y];
      cn += linhaCn[y]; cs += linhaCs[y];
    }
    perfil.push(m ? s / m : 0);
    perfilC.push(m ? c2 / m : 0);
    perfilRGB.push(m ? [r2 / m, g2 / m, b3 / m] : [0, 0, 0]);
    // the floor a strip cannot go below (sky share x sky luma) and, once it is taken off,
    // the mean value of everything that was actually PAINTED there — the only half of the
    // profile a brush can move
    const fr = m ? cn / m : 0, piso = m ? cs / m : 0;
    perfilCeu.push(fr); perfilPiso.push(piso);
    perfilPint.push(fr < 0.999 && m ? ((s / m) - piso) / (1 - fr) : 0);
  }
  // and the horizontal one, because "the middle opens" is a horizontal shape
  const colunas = [];
  for (let k = 0; k < 5; k++) {
    let s = 0, m = 0;
    for (let y = 0; y < h; y++) for (let x = Math.floor(w * k / 5); x < Math.floor(w * (k + 1) / 5); x++) {
      const i = (y * w + x) * 4;
      s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; m++;
    }
    colunas.push(m ? s / m : 0);
  }
  return { luma: sL / n, cstar: sC / n, perfil: perfil, colunas: colunas, perfilC: perfilC,
    perfilRGB: perfilRGB, perfilCeu: perfilCeu, perfilPiso: perfilPiso, perfilPint: perfilPint };
};

function linha(nome, a, ceu) {
  console.log(nome.padEnd(22) + 'luma ' + a.luma.toFixed(1).padStart(6) + '  C* ' + a.cstar.toFixed(1).padStart(5) +
    '  | topo->chao ' + a.perfil.map(v => v.toFixed(0).padStart(3)).join(' ') +
    '  | esq->dir ' + a.colunas.map(v => v.toFixed(0).padStart(3)).join(' '));
  // buying value must not cost chroma: the same five slices in C*, and the mean RGB of the
  // two the board keeps in shade, because "darker" and "darker AND warmer" are not the same
  // instruction and only the second one is what the board did
  console.log(' '.repeat(22) + 'C* por quinto ' + a.perfilC.map(v => v.toFixed(1).padStart(5)).join(' ') +
    '  | RGB q4 ' + a.perfilRGB[3].map(v => v.toFixed(0)).join(',') +
    '  q5 ' + a.perfilRGB[4].map(v => v.toFixed(0)).join(','));
  if (ceu) {
    console.log(' '.repeat(22) + 'ceu por quinto ' + a.perfilCeu.map(v => (v * 100).toFixed(1).padStart(5)).join(' ') +
      '  | piso ' + a.perfilPiso.map(v => v.toFixed(0).padStart(3)).join(' ') +
      '  | PINTADO ' + a.perfilPint.map(v => v.toFixed(0).padStart(3)).join(' '));
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  // CEN=<id> stands the whole harness in another scenario; unset means RUA DO BAIRRO.
  await page.addInitScript(function (c) { window.__CEN = c; }, process.env.CEN || '');

  // ---- the board panel ----
  const b64 = fs.readFileSync(BOARD).toString('base64');
  await page.goto('about:blank');
  const alvo = await page.evaluate(async ({ b64, CROP }) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const c = document.createElement('canvas');
    c.width = CROP.w; c.height = CROP.h;
    const g = c.getContext('2d');
    g.drawImage(img, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, CROP.w, CROP.h);
    return { d: Array.from(g.getImageData(0, 0, CROP.w, CROP.h).data), w: CROP.w, h: CROP.h,
      full: [img.width, img.height], png: c.toDataURL('image/png') };
  }, { b64, CROP });
  fs.writeFileSync(path.resolve(__dirname, '..', 'board-' + (process.env.CEN || 'rua') + '.png'),
    Buffer.from(alvo.png.split(',')[1], 'base64'));
  console.log('board ' + alvo.full[0] + 'x' + alvo.full[1] + ', recorte ' + PAINEL.nome + ' ' +
    CROP.w + 'x' + CROP.h + ' -> board-' + (process.env.CEN || 'rua') + '.png');
  linha('BOARD ' + PAINEL.nome, ANALISE(Uint8ClampedArray.from(alvo.d), alvo.w, alvo.h), true);

  // ---- the game, same treatment: only the picture, i.e. the world band down to the ground
  // plane, and only below the HUD bar, because the bar is chrome and not the picture ----
  const file = 'file://' + path.resolve(__dirname, '..', 'index.html');
  await page.goto(file);
  await page.waitForTimeout(700);
  await page.evaluate(() => { S.introSeen = true; document.getElementById('lore').classList.add('escondido'); if (window.setCenario && window.__CEN) setCenario(window.__CEN); });
  await page.evaluate(() => {
    window.FIXO_X = 4000; window.FIXO_T = 100;
    window.QUADRO = function () { drawScene(); desenharMundo(); desenhar(); };
    window.requestAnimationFrame = function () { return 0; };
  });
  await page.evaluate('window.ANALISE = ' + ANALISE.toString());
  const SAO = { geradores: 60, energia: 90000, energiaTotal: 90000, poluicao: 0, modo: 'limpo' };
  for (const [nome, frac] of [['MANHA', 0], ['TARDE', 0.25], ['NOITE', 0.75]]) {
    const r = await page.evaluate(({ st, frac }) => {
      Object.assign(S, st); mobs.length = 0; drops.length = 0; parts.length = 0;
      chamada = null; cartaoT = 0; S.capVisto = 9; relogio = frac * DIA_SEG;
      worldX = FIXO_X; animT = FIXO_T; QUADRO();
      const cv = document.querySelector('canvas'), g = cv.getContext('2d');
      const topo = Math.round(document.getElementById('barraTopo').getBoundingClientRect().bottom / (window.innerWidth / W));
      const y0 = topo, y1 = Math.min(cv.height, GROUND + 22);
      return ANALISE(g.getImageData(0, y0, cv.width, y1 - y0).data, cv.width, y1 - y0);
    }, { st: SAO, frac });
    linha('JOGO ' + nome, r, nome === 'MANHA');
  }
  await browser.close();
})();
