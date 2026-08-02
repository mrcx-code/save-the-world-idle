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

On top of that the world multiplies output three more ways, none of them touching
tiredness: `bloqueioMundo()` (−10% per trouble standing in your way, three at most),
`bonusMutirao()` (×1.35 for 20s after answering a community call) and `bonusDias()`
(+2% per distinct day played, capped at ten days).

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
as falsy). U4 grew a second job on 2026-08-02: the neighbours' auto-taps also clear the
troubles blocking the road, and they pick up what is left on the ground (at half value,
after 5s). It is the purchasable answer for someone who does not want to watch.

## Skills — a category apart

Upgrades are this run. **Skills are forever.** One ships: **AUTO-FIRE**, the wand keeping
watch and shooting on its own. It lives on its own sheet, reached from the torch, because
the torch is where everything you keep lives.

| | value | why |
|---|---|---|
| cost | 2,000 impact | the greedy-buy dynamic sets this, see below |
| unlock | after your first torch | run 1 cannot have it — the second run is a different game |
| survives prestige | **yes** | that is the category's whole identity |
| focus to arm | 40 | trouble cleared +8 · drop picked up +5 · call answered +25 |
| while armed | 10 shots/s for 10s | routed through the same `clicar(auto)` the player uses |
| touches tiredness | **never** | `clicar(true)` skips U2's heal, by construction |

**Why it is not a second U4.** "Neighbors join in" is a flat 2 taps/s that runs forever,
free, whether or not anything is happening. AUTO-FIRE produces nothing by itself: it burns
FOCUS, and focus only comes from showing up for the world — clearing a trouble, bending
down for a drop, answering the kitchen. Measured: **focus while nothing happens stays at 0**,
and a drop the neighbours pick up for you gives **0** focus. Put the phone on a table and
the wand never fires. Its fuel is the world layer, which is rate-capped by design (one
arrival per 7s, three alive at most), so it cannot become an income engine however long it
is left alone — the exact opposite of the failure this game already survived.

**What the price had to be, and why.** The sim's greedy buyer takes every project it can
afford every tick, so the balance sits just under the *next project's* cost — which means a
lump-sum item is only ever affordable once `15 × 1.15^n` has grown past it. That is why
u5/u6/u7 are never bought in a 50K run, and it is why a 20,000 skill was measured being
bought **never**. Two other models were tried and rejected: making the run save for it
after its upgrade list (never fires — these runs never finish their list) and making it
stop buying projects to save (run 2 went 4m44s → 26m44s and it *still* did not buy, because
the upgrades ate the balance first). 2,000 is the price the economy actually admits.

Measured over two torches back to back:

| strategy | run 1 | run 2 | total | wand |
|---|---|---|---|---|
| rhythm + hold + world + **SKILL** | 6m41s | **4m43s** | 11m24s | 629 impact, 5 channels, 499 shots |
| rhythm + hold + world | 6m41s | 4m44s | 11m25s | — |
| STEADY + hold 25% + world + **SKILL** | 7m30s | 5m32s | 13m02s | 530 impact, 4 channels, 337 shots |
| STEADY + hold 25% + world | 7m30s | 5m32s | 13m02s | — |

Run 1 is identical to the second in every row, which is structural: the skill cannot be
bought before a torch. Run 2 moves by **one second**. So the honest verdict is that
AUTO-FIRE is worth about **1.3% of a run** and costs 4% of one — it pays for itself around
the third torch and is upside after that, which is the right shape for something permanent
and the wrong shape for anything that could threaten the eight-minute first torch.

That ceiling is not a tuning failure, it is arithmetic already in this file: **taps are
4–7% of total impact**, so no tap-shaped skill can ever be worth much here. A skill that
wanted to matter more would have to pay in something other than swings.

## The rhythm, explained

The prototype exists to measure one decision and the game never told the player what they
were trading — `definirModo()` threw one floating word and that was the whole feedback.
Everything below is *projected from the live formulas*, never written down twice, so a
tuning change moves the explanation with it:

| readout | where it comes from |
|---|---|
| tiredness equilibrium | `cansacoEq(modo) = emission / k`, the `eq` term inside `simular()` |
| tiredness in 60s | `cansacoEm(modo, t) = eq + (p − eq)·e^(−kt)` — the same closed form |
| when the team is back to 90% | `segundosAteSaude(modo, 0.9)`, that equation solved for t |
| rate under a rhythm | `taxaSe()` swaps `S.modo`/`tempoLimpo`/`poluicao`, calls the real `prodPorSegundo()`, restores |
| what a rhythm *settles* at | `taxaAssentada()` — the rate once tiredness has reached equilibrium |

The projects sheet carries the trade side by side: **NOW · <rhythm>** against **SWITCH ·
<the other>**, each with `now` / `settles` / `team now → settled`. At 43 projects with Big
campaigns, from a fully-climbed GO STEADY, that reads:

| | now | settles | team |
|---|---|---|---|
| NOW · GO STEADY | 224/s | **224/s** | 100% → 100% |
| SWITCH · GO FAST | **335/s** | 16.5/s | 100% → **5%** |

+50% for a minute against 13× less forever. That sentence was always true and was never
once shown. From the wrecked side it inverts — GO FAST reads 42/s now settling to 16.5/s,
GO STEADY reads 7.2/s now (the ramp is back at ×1) settling to 224/s — which is exactly the
"burst then recover" shape open question 6 describes.

The ramp reset gets its own red warning naming the multiplier being thrown away and how
long it takes to climb back. The mode button in the menu row became a state readout
(`FAST →5%` / `STEADY ×4.0`) that pulses while GO FAST is actively costing health, and the
team chip carries the direction (`1m ↓ 9%` while tiring, `90% ↑ 14m` while resting).

Switching now lands: a full-frame wash (red for fast, green for steady), a pop on the chips
that changed meaning, a column of sparks, a five-line float stack with the real numbers
(`224/s > 335/s`, `SETTLES 16.5/s`, `TEAM 5%`, `RAMP LOST x4.00`) and a line in the strip
that stays up for 4.5s.

None of it touches the economy: `node test/sim.js` is identical to the second, before and
after. The smoke test checks the projection against reality by stepping `simular()` for 60
real seconds and comparing — 501.34 vs 501.34.

## The world answers back

| thing | number | where it lands |
|---|---|---|
| a trouble walks in | 34 world px/s, ~3.8s of warning | `atualizarMobs(dt)` |
| arrivals | one per 7s ÷ (1+smog), 3 alive at most | a worn-out team draws more |
| queue | 20px apart, at HX+26/+46/+66 | all inside a swing's reach (80/96) |
| standing in the way | **−10% production each**, −30% at three | multiplier, *never* tiredness |
| a drop | `3 + 0.55 × projects`, ×wisdom ×health ×fair-share | picked up by tapping it |
| drop life | 9s (U4 auto-collects at 5s for half) | |
| community call | every 110s, 12s window | missing it costs nothing |
| mutirão | ×1.35 to everything for 20s, road cleared | doubled when a call was kept for you |
| coming back | +2% per distinct day, cap 10 days | reads `R.dias`, the retention record |

The whole scene is the attack button: a tap on it swings exactly like the CTA (same
combo, same leap, same sprout) *and* hits whatever was under the thumb — an aimed tap
deals 2 damage on top of the swing's 1. Both surfaces share **one** repeat timer, so
holding the button and the world at once cannot double the hit rate. With a sheet open a
scene tap only dismisses it, so "tap outside to close" never costs a stray swing.

The one rule the whole layer obeys: **nothing here heals tiredness and nothing here
changes how tiredness is made.** Tapping the team's exhaustion away is exactly what
erased the GO FAST / GO STEADY decision once already (see below), so every reward is a
multiplier on output or a lump of impact — both still multiplied by team health, so a
worn-out team gets less out of the world too.

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

### After the world started answering back (2026-08-02)

| strategy | time | worst team | world share |
|---|---|---|---|
| rhythm + hold + **world** | **6m41s** | 75% | 3% |
| projects STEADY + hold + world | 6m57s | 100% | 2% |
| rhythm + hold | 7m28s | 75% | 1% |
| projects STEADY + hold | 7m35s | 100% | 1% |
| projects, GO STEADY + U4 | 10m58s | 100% | 1% |
| projects, GO STEADY | 12m02s | 100% | 0% |
| rhythm, hands off | 14m01s | 75% | 0% |
| hold only, no projects | 43m02s | 100% | 1% |
| projects FAST + hold + world | 49m20s | 5% | 3% |
| projects FAST + hold | 54m25s | 5% | 1% |
| projects, GO FAST | 1h25m30s | 5% | 0% |

Read it as two columns. Playing the world is worth **1.12×** (7m28s → 6m41s) — enough to
be worth a thumb, small enough that the run did not collapse. Ignoring it costs **1.4×**
(8m37s → 12m02s for hands-off steady), because three troubles standing in the road take
30% of the work. `--patch=semMundo` turns the whole layer off and reproduces the previous
table to the second, so the delta stays measurable.

The fast/steady decision is untouched, by construction: every new term is a multiplier
applied to both modes, so the health gap between them is exactly what it was — 100% for
steady, 5% for fast, and the run that swaps modes still wins. `--patch=u2Sempre` still
collapses the table to 4m17s with the team at 35%, so the detector for the old failure
still fires.

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
— or the scene — repeats at ~7 hits/s, from a **single shared timer**, so holding both
surfaces at once cannot double the rate. Sprouts are capped at 40 so holding in steady
mode doesn't flood the scene. The bolt is spawned from the drawing code off the attack
state that already exists, so it is decoration only — what gets hit, how far and how hard
is decided elsewhere.

One line under the top chips says what the world wants right now, and only ever one
thing: a call beats a mutirão beats a complaint. Drops carry a dark keyline and four
breathing ticks; the pot carries a nodding chevron and a countdown bar that turns red
under a third. All of that is drawn *after* the colour grade, on purpose — an affordance
has to stay legible even when the frame is being tinted.

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
5. **Monsters now cost 1.4× to ignore, and that cost lands hardest on the idle player.**
   The block is a multiplier, so it does not touch the fast/steady maths — but a run that
   never looks at the screen and never buys U4 eats −30% for the whole game. U4 is the
   answer and it costs 3,000, which is late. Worth checking whether the block should
   fade as the world heals (`worldHealth()` is right there) instead of holding at full
   strength forever.
6. **The GO STEADY ramp reset is harsher than it looks, and it does not live where you
   think.** `definirModo()` sets `S.tempoLimpo = 0`, but that line is redundant: the real
   reset is in `simular()`, which zeroes `tempoLimpo` on *every tick* spent in GO FAST.
   Measured with two patches that keep the clock alive across the fast stretch:
   `--patch=rampaMeia` (a switch keeps half the climb) moves the winner 6m41s → 6m39s and
   the hands-off rhythm 14m01s → 13m17s; `--patch=rampaFica` (the ramp survives switching
   entirely) takes the winner to **5m56s**, an 11% acceleration, and promotes both rhythm
   runs *above* the pure-steady ones. So: full preservation turns the rhythm into a free
   toggle and should not ship; half-credit costs the table almost nothing (0.5% on the
   winner) while removing the "I tried GO FAST once and lost two minutes of climbing"
   punishment. Neither is shipped — flagged for the owner, with the numbers.
7. **GO FAST is dominated by GO STEADY once projects pile up.** At equilibrium a fast
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

- **2026-08-02 · fila (f), lente *Volta no dia 2*: o mundo passou a responder.** O jogo
  era segurar um botão e comprar coisas; os monstros nasciam, paravam e viravam cenário.
  Agora: (1) **eles andam** até você e formam fila, e cada um parado na frente bloqueia
  10% da produção (−30% com três) até alguém resolver; (2) **derrubar deixa um item no
  chão** que precisa ser recolhido com o dedo, na cena; (3) a cena inteira virou botão —
  a pedido do dono, tocar na tela golpeia igual ao CTA de baixo, mesmo combo e mesmo
  salto, e ainda acerta o que estiver embaixo do dedo (mira dá 2 de dano além do golpe);
  (4) **chamada da comunidade** a cada 110s com janela de 12s: aparecer dispara um
  mutirão de ×1,35 por 20s e limpa a rua; perder não custa nada; (5) **voltar amanhã
  vale**: +2% permanente por dia distinto jogado (teto de 10), e quem volta depois de uma
  noite — ou num dia novo — encontra uma chamada guardada, que vale dobrado.
  **Regra que segurei o tempo todo: nada disso cura cansaço nem muda como o cansaço é
  gerado.** Todo ganho novo é multiplicador de saída ou impacto avulso, e ambos continuam
  multiplicados pela saúde do time — foi exatamente curar cansaço no toque (o U2 antigo)
  que matou a decisão GO FAST × GO STEADY na sessão de agosto.
  **Medido** (`node test/sim.js --detail`, 13 estratégias): a corrida mais rápida virou
  **rhythm + hold + world, 6m41s**, contra 7m28s de quem segura mas ignora o mundo —
  jogar o mundo vale **1,12×**. Ignorar custa **1,4×**: o steady de mãos livres foi de
  8m37s para **12m02s**, e o GO FAST de mãos livres de 56m58s para **1h25m30s**. A
  decisão fast × steady ficou intacta por construção: o pior estado do time continua 100%
  no steady e 5% no fast, e a corrida que alterna modos continua ganhando. Guardas de
  regressão: **`--patch=semMundo` reproduz a tabela antiga segundo a segundo** (7m28s /
  7m35s / 8m37s / 9m59s / 43m34s / 54m17s / 54m18s / 56m13s / 56m58s), e o
  `--patch=u2Sempre` ainda derruba tudo para 4m17s com o time a 35%, ou seja, o detector
  do erro antigo continua funcionando. Primeira calibragem ficou forte demais: com item a
  `3 + 0,8×projetos` e mutirão ×1,5, a corrida mais rápida caiu para **6m26s** (14% mais
  rápida) — como o NOTES já registra que a primeira tocha em ~8min é a maior ameaça à
  pergunta dos três dias, cortei para `3 + 0,55×projetos` e ×1,35 e o número voltou para
  6m41s (10%). O U4 ganhou função nova sem custar linha de UI: os vizinhos limpam a rua
  sozinhos e recolhem o que ficou no chão pela metade — o steady de mãos livres com U4 faz
  10m58s contra 12m02s sem ele.
  **Quebrou no caminho, três coisas.** (a) Os monstros paravam todos na *mesma*
  coordenada e ficavam desenhados um dentro do outro — o print entregou na hora; agora
  fazem fila de 20px em 20px, e por causa disso o alcance do golpe teve de subir de 46/62
  para 80/96, senão o último da fila era inalcançável pelo botão e a rua nunca limpava.
  (b) O primeiro teste do item falhava de vez em quando: o toque que recolhe **também é
  um golpe**, e esse golpe derrubava outro monstro e deixava um item novo, então "sobrou
  0 item" era asserção errada — passei a conferir o item específico. (c) O aviso novo
  cobria o resumo da noite justamente no caso mais comum (voltar de manhã, quando os dois
  aparecem juntos); o painel desce sozinho enquanto o resumo estiver no ar, e o smoke test
  agora compara os dois retângulos e falha se encostarem. Smoke cresceu para 10 checagens
  novas — inclusive a que o dono pediu explicitamente: segurar o botão **e** a cena ao
  mesmo tempo não dobra a cadência (8 contra 7 golpes em 1s, e os 8 são os dois toques
  iniciais, não o dobro do intervalo), porque as duas superfícies dividem um `setInterval`
  só. Verde, 61 FPS, load de 97ms.
  **Dúvida nova:** o bloqueio é um multiplicador fixo e não afrouxa nunca — quem joga
  ocioso e não compra o U4 (3.000, que chega tarde) paga −30% a partida inteira. Talvez
  ele devesse encolher conforme o mundo cura, já que `worldHealth()` está ali do lado.
  **Próximo passo: medir de verdade a curva do dia 2 — hoje o incentivo de voltar é +2%
  por dia e uma chamada dobrada, e isso foi escolhido no papel, não medido. A lente é
  *Medir*: simular três dias de sessões curtas e ver se o dia 2 tem mais a oferecer que o
  dia 1.**

- **2026-08-02 · a troca de ritmo passou a ser explicada e a doer.** O dono disse que a
  mudança de fogo para planta precisa ser mais impactante e explicar melhor o impacto — e
  ele está certo: o jogo inteiro existe para medir **uma** decisão e ela era um float
  escrito "GO FAST!". Agora, antes da troca, a folha de projetos mostra o negócio lado a
  lado — **NOW · ritmo atual** contra **SWITCH · o outro**, cada coluna com `now`,
  `settles` e `team agora → assentado`. Tudo projetado das fórmulas vivas, nada escrito
  duas vezes: `cansacoEq() = emissão/k` (o mesmo `eq` de dentro do `simular()`),
  `cansacoEm()` com a mesma forma fechada, `segundosAteSaude()` resolvendo aquela equação
  para t, e `taxaSe()` trocando `S.modo`/`tempoLimpo`/`poluicao`, chamando o
  `prodPorSegundo()` de verdade e restaurando — então a previsão não tem como divergir do
  que acontece no quadro seguinte. **Medido**: com 43 projetos e Big campaigns, saindo de
  um GO STEADY com a rampa cheia, o painel lê `224/s → 224/s, time 100%` contra
  `335/s agora → 16,5/s assentado, time 100% → 5%`. **+50% por um minuto contra 13× menos
  para sempre** — sempre foi verdade e nunca tinha sido mostrado. Do lado destruído
  inverte: FAST 42/s agora assentando em 16,5/s, STEADY 7,2/s agora (a rampa voltou ao ×1)
  assentando em 224/s. O reset da rampa ganhou aviso vermelho com o multiplicador que se
  perde e o tempo para reconquistá-lo. O botão de modo virou estado (`FAST →5%` /
  `STEADY ×4.0`) e pulsa enquanto o GO FAST está cobrando; o chip do time ganhou direção
  (`1m ↓ 9%` cansando, `90% ↑ 14m` descansando). A troca em si virou momento: lavagem da
  tela inteira (vermelha/verde), estalo nos chips que mudaram de significado, coluna de
  faíscas, pilha de cinco floats com os números reais (`224/s > 335/s`, `SETTLES 16.5/s`,
  `TEAM 5%`, `RAMP LOST x4.00`) e uma linha na tarja por 4,5s. **A economia não se mexeu:
  `node test/sim.js` saiu idêntico ao segundo, antes e depois** — 6m41s / 6m57s / 7m28s /
  7m35s / 10m58s / 12m02s / 14m01s / 43m02s / 49m20s / 54m23s / 54m25s / 57m36s / 1h25m30s.
  A honestidade da previsão virou teste: o smoke pisa o `simular()` por 60s de verdade e
  compara com `cansacoEm()` — **501,34 contra 501,34**.
  **Sobre o reset da rampa, que o dono perguntou se é bom design:** medi em vez de opinar,
  e no caminho descobri que ele **não está onde parece**. O `definirModo()` zera o
  `S.tempoLimpo`, mas essa linha é redundante — quem zera de verdade é o `simular()`, a
  cada quadro passado em GO FAST. Minha primeira tentativa de patch não mudou nada
  justamente por isso (mexia no lugar errado, e a tabela saiu idêntica — foi o sinal).
  Com o patch certo: `--patch=rampaMeia` (a troca guarda metade da subida) leva a corrida
  vencedora de 6m41s para **6m39s** e o ritmo sem mãos de 14m01s para 13m17s;
  `--patch=rampaFica` (a rampa sobrevive inteira) leva a vencedora para **5m56s**, 11% mais
  rápida, e **promove as duas corridas de ritmo para cima das de steady puro**. Conclusão:
  preservar tudo transforma o ritmo num interruptor de graça — é a mesma forma de falha do
  U2 antigo e não deve subir. Guardar metade custa quase nada à tabela (0,5% na vencedora)
  e tira o castigo de "experimentei o GO FAST uma vez e perdi dois minutos de subida".
  Não subi nenhum dos dois: é mudança de economia e a decisão é do dono, agora com número.
  **Quebrou no caminho, duas coisas, e as duas o teste novo pegou.** (a) O botão de modo
  ganhou uma segunda linha de texto, a barra de menu ficou 3px mais alta e a folha de
  projetos passou a **cobrir o menu** — exatamente a regressão que o NOTES já registra da
  sessão de origem, que na época foi consertada com um `126px` chumbado. Em vez de chumbar
  outro número, o `--hControles` agora é **medido** do bloco de controles no load e no
  resize, então um botão que cresça uma linha não pode mais empurrar o menu para debaixo do
  painel (folha em 709, menu em 715). (b) A tarja escondia a classe mas mantinha o texto
  velho no DOM; agora esvazia junto. Verde, 61 FPS, load de 96ms.
  **Dúvida nova:** o painel só é visto por quem abre a folha de projetos, e o atalho de
  modo na barra troca sem abrir nada. Quem nunca abrir a folha vê a explicação só no
  momento da troca (floats + tarja) — pode ser suficiente, mas é uma suposição, não uma
  medição. **Próximo passo: decidir com o dono o `rampaMeia`, e medir se alguém que só usa
  o atalho chega a entender o negócio — a lente é *Primeiros cinco minutos*.**
  **Recomendação para a agente de ESTÉTICA (não implementei, é território dela):** o mundo
  em si ainda não reage ao ritmo. O GO FAST já tem `smog` ligado ao cansaço, mas a troca
  poderia empurrar o céu e a grade de cor por alguns segundos — azedar no fogo, respirar no
  verde — que é o único lugar onde a decisão ainda não aparece.

- **2026-08-02 · a folha de projetos passou a dizer o que um projeto É, e a comprar em
  lote.** O dono olhou para `+ START A PROJECT — 15` e não soube dizer o que aquilo fazia —
  e ele é o dono. Era o preço e mais nada, na compra mais importante do jogo. Agora duas
  linhas curtas respondem, as duas lidas das fórmulas vivas: `169/s from 43 projects — they
  work on their own, forever` e `each adds +3.9/s forever · next one costs 6,111, and every
  one after is +15%`. Sem nenhum projeto ainda, a primeira linha diz o que faltava dizer:
  *projects earn every second, by themselves — taps are the only income you have until
  then*. A taxa por projeto sai de `taxaDeUmProjeto()`, que **pergunta ao
  `prodPorSegundo()`** quanto mudaria com mais um em vez de repetir a conta, então carrega
  junto o modo em que você está, a rampa, U1/U3, sabedoria, saúde do time, mutirão e o que
  estiver bloqueando a estrada. **Medido**: a taxa anunciada bate com a real com erro
  < 1e-9. Comprar em lote virou uma fileira `×1 / ×10 / MAX` acima do botão, guardada no
  save — três alvos fixos em vez de um controle que se cicla, porque MAX fica a um toque de
  qualquer lugar e a fileira lê igual ao par GO FAST / GO STEADY que já está na mesma folha.
  A aritmética é um laço, não fórmula fechada: a curva é `ceil(15·1,15^n)` e o teto torna a
  fórmula fechada chata na fronteira. **Medido, não suposto**: com dinheiro para exatamente
  7 projetos mais um a menos que o oitavo, o MAX compra 7 e deixa 213, e comprar de um em um
  a partir do mesmo saldo compra 7 e deixa 213; com 1 de impacto compra 0 e o saldo nunca
  fica negativo. A tabela do `sim.js` saiu idêntica ao segundo, como tinha de sair — o
  simulador já comprava em laço guloso desde sempre. Quebrou no caminho: as linhas novas
  empurraram os botões de modo para fora da folha; o `max-height` foi de 52vh para 62vh, que
  só cresce para cima (quem protege a barra de menu é o `bottom`, e o teste afere os dois
  retângulos: 709 contra 715), e a descrição do modo, que estava repetindo o quadro
  comparativo logo acima, passou a carregar só o que ele não tem — onde a rampa está. Cabe
  sem rolagem num 390×844.

- **2026-08-02 · SKILLS: uma categoria nova, e o AUTO-FIRE nela.** O dono pediu uma
  habilidade comprável de tiro automático, e explicitamente **um tipo novo de coisa**, não
  um oitavo upgrade. Upgrades são desta partida; **skills são para sempre**. Folha própria,
  alcançada pela tocha — porque a tocha é onde mora tudo o que você mantém. O AUTO-FIRE não
  produz nada sozinho: ele **queima FOCO**, e foco só vem de aparecer para o mundo (limpar
  um problema +8, catar um item do chão +5, atender a chamada +25). Cheio aos 40, a varinha
  canaliza **10 tiros/s por 10s**, pelo mesmo caminho de golpe do jogador — então o que a
  agente de estética desenhar na mão do herói vem junto de graça.
  **A restrição dura, cumprida por construção e medida**: os tiros automáticos passam
  `clicar(true)`, que pula a cura do U2. Teste: um canal inteiro de tiro automático deixa o
  cansaço em **100 → 100**, enquanto 20 toques à mão levam 100 → 60. Automação que paga
  cansaço é exatamente a falha que este jogo já sobreviveu uma vez, e agora ela é impossível
  aqui, não só improvável.
  **Por que não é um U4 maior**: o U4 são 2 toques/s fixos, de graça, para sempre,
  acontecendo ou não alguma coisa. **Medido**: com nada acontecendo o foco fica em **0**, e
  um item que os vizinhos catam por você dá **0** de foco. Celular na mesa, varinha muda.
  O combustível é a camada do mundo, que tem teto (uma chegada a cada 7s, três vivos), então
  ela não tem como disparar sozinha por muito tempo que se espere.
  **Sobrevive à tocha? Sim** — é a identidade da categoria, e é seguro justamente porque o
  teto dela é a camada do mundo e não a contagem de projetos, então não compõe com a
  Sabedoria como um multiplicador de produção comporia. **Medido em duas tochas seguidas**:
  `rhythm + hold + world + SKILL` faz 6m41s / **4m43s** (total 11m24s) contra 6m41s / 4m44s
  (11m25s) do gêmeo sem skill — a corrida 1 é idêntica ao segundo em todas as linhas, o que
  é estrutural (não dá para comprar antes da primeira tocha), e a corrida 2 anda **um
  segundo**. A varinha rendeu 629 de impacto em 5 canais e 499 tiros, ou seja **1,3% da
  partida** por um custo de 4% de uma — se paga por volta da terceira tocha e é lucro depois.
  Esse teto não é erro de calibragem, é aritmética que já estava neste arquivo: **toque é
  4–7% do impacto total**, então nenhuma habilidade em forma de golpe pode valer muito aqui.
  **Preço: 2.000, e quem escolheu foi a economia.** O comprador guloso leva todo projeto que
  couber a cada tique, então o saldo fica logo abaixo do **custo do próximo projeto** — o
  que significa que item de valor fechado só é alcançável depois que `15·1,15^n` passa dele.
  É por isso que u5/u6/u7 nunca são comprados numa corrida de 50K, e foi por isso que a
  skill a 20.000 foi medida sendo comprada **nunca**. Duas outras modelagens foram testadas
  e rejeitadas: poupar depois de fechar a lista de upgrades (não dispara — estas corridas
  nunca fecham a lista) e parar de comprar projetos para poupar (a corrida 2 foi de 4m44s
  para **26m44s** e mesmo assim não comprou, porque os upgrades comiam o saldo antes).
  Detectores seguem firmes: `--patch=u2Sempre` ainda derruba a tabela para 4m17s com o time
  a 35%, e `--patch=semMundo` ainda reproduz a tabela antiga. Verde, 61 FPS.
  **Dúvida nova:** a skill é neutra para quem segura o botão e quase neutra para quem não
  segura, porque o teto de 4–7% vale para os dois. Se a categoria for crescer, a próxima
  precisa pagar em algo que **não** seja golpe — reduzir o bloqueio dos problemas, esticar o
  mutirão, encurtar a rampa. **Próximo passo: decidir com o dono se a segunda skill mexe
  numa dessas alavancas, e medir o `rampaMeia` que ficou pendente da sessão anterior.**
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
