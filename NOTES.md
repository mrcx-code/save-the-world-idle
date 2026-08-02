# NOTES — Save the World (3-day prototype)

## Loop

Generator cost `15 × 1.15^n`. **GO FAST** 3/s per project (6 with Big campaigns);
**GO STEADY** 1/s ramping to 2/s over 120s (4/s and 2× ramp with Team training);
switching modes resets the ramp. Tiredness: `+0.15/s` per project in fast mode
(×1.5 with U1), heals ~0.5%/s — solved in closed form
(`p = eq + (p − eq)·e^(−kt)`, `eq = emission/k`, `k = −ln(1 − decay)`), so the same
equation covers offline time. Team health `= 100/(100+tiredness)` multiplies **all**
output, taps included. Torch at 50K total impact: `wisdom = ⌊√(total/2500) × health⌋`,
+10% forever per point. Offline integrates in 1s slices (12h cap, ~8ms) instead of
billing one frozen rate, so the team wearing out — or resting — while you sleep counts.

## Upgrades (7)

| # | name | cost | effect |
|---|---|---|---|
| U1 | Big campaigns | 100 | 2× fast output, 1.5× tiredness |
| U2 | Friends help friends | 400 | taps heal 2 tiredness — **GO STEADY only** |
| U3 | Team training | 1,200 | steady ramps 2× faster, cap 4/s |
| U4 | Neighbors join in | 3,000 | auto-taps 2/s, no input needed |
| U5 | Better tools for all | 8,000 | every tap counts 3× |
| U6 | Fair share | 18,000 | +30% to production *and* taps |
| U7 | Rest days | 30,000 | tiredness heals 3× faster |

All seven reset on prestige. Old saves without `u4..u7` load fine (missing keys read
as falsy).

## Balance: what holding the button actually did

`node test/sim.js` plays the whole economy headless — no browser, just the formulas in
`test/formulas.js`, which reads `CFG` straight out of `index.html` so the tuning numbers
cannot drift. `node test/sim.js --detail` shows where the impact came from;
`--patch=<name>` re-runs the table under a candidate change before it is shipped.

Time to 50K, measured **before** the fix:

| strategy | time | worst team health |
|---|---|---|
| projects FAST + hold | **4m40s** | 34% |
| projects, GO STEADY | 8m37s | 100% |
| hold only, no projects | 43m34s | 100% |
| projects FAST + hold, **no U2** | 54m17s | 5% |
| projects, GO FAST (hands off) | 56m58s | 5% |

The culprit was not tap income — taps were only **4%** of total impact. It was U2: at
6.9 taps/s, "heals 2 tiredness per tap" healed 13.8/s (17.8/s once U4 auto-taps), more
than the ~9.7/s that 43 projects emit in GO FAST. Tiredness was pinned at zero, so
GO FAST cost nothing and the fast/steady decision stopped existing. The control proves
it: the same run without buying U2 takes 54m17s, barely better than never holding at
all (56m58s).

Fix shipped: **U2 heals only in GO STEADY**. Two other candidates were measured and
rejected — making taps tire the team in fast mode (`--patch=tapCansa`) barely moved it
(5m21s, U2 still out-heals the emission), and capping the heal at 3/s
(`--patch=curaCap`) fixed the exploit but left the intended play losing to pure steady.

After the fix, the fastest run is the one that swaps modes:

| strategy | time | worst team health |
|---|---|---|
| rhythm (fast/steady swap) + hold | **7m28s** | 75% |
| projects STEADY + hold | 7m35s | 100% |
| projects, GO STEADY | 8m37s | 100% |
| rhythm, hands off | 9m59s | 75% |
| projects FAST + hold | 54m18s | 5% |

Holding is still worth doing (1.2× over the best hands-off run) but no longer replaces
the decision. `--patch=u2Sempre` restores the old behaviour so the regression stays
measurable.

## Retention counters

Long-press the torch icon (600ms) to open THREE-DAY TEST: distinct days played, total
time played, torches passed, and the span from the first session. Stored under
`proto_savetheworld_retencao`, separate from the game save, because passing the torch
wipes `S` and the measurement has to outlive that. Time only accrues from the rAF loop
with `dt` clamped, so a tab left open in the background counts as nothing. Nothing
leaves the device and nothing personal is recorded — just dates, a duration and a count.

A record that is corrupt, hand-edited or half-written is repaired on load rather than
thrown: non-string days are filtered out, negative or non-finite numbers reset to zero.
The smoke test covers the long-press, the suppressed tap and the corrupt-record case.

## Feel

Taps chain a 3-hit combo, all three cast rather than swung: a flat crescent of light
thrown ahead → a spiral climbing off the wand tip → the **leap slam** (hero jumps ~52
world px, gathers light overhead, drives a spear of it into the dirt, lands with a flash,
an expanding wave and green things pushing up through the cracks). Holding the main button
repeats at ~7 hits/s. Sprouts are capped at 40 so holding in steady mode doesn't flood the
scene. The bolt is spawned from the drawing code off the attack state that already exists,
so it is decoration only — what gets hit, how far and how hard is decided elsewhere.

## Art direction — C, CLEAR SKY

High-key poster pixel art: saturated, flat, hard outlines, **no post-processing of any
kind**. The measurement that set this: reference art in this genre has a *bigger* art pixel
than ours and a shorter hero, so fidelity never came from resolution. It comes from 3–5
tones per material, a dark 1px outline, one pixel grid, and a strict value architecture —
light sky → mid background → a **light separator band on the horizon line** → dark ground,
with the character straddling that boundary.

**Sick is bleached, not dark.** Smoke scatters light, so a polluted sky is warm, opaque and
too bright. The whole sick→healed arc runs on **saturation**, which is the fastest channel
to read: it still works on a phone at 30% brightness, outdoors, at a glance. The hero's
colours and the wand's magic do **not** desaturate with the world — in a sick frame the
wand is the only warm saturated thing left, and that is the point.

The magic is folk magic — tending and mending, the same hand that plants a sprout. White-
gold core, warm amber body, green growth halo; never arcane blue or purple. One helper,
`luz()`, lays every point of channelled light down as nested octagons built from crossed
rectangles, so a glow stays a pixel shape instead of a soft photographic blob.

Golden Hour (dusk) and The Lights Come On (night) are approved as **time-of-day variants
off the same engine, later** — palette swaps, no new geometry.

Presentation: fullscreen pixel side-scroller. The world renders at 1 world px = 2 screen px
and **everything sits on that one grid** — the hero and the monsters used to carry an extra
2× on top, so their pixels covered four screen pixels each while the scenery behind them
covered one. Sprites are hand-shaded off a single light direction (sun up and to the right)
and baked into offscreen canvases, so four times the pixel count still costs one
`drawImage` per character per frame. The middle distance is three green planes separated by
**value**, with the outline graded by distance: hard on the near band, soft on the middle,
absent on the far ridge. Everything lerps from bleached to saturated off `worldHealth()`.

**No webfont.** The chrome uses the system stack; the canvas has a 5×7 bitmap font authored
in the file, 47 glyphs each baked once with an 8-direction outline. The HUD is poster
chrome: solid cream `#fdf6e6`, 2px `#12242e` outline, hard 3px offset shadow, no
transparency. Menus are floating sheets above the character; type scales with `clamp()`.

## Open questions

1. ~~Offline gain uses efficiency at save time~~ — fixed, and it was wrong in *both*
   directions. See `node test/offline.js`.
2. ~~First torch may pass 40 min if played 100% steady~~ — **measured: 8m37s**, not 40.
   A greedy buyer reaches 44 projects and 50K in well under ten minutes of active play.
   That is the whole first loop, and it is the single biggest threat to the three-day
   question. The prestige target and the cost curve are off-limits without the owner,
   so this is flagged, not touched.
3. ~~Taps may outpace projects~~ — **measured: taps are 4–7% of total impact** in every
   run that also builds projects. Tap income was never the problem; U2's healing was.
4. Hold-to-attack at 7/s was picked by feel, not tuned against retention.
5. **GO FAST is dominated by GO STEADY once projects pile up.** At equilibrium a fast
   project settles at `100/(100 + 44.9n)` health, so at n=43 it produces 0.3/s against
   steady's 4/s. Fast only wins in short bursts before tiredness accumulates. The
   fast/steady choice is really "burst then recover", not "pick a lane" — worth deciding
   whether that is the intended shape.

## Diário

Uma entrada por sessão, mais recente no fim. Formato: data · o que fiz · o que **medi**
(número, não impressão) · o que quebrou · próximo passo. Este é o ponto de retomada:
toda sessão começa lendo a última entrada.

- **2026-08-02 · sessão de origem.** Protótipo construído do zero até produção.
  Adicionados 7 upgrades, segurar-pra-atacar (~7 golpes/s), combo de 3 golpes terminando
  em salto com baque e onda de choque, terceiro monstro (tambor tóxico), cozinhas
  comunitárias e 3 dados reais sobre desigualdade. Medido: 61 FPS em viewport 390×844,
  smoke test verde, `index.html` publicado idêntico ao testado. Quebrou no caminho: com
  7 cards o painel de upgrades cobria a barra de menu (corrigido subindo `bottom` para
  126px e reduzindo `max-height` para 52vh). Infra fechada: repo em
  `mrcx-code/save-the-world-idle`, Vercel ligada ao Git, push publica sozinho.
  **Próximo passo: tarefa (a) do CLAUDE.md — medir se o segurar-pra-atacar matou a
  tensão do jogo.**

- **2026-08-02 · tarefa (a), medida e corrigida.** Escrevi `test/sim.js` +
  `test/formulas.js`: simulação headless da economia, sem navegador, lendo o `CFG` do
  próprio `index.html` para os números não divergirem. Nove estratégias, cada uma
  comprando só os upgrades que lhe servem, para a comparação medir a estratégia e não
  uma desvantagem de fachada. Medido: segurar **matou** a tensão — `projects FAST + hold`
  fechava 50K em **4m40s** contra 8m37s do melhor jogo sem segurar. Mas a causa não era
  a que o CLAUDE.md supunha: o toque é só **4%** do impacto total. O culpado era o U2 —
  a 6,9 toques/s, "cura 2 de cansaço por toque" curava 13,8/s, mais que os ~9,7/s que
  43 projetos emitem em GO FAST, então o cansaço ficava preso em zero e o GO FAST saía
  de graça. Controle que fecha o caso: a mesma corrida **sem comprar o U2** leva 54m17s,
  quase igual a nunca segurar (56m58s). Corrigido com **uma** mudança: o U2 só cura em
  GO STEADY. Duas candidatas foram medidas e rejeitadas (`--patch=tapCansa` quase não
  moveu, 5m21s; `--patch=curaCap` corrigiu mas deixava o jogo pretendido perdendo para
  o steady puro). Depois da correção a corrida mais rápida é justamente a que alterna
  modos: **rhythm + hold 7m28s**, com o time caindo a 75% — segurar ainda vale 1,2×,
  mas não substitui mais a decisão. Quebrou no caminho: a primeira versão da simulação
  dava >24h para todas as estratégias sem toque — não é bug do jogo, é que **sem tocar
  não dá para comprar o primeiro projeto** (renda zero); as corridas sem segurar agora
  tocam à mão até o projeto #1. Dúvida nova, e é grande: **a primeira tocha chega em
  ~8min**, não em 40 como o NOTES supunha — o primeiro loop inteiro cabe em dez minutos,
  o que ameaça direto a pergunta dos três dias. Mexer no alvo (50 mil) ou na curva de
  custo é parada obrigatória, então fica registrado para o dono decidir.
  **Bloqueio: `git push` não funciona neste ambiente** (sem credential helper e sem
  `gh`), então os commits estão locais e a produção segue no commit anterior.
  **Próximo passo: tarefa (b) do CLAUDE.md — instrumentar retenção.**

- **2026-08-02 · tarefa (b), retenção instrumentada.** Toque longo (600ms) no ícone da
  tocha abre o painel THREE-DAY TEST: dias distintos, tempo total jogado, tochas
  passadas e o vão desde a primeira sessão. Chave própria no `localStorage`
  (`proto_savetheworld_retencao`), separada do save — passar a tocha zera o `S` e a
  medição precisa sobreviver a isso. O tempo só acumula pelo laço de rAF com `dt`
  limitado, então aba esquecida em segundo plano não conta. Medido em navegador de
  verdade (mobile 375×812, servido em `127.0.0.1:8123`): o toque longo abre o painel e
  **não** dispara a folha da tocha (a supressão do clique funciona), 24s de jogo viraram
  "0m 24s", e um registro semeado com 3 dias / 7325s / 3 tochas mostrou "3 days ·
  2h 02m · 3". Robustez: cinco registros corrompidos (JSON quebrado, tipos errados,
  dias com `null` e `"banana"`, string vazia) — nenhum derruba o jogo; o caso sujo
  reporta corretamente 2 dias distintos num vão de 3. Smoke test cresceu para cobrir
  toque longo, clique suprimido e registro corrompido; segue verde a 61 FPS.
  Quebrou no caminho: nada. Dúvida nova: o painel conta dias em fuso local, então
  atravessar a meia-noite jogando conta dois dias — é o comportamento que eu quero para
  a pergunta dos três dias, mas infla a métrica de quem joga de madrugada.
  **Próximo passo: tarefa (c) — tirar o `confirm()` do prestígio.**

- **2026-08-02 · tarefa (c), o `confirm()` saiu.** PASS THE TORCH? virou uma sheet como
  as outras, com um placar de duas colunas: o que fica (`+N WISDOM`, verde) ao lado do
  que é passado adiante (`N projects`, vermelho) — coisa que o diálogo do navegador
  nunca conseguiu mostrar. Se o time está cansado a nota vira "a rested team passes on
  more — yours is at 71%", que é a única dica no jogo de que a eficiência entra na
  fórmula da sabedoria. `NOT YET` volta para a folha da tocha sem gastar nada. Medido em
  navegador: painel abre com +3 WISDOM / 12 projects, `NOT YET` deixa o total em 62.000
  e a sabedoria em 0, `YES` banca 3 de sabedoria, zera os 12 projetos e conta 1 tocha.
  O smoke test agora registra um ouvinte de `dialog` e **falha se qualquer diálogo do
  navegador aparecer**, então o `confirm()` não volta sem que o teste perceba. Verde,
  61 FPS. Quebrou no caminho: nada.
  **Próximo passo: tarefa (d) — corrigir o ganho offline.**

- **2026-08-02 · tarefa (d), ganho offline integrado.** O offline cobrava uma taxa
  congelada: lia a eficiência na hora do save e multiplicava por até 12 horas. Agora
  `simularOffline()` integra em fatias de 1s reusando o mesmo `simular()`, então offline
  e online seguem um só caminho de código — a rampa do GO STEADY inclusive. Medido
  (`node test/offline.js`, 20 projetos, 12h): dormir logo depois de ir para GO FAST com
  o time descansado pagava **9,87× a mais** (5.184.000 contra 525.144 reais) — era a
  suspeita do CLAUDE.md e ela se confirmou. Mas o congelamento errava **nos dois
  sentidos**, e isso ninguém tinha visto: dormir em GO STEADY com o time acabado pagava
  **0,03×**, ou seja, roubava 33× do jogador, porque o time se recupera durante a noite
  e a taxa congelada usava a eficiência do pior momento; e dormir em GO STEADY
  descansado pagava 0,25×, porque a rampa sobe de 1/s para 4/s enquanto você dorme.
  Custo: 7,83ms no pior caso para as 12h inteiras, uma vez só, no load. Smoke test agora
  semeia um save de 12 horas atrás e confere o valor de verdade: 525.144 contra os
  5.184.000 da taxa congelada, com 898 de cansaço acumulado. Quebrou no caminho: a
  primeira versão do teste falhou em `waitForFunction` — não era o jogo, é que o
  `beforeunload` chama `salvar()` e escrevia o estado vivo por cima do save semeado
  antes do reload; o teste desarma o `salvar` antes de recarregar. Verde, 61 FPS.
  **Próximo passo: tarefa (e) — apagar o `PUSH.md`.**

- **2026-08-02 · tarefa (e), `PUSH.md` apagado.** Ensinava a criar o repo e ligar a
  Vercel, as duas coisas feitas desde a sessão de origem. Conferi antes de apagar que
  nada aponta para ele e que a única parte ainda útil — instalar o playwright numa
  máquina nova — já está no `README.md`. Aproveitei para pôr o README em dia: a tabela
  de estrutura estava listando três arquivos de um repo que agora tem sete, e a seção
  de teste não mencionava nem o `sim.js` nem o `offline.js`. Também anotei o
  `npx --yes serve .` ao lado do `python3 -m http.server`, porque nesta máquina não há
  python e o comando do README simplesmente não roda. Fila do CLAUDE.md de (a) a (e)
  fechada. **Próximo passo: fila (f) — trabalho novo, critério "faz alguém voltar
  amanhã?". A lente óbvia agora é *Volta no dia 2*: com a primeira tocha caindo em
  ~8min, o dia 2 precisa ter o que oferecer, e hoje não tem quase nada.**

- **2026-08-02 · passe visual "hi-bit", a pedido do dono.** O dono disse que ainda está
  feio e perguntou se "32 ou 64 bits" resolveria. Não resolve: 32/64 bits eram PS1/N64,
  o começo do 3D poligonal, que envelheceu pior que o 2D anterior. O que faz pixel art
  parecer cara é a direção SNES-pra-frente — gradiente com dithering em vez de banda,
  distância comendo o contraste, uma direção de luz só, e uma correção de cor no fim.
  Feito: céu e chão viraram gradientes com dithering ordenado 8×8 (~12 níveis), assados
  em canvas offscreen e refeitos só quando a saúde do mundo cruza um passo de 1/48;
  perspectiva aérea (`longe()`) dissolvendo montanhas, cidade, linha de árvores e
  arbustos no tom do horizonte; sombra de contato (`sombra()`) sob árvores, casas,
  pedras e o herói — a do herói aperta conforme ele sobe, que é o que vende o salto;
  brilho do sol assado no próprio gradiente do céu, com núcleo quente; e um passe final
  de `overlay` (frio doente / quente curado) mais vinheta com dithering. Medido: 61 FPS,
  igual a antes; refazer o céu custa 5,90ms, o chão 1,80ms, a vinheta 3,80ms — e só a
  vinheta depende do viewport, então roda uma vez por resize. Quebrou no caminho: a
  primeira versão ficou **pior** que o original — vinheta forte demais (0,42) e uma
  correção de cor chapada em `source-over` que virava um véu cinza por cima de tudo.
  Comparei os prints de antes e depois de verdade e refiz: vinheta em 0,24 começando
  mais longe do centro, correção em `overlay` (que aprofunda escuro e levanta claro em
  vez de lavar), sol com núcleo branco e menos névoa nas montanhas. Dúvida nova: o
  gradiente do chão melhorou muito a maior área chapada da tela, mas o miolo — linha de
  árvores e arbustos — ainda lê como mingau verde; separar aqueles dois planos por valor
  é o próximo ganho grande. **Próximo passo: continuar o visual pelo miolo (separar os
  planos verdes), ou voltar para a fila (f) e o dia 2 — o dono decide o que vale mais.**

- **2026-08-02 · o herói desceu para a grade do mundo, e o miolo ganhou três planos.**
  O dono disse pela segunda vez que ainda está feio e pediu "64 bit, ou até HD, mas com
  essa estética". A causa raiz não era falta de cor: o mundo desenha a 1 px de mundo = 2 px
  de tela, mas o herói e os monstros levavam um `cx.scale(2,2)` **por cima disso**, então
  cada pixel deles ocupava quatro pixels de tela contra um da paisagem atrás. Um boneco
  grosso na frente de um fundo fino — é isso que o olho lê como tosco. Tirei o 2× e
  redesenhei tudo na grade do mundo. **Medido em células de sprite:** herói 10×12 = 120
  células → 22×26 = 572 (4,8×), paleta de 6 para 20 cores; fumaça 9×6 = 54 → 18×13 = 234;
  saco de dinheiro 9×8 = 72 → 18×16 = 288; tambor 8×9 = 72 → 16×18 = 288. Todos sombreados
  por **uma** direção de luz (sol em cima e à direita: rim claro à direita, base, sombra
  própria à esquerda, base escura embaixo) e assados uma vez em canvas offscreen, então o
  quádruplo de pixels custa um `drawImage` por personagem por quadro. Ciclo de corrida de
  4 quadros, capa e combo de 3 golpes preservados, com os deslocamentos dobrados.

  O segundo problema era o mingau verde do meio da tela, e ele agora tem número:
  a antiga linha de árvores e os antigos arbustos ficavam a **0,5–2,6 pontos de
  luminância** um do outro (de 0 a 255) — na prática, indistinguíveis, um borrão só.
  Viraram três faixas separadas por valor (névoa 0,30 / 0,10 / 0,00 e bases de matiz
  diferente): **31 e 36 pontos** de distância entre planos vizinhos com o mundo curado,
  25 e 28 no meio, 19 e 21 com o mundo doente. Junto vieram: céu com três paradas em vez
  de duas (a rampa reta deixava uma laje de azul-marinho em metade do quadro), nuvens com
  lóbulos, topo iluminado e barriga sombreada em vez de três retângulos chapados, cidade
  com mais névoa e janelas como textura em vez de buracos pretos, copas de árvore e pinheiros
  como mapas sombreados à mão, casa com parede iluminada à direita e beiral, lago com
  reflexo da linha de árvores e brilho que anda, e a trilha de terra com sulcos e pedras.

  **Custo medido** (viewport 390×844 = 195×422 px de mundo): `drawScene` foi de **0,555 ms
  para 0,761 ms** por quadro — 4,6% do orçamento de 16,7 ms; assar o céu subiu de 5,40 para
  7,30 ms mas só roda quando a saúde cruza um passo de 1/48; chão 2,20 ms; vinheta 4,40 ms
  uma vez por resize. **FPS: 61, igual ao de antes.** Smoke test verde em todas as etapas.

  Quebrou no caminho: (1) o `drawMap` ganhou uma chave de cache e o postal da intro
  (128×42) passou a receber um herói de 22×26 que ocupava dois terços do quadro — resolvido
  com um `HERO_MINI` próprio de 10×13; (2) a primeira versão da espada em diagonal
  contornava **cada degrau** separadamente e lia como uma fileira de tijolos brancos soltos,
  não como uma lâmina — passou a ser desenhada em três passadas (contorno, corpo, fio); (3)
  o braço da espada era um retângulo preto de 9×10 atravessado por uma manga de 7×4, o que
  virava uma tarja preta no peito. E uma coisa que só os prints pegaram: havia **duas**
  vinhetas empilhadas, a pontilhada do canvas e um `radial-gradient` de CSS a 50% de preto
  a partir de 55% — juntas empurravam o quadro inteiro para o barro. A do CSS caiu para 26%
  a partir de 66% e as scanlines de .5 para .34; conferido nos prints com o mundo a 100% e
  a 6% que o mundo doente continua opressivo, só não mais lamacento.

  Dúvida nova: o herói tem 44 px de mundo de altura, e no celular a faixa REAL DATA mais a
  barra de botões comem o terço de baixo da tela — sobra pouca área para o cenário que
  acabou de ficar bom. Vale medir se dá para encolher aquela faixa.
  **Próximo passo: o céu ainda é a maior área do quadro e a menos trabalhada com o mundo
  meio doente; depois disso, animar as folhas das copas e dar quadros de idle ao herói.**

- **2026-08-02 · o herói desceu para a grade do mundo, e o miolo ganhou três planos.**
  O dono disse pela segunda vez que ainda estava feio e pediu "64 bit, ou até HD, mas com
  essa estética". A causa raiz não era falta de cor: o mundo desenha a 1 px de mundo = 2 px
  de tela, mas o herói e os monstros levavam um `cx.scale(2,2)` **por cima disso**, então
  cada pixel deles ocupava quatro pixels de tela contra um da paisagem atrás. Tirei o 2× e
  redesenhei tudo na grade do mundo. **Medido em células de sprite:** herói 10×12 = 120
  células → 22×26 = 572 (4,8×), paleta de 6 para 20 cores; fumaça 9×6 = 54 → 18×13 = 234;
  saco de dinheiro 9×8 = 72 → 18×16 = 288; tambor 8×9 = 72 → 16×18 = 288. Todos sombreados
  por **uma** direção de luz e assados uma vez em canvas offscreen, então o quádruplo de
  pixels custa um `drawImage` por personagem por quadro.

  O mingau verde agora tem número: a antiga linha de árvores e os antigos arbustos ficavam
  a **0,5–2,6 pontos de luminância** um do outro (de 0 a 255) — indistinguíveis. Viraram
  três faixas separadas por valor, com **19 a 36 pontos** entre planos vizinhos conforme a
  saúde do mundo. Junto: céu com três paradas, nuvens com lóbulos e barriga sombreada,
  copas e pinheiros como mapas sombreados à mão, casa com parede iluminada e beiral, lago
  com reflexo, trilha de terra com sulcos e pedras. **Medido:** `drawScene` foi de 0,555 ms
  para 0,761 ms por quadro (4,6% do orçamento de 16,7 ms), FPS 61 igual ao de antes.
  Quebrou no caminho: o postal da intro (128×42) recebeu um herói de 22×26 que ocupava dois
  terços do quadro (resolvido com um `HERO_MINI`); a espada em diagonal contornava cada
  degrau e lia como tijolos soltos (três passadas resolveram); e **duas vinhetas
  empilhadas** que só os prints pegaram.

- **2026-08-02 · a espada virou varinha, e todo golpe conjura.** Direção nova do dono:
  *"ao invés de espada bora fazer uma vibe mística e meio mágica, deve ser uma varinha
  mágica que atire magia."* Nenhuma lâmina em lugar nenhum. A varinha é um galho gasto de
  2 px de espessura com cabo amarrado, um nó de cordão verde e a ponta sempre um pouco
  acesa; ela é percorrida um pixel por vez ao longo da reta e desenhada em três passadas,
  então continua um graveto limpo em qualquer ângulo. A magia é **magia de cuidado** —
  núcleo branco-quente, corpo âmbar, halo verde de crescimento; nunca azul arcano. Um
  helper só, `luz()`, desenha cada ponto de luz canalizada como octógonos aninhados feitos
  de retângulos cruzados, para o brilho continuar sendo forma de pixel e não borrão. Os
  três golpes viraram três conjurações; o salto, o `jumpT` e a onda de choque continuam
  intactos porque o smoke test os exige. **O projétil é cosmético**: nasce do código de
  desenho a partir do estado de ataque que já existia, então nada sobre alcance, dano ou
  timing foi tocado — isso é do outro agente. FPS 61, smoke verde.

- **2026-08-02 · direção C (CLEAR SKY): o mundo doente parou de ser escuro.** Um agente de
  design mediu a referência e o dono escolheu. A medida que virou a mesa contradiz o que eu
  estava assumindo: **o pixel de arte da referência é maior que o nosso**, e o herói dela é
  mais baixo — a fidelidade nunca veio de resolução. Vem de 3–5 tons por material, contorno
  escuro de 1 px, **um** grid, arquitetura de valor com faixa clara no horizonte, e **zero
  pós-processamento**. Então caíram as quatro camadas de pós que eu mesmo tinha construído
  nesta sessão: a correção `overlay`, a vinheta pontilhada do canvas, a vinheta de CSS e as
  scanlines. A tabela de Bayer 8×8 foi junto — a granulação estava fazendo o papel de tons
  que ninguém tinha autorado. **Medido:** assar o céu caiu de 6,10 ms para 0,70 ms, o chão
  de 2,00 ms para 0,50 ms, e a vinheta (4,50 ms por resize) sumiu; `drawScene` 0,581 ms por
  quadro contra o orçamento de 16,7 ms; FPS 61.
  O doente virou **desbotado**: fumaça espalha luz, então céu poluído é quente, opaco e
  claro demais — nunca preto. O arco doente→curado passou a rodar em **saturação**, que é o
  canal mais rápido de ler. O herói e a magia da varinha **não** dessaturam com o mundo:
  no frame doente a varinha é a única coisa quente e saturada da tela.
  Também: a **faixa separadora** no horizonte (a peça que sustenta a arquitetura de valor),
  o sol virou disco de verdade com coroa, e o contorno das faixas verdes é graduado por
  distância — duro no perto, suave no meio, ausente no fundo.

- **2026-08-02 · fora a fonte de CDN, dentro uma fonte bitmap, e a HUD virou pôster.**
  O `index.html` buscava a Press Start 2P no Google Fonts a cada abertura: isso quebrava a
  seção 1 do `CLAUDE.md` na letra ("um arquivo só, sem dependência em runtime") e era um
  bloqueio de render de rede antes do primeiro pixel. As duas `<link>` sumiram. Duas
  substituições, porque as duas superfícies querem coisas diferentes: o chrome usa a pilha
  de fontes do sistema (que é o que os mockups da direção usaram de verdade), e o canvas
  ganhou uma **fonte bitmap 5×7 autorada no arquivo** — 47 glifos, cada um assado uma vez
  com contorno de 8 direções. Os números flutuantes usavam sombra deslocada de 1 px, que
  desaparecia no instante em que o chão atrás deles ficou claro. Ícones de pixel também
  ganharam o contorno automático: um raio dourado simplesmente sumia no creme.
  A HUD virou linguagem de pôster: creme `#fdf6e6` sólido, contorno `#12242e` de 2 px,
  sombra dura de 3 px, sem transparência e sem gradiente em painel. O REAL DATA virou um
  ticker fino — gastava um quinto da tela para dizer uma frase. **Medido:** FPS 61,
  `drawScene` 0,581 ms. Conferi print a print: chips, intro, folha de projetos, cards de
  upgrade, confirmação da tocha e números flutuantes. Quebrou no caminho: com o botão
  padrão virando creme, o `NOT YET` ficou marinho sobre marinho — só o print pegou.
  **Próximo passo, na ordem do `DIRECAO.md`: silhuetas de verdade (`mountainLayer()` por
  coluna, copas por união de discos), depois as duas paletas autoradas substituindo os ~40
  `lerpC()` espalhados, e só então a densidade 1:3 — que é o passo arriscado e precisa ser
  medido com cuidado. Dúvida honesta: com a faixa separadora, a serra do fundo quase some;
  o próprio `DIRECAO.md` já tinha anotado isso como falha do mockup C.**

## Would cut with one more day

The REAL DATA rotation (keep one fixed) and the snow caps. ~~The `confirm()` on the
torch~~ — done: PASS THE TORCH? is now a sheet like the others, and unlike a browser
dialog it can show what you keep beside what you hand on.
