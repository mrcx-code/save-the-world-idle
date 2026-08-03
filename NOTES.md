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

## The super — three combos land, and the next swing is not a swing

| | value | why |
|---|---|---|
| arms after | 3 completed combos = 9 of **your own** swings | the owner's ask, literally |
| what actually gates it | `superRecarga` **22s**, during which combos stop counting | nine swings is 1.3s while holding; without the cooldown it would fire every 1.3s |
| pays in | the road clears (each trouble drops what it held) + **×1.15 for 4s** | *not* swing damage — see the 4–7% ceiling above |
| where the multiplier lands | exactly where `bonusMutirao()` lands: production, drops, taps | one shape, one place to reason about |
| charged by the wand / U4 | **never** | `clicar(auto)` and `clicar(false, true)` both skip the charge |
| touches tiredness | **never**, in either direction | there is no path from `dispararSuper()` to `S.poluicao` |

Measured: the winner goes **6m41s → 6m27s**, worth **3.5%** — about 2.7× what AUTO-FIRE is
worth, which is the point: a tap-shaped payoff is capped at the 4–7% tap share, and this one
is not tap-shaped. Every row keeps its place, the worst team health per row is unchanged
(75% / 100% / 5%), and hands-off runs barely move (GO STEADY 12m02s → 12m01s) because they
never swing. Split out with `superMult` forced to 1.0: **clearing the road alone is worth
1 second** to someone who is already holding the button — they keep the road clear anyway —
so the window is doing all the work and it is the only knob worth turning.
`--patch=semSuper` reproduces the pre-super table to the second. The table as it stands:

| strategy | time | worst team |
|---|---|---|
| rhythm + hold + world | **6m27s** | 75% |
| projects STEADY + hold + world | 6m45s | 100% |
| rhythm + hold | 7m17s | 75% |
| STEADY + hold 25% + world | 7m22s | 100% |
| projects STEADY + hold | 7m24s | 100% |
| projects, GO STEADY + U4 | 10m57s | 100% |
| projects, GO STEADY | 12m01s | 100% |
| rhythm, hands off | 14m00s | 75% |
| hold only, no projects | 41m59s | 100% |
| projects FAST + hold + world | 47m43s | 5% |
| projects FAST + hold | 52m40s | 5% |
| projects, GO FAST | 1h25m29s | 5% |

State the drawing side can read: `superFx = { t, dur, sx }` while the effect plays (`t`
counts up in seconds, `t/dur` is the progress), `superT` (seconds of window left),
`superCarga` (0..3), `superCd`, `superPronto()`, and the `#flash.super` wash.
`desenharSuper()` is a self-contained placeholder meant to be replaced.

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
| how many hits it takes | smog **2**, money bag **3**, barrel **5** (`CFG.mobHp`) | 2 / 3 / 4 swings from the button |
| how much is left | pips over its head, `desenharVidaMob()` | drawn from `m.hp` / `m.hpMax` |
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
an expanding wave and green things pushing up through the cracks). Three combos on top of
that arm **the super** — see its own section. Holding the main button
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

- **2026-08-02 · a varinha ficou sem luz, o mundo ganhou sotaque, e a direção C finalmente
  saiu do papel.** Sessão longa, com duas rodadas de correção do dono no meio dela.

  **A varinha.** O dono disse que ela brilhava demais em repouso. Tirei a luz do estado
  parado *inteira* — nada de ponta acesa, nada de cordão verde, nada de mote saindo a cada
  22 quadros. Ela virou galho: afina de 2 px no cabo para 1 px na ponta, tem uma curvatura
  de 0,95 px no meio do vão (era isso que fazia ela ler como tora no ângulo de repouso), um
  nó de madeira na ponta e um cordão amarrado no cabo. Toda a energia foi para o disparo:
  `flashCast` sobe a 1 no instante em que a magia sai e queima em ~9 quadros. **Quebrou no
  caminho:** a primeira versão do clarão usava `luz()` com fator 2,8 e virou uma laje
  amarela de 60×60 px cobrindo o herói — a causa é que o chanfro do octógono do `luz()` era
  1 px fixo, o que é octógono em r=3 e **quadrado** em r=15. Corrigi o `luz()` (chanfro
  proporcional, `r*0.32`), o que melhorou todo brilho do jogo, e troquei o clarão por uma
  **estrela de oito raios**, que é forma de pixel e não engole a silhueta.

  **Sotaque brasileiro, tudo no cenário, texto segue em inglês.** (1) **Ipê**: galho seco e
  cinza com o mundo doente, coroa meio lavada a partir de 38% de saúde e amarelo ou rosa
  cheio depois de 68%, com pétalas caindo. Três paletas autoradas em vez de interpolação —
  "seco → botão → florada" é história, interpolação é borrão. Preso ao `worldHealth()` e não
  só ao `alive` do segmento, senão aparecia árvore saturada em quadro desbotado roubando o
  papel da varinha. (2) **Monumentos no horizonte**, um por trecho de mundo, na mesma
  linguagem de silhueta da cidade: maciço com a figura de braços abertos no pico, parlamento
  de cúpula e taça invertida entre as duas lâminas, museu pendurado em dois pórticos
  vermelhos, elevador ligado ao alto da escarpa por uma passarela, e teatro com cúpula
  nervurada. Lugares, nunca marcas nem pessoas. (3) **O morro**: casas pintadas empilhadas
  na ladeira, telhado, caixa d'água e uma janela que acende. (4) **Bandeirinhas** da barraca
  até um poste do outro lado da calçada, com mesa e dois banquinhos embaixo, e
  **vitória-régia** no lago. **Medido:** os monumentos estavam enraizados em `GROUND-8` como
  a cidade e a linha de árvores comia todos — subiram para `GROUND-29` e passaram a pisar na
  faixa separadora, que é a arquitetura de valor funcionando em vez de brigando.

  **Depois vieram os dois recados duros do dono** ("está patético, muito basiquinho", "não
  quero 8 bit, quero atual", "os botões estão brancões e chapados", "os quatro botões têm o
  mesmo peso", "os dois primeiros ataques estão iguais", "cuidado com a vibe medieval"), e a
  sessão virou fechar o que a direção C nunca terminou:

  - **Silhuetas de verdade.** A serra era pirâmide de 5 degraus repetindo num espaçamento
    fixo; virou `serra()`, altura por coluna de três senos de períodos diferentes, contínua
    no mundo inteiro (não repete nunca), com o sol pegando toda encosta virada para a
    direita. **Medido: ~40 retângulos por camada em vez de 195**, porque corridas de altura
    igual são fundidas. As nuvens eram três retângulos com lóbulos pregados; agora são
    união de discos sobre uma base plana, topo por coluna, coroa iluminada e barriga.
  - **Densidade 1:3, o passo que ninguém tinha ousado.** **Medido em 390×844: buffer de
    195×422 (82.290 px) para 130×281 (36.530 px) — 56% menos preenchimento por quadro; o
    herói de 10,4% para 15,7% da altura do quadro, que é a faixa da referência; FPS 61 antes
    e 61 depois.** Ou seja: o pixel maior não custou nada e o buffer menor pagou os sprites
    maiores. Junto teve de ir a fonte do mundo, que era escala 2 e virava um outdoor sobre o
    peito do herói a 3 px por pixel de mundo — está em escala 1 (15×21 px de tela).
  - **Três ataques que parecem três coisas.** O 1 virou varrida **baixa** (ele inclina para
    frente, raspa a varinha no chão, arco de três tons levantando terra e verde); o 2 virou
    chicotada **para cima** (inclina para trás, leque de três nervuras, e o projétil nasce
    como três em leque). O 3 é o showpiece: o corpo passou a ser desenhado dentro de uma
    transformação, então o salto carrega um **mortal completo** — giro quantizado em
    dezesseis avos para ler como quadros desenhados, dois rastros na curva, anel de luz em
    volta, e **o giro termina em 62% do tempo de ar** para ele descer em pé e cravar a
    varinha no chão em vez de chegar de lado. Salto, `jumpT` e onda de choque intactos.
  - **Medieval → 2026.** A capa saiu (capa põe cavaleiro numa rua de 2026): agora é aba
    curta de jaqueta, cachecol saindo da nuca e mochila com fivela. O ícone da tocha era
    graveto com trapo em chamas; virou emblema — chama dentro de um brasão, no roxo que a
    folha da tocha e as skills já falam.
  - **A HUD virou uma linguagem só, e escura.** Creme chapado em tudo lia lavado contra um
    mundo saturado, e ainda deixava o jogo falando dois idiomas (creme por cima de folhas
    marinho). Agora é um azul-tinta profundo com gradiente vertical de verdade, fio de luz
    de 1 px no topo, contorno duro e sombra dura — a construção do passe de pôster ficou, só
    o preenchimento e o valor mudaram. **O ouro virou reservado**: só o botão principal
    (gradiente de três paradas, brilho interno em cima, sombra interna embaixo, sombra de
    6 px). E o menu deixou de ser quatro lajes iguais: virou uma bandeja com divisórias de
    fio e larguras que seguem o peso — leitura de ritmo 2,1 (é a decisão que o protótipo
    existe para medir), projetos 1,35 e em ouro (é a compra que se repete), upgrades e tocha
    0,8 (são lugares que se visita). **Sem tocar no markup** — largura, preenchimento e
    valor só.
  - **Contorno nos props**: poste, pedras, cozinha comunitária e as pessoas na rua eram
    preenchimento chapado sobre grama; cada um desenha agora a silhueta 1 px maior antes do
    corpo.

  **O que não fiz e por quê:** as **duas paletas autoradas** (os ~40 `lerpC()` espalhados)
  continuam de pé. É refatoração ampla e mecânica, e preferi gastar a sessão nos itens que o
  dono viu e nomeou. É o maior item restante e é o que faz os estados intermediários de
  `worldHealth()` deixarem de ser lama.
  **Próximo passo: as duas paletas autoradas; depois, mais tons por material nos sprites do
  herói e dos monstros — hoje eles têm 20 cores mas pouca modelagem, e a 1:3 isso aparece.**
- **2026-08-02 · o super, a vida dos bichinhos e o replanejamento da barra de baixo.**
  Três pedidos do dono, na mesma sessão.

  **(1) O SUPER.** Três combos completos armam; o golpe seguinte não é um golpe. O que
  *de fato* segura a frequência não é a contagem de combos — nove golpes são 1,3s
  segurando o botão — é a **recarga de 22s**, durante a qual os combos param de contar.
  Isso faz do super um evento de ~23 em 23 segundos, esteja você segurando ou cutucando.
  **Ele não paga em dano de golpe, e isso foi decisão medida, não de gosto**: o próprio
  NOTES já registra que toque é 4–7% do impacto total, então nenhum prêmio em forma de
  golpe pode valer muito aqui. Ele paga nas duas moedas da camada do mundo: a **rua limpa**
  (tudo que estiver nela cai de uma vez, cada um largando o que carregava) e uma **janela
  de mutirão curta, ×1,15 por 4s**, aplicada exatamente onde o `bonusMutirao()` é aplicado.
  **Medido** (`node test/sim.js`): a corrida vencedora foi de **6m41s para 6m27s**, ou seja
  **3,5%** — cerca de 2,7× o que vale o AUTO-FIRE. Nenhuma linha da tabela trocou de lugar,
  a pior saúde do time por linha ficou idêntica (75% / 100% / 5%), e as corridas de mãos
  livres quase não se moveram (GO STEADY 12m02s → 12m01s), porque elas não golpeiam. Separei
  as duas metades forçando `superMult` a 1,0: **limpar a rua sozinho vale 1 segundo** para
  quem já segura o botão — essa pessoa já mantém a rua limpa —, então quem faz o trabalho
  é a janela, e é ela o único botão de calibragem que importa. Guardas: `--patch=semSuper`
  reproduz a tabela anterior ao segundo; `--patch=u2Sempre` continua derrubando tudo para
  **4m08s com o time a 36%**; `--patch=semMundo` continua reproduzindo 7m28s / 7m35s /
  8m37s. **A regra dura foi cumprida por construção e virou teste**: os tiros da varinha
  (`clicar(true)`) e os toques dos vizinhos (`clicar(false, true)`) **não carregam** o
  super, então celular na mesa nunca constrói um; e o smoke test leva o cansaço a 100,
  dispara um super inteiro e confere que ele saiu **100 → 100**.

  **(2) A vida dos bichinhos era invisível.** A mecânica já existia — os golpes tiravam
  `hp` — mas nada nunca a desenhou, então o bicho parecia invulnerável até estourar de
  repente. Agora tem **pips na cabeça** (`desenharVidaMob()`, sem DOM, um contorno escuro e
  n quadradinhos), e o número de pips é o que diz "este é o grande". O 3 contra 4 também
  não lia como pequeno contra grande: virou **2 / 3 / 5**, amarrado aos sprites — a fumaça
  é a menor coisa da rua e cai em **um combo** (2 golpes), o saco de dinheiro leva 3, o
  tambor tóxico é o mais pesado e leva 4. O `CFG.mobHp` e o `CFG.mobMix` passaram a viver
  no CFG para o `test/formulas.js` calcular o `hpMedio(modo)` esperado em vez de carregar
  um 3,3 copiado à mão. **Medido**: a tabela se moveu no máximo 4s numa linha
  (`projects FAST + hold + world` 49m20s → 49m16s) e a vencedora ficou em 6m41s antes e
  depois — como tinha de ser, porque o hp médio ponderado pela mistura de spawn praticamente
  não mudou (3,22 → 3,24 em GO STEADY).

  **(3) Os quatro botões tinham o mesmo peso.** Eram quatro lajes idênticas para quatro
  funções diferentes. O bloco foi replanejado para a forma dizer o que cada coisa é: linha
  de cima `[tocha] [ ——— o RITMO em que você está ——— ]`; linha de baixo, `PROJECTS` e
  `UPGRADES` empilhados **do lado** (foi o que o dono pediu) ao lado da **ação principal**,
  que agora ocupa ~63% da largura e a altura inteira da linha. **Medido**: bloco de 93px
  para 122px, `--hControles` de 109 para 138 — e ele continua sendo **medido do bloco real**,
  não chumbado. O teste dessa regra ficou mais forte do que era: agora ele afere contra o
  `#controls` (e não contra uma linha *dentro* dele, que é justamente o que um replanejamento
  move sem querer), confere que a variável está a menos de 24px da altura real, **cresce o
  bloco em 40px e exige que a variável siga e volte** (142 → 182 → 142), e confere que a
  tarja REAL DATA também não encosta no bloco. Folha de projetos em 706 contra o topo dos
  controles em 712.

  **Quebrou no caminho, duas coisas, as duas pegas pelo teste.** (a) A tarja de aviso passou
  a mostrar a janela do super **por cima da chamada da comunidade** — e a chamada é a única
  coisa do jogo com prazo para fechar; a prioridade da tarja foi reordenada para a chamada
  vir primeiro. (b) Os testes de cadência de golpe ficaram intermitentes: segurar por 1s
  chega perto dos nove golpes, então às vezes o super disparava no meio da medição e inflava
  o número ("segurar as duas superfícies dobrou a cadência", que era falso); os dois blocos
  agora estacionam o super antes de medir, e ele tem bloco próprio. Verde, 61 FPS.

  **Deixei de fora de propósito:** um contador de "upgrade disponível" no botão UPGRADES
  (é UI nova, não estrutura, e a agente de estética está mexendo na mesma fileira) e
  qualquer segunda skill. **Dúvida nova:** a rua limpa vale 1 segundo para quem segura o
  botão, e não medi quanto ela vale para quem **quase não toca** — essa pessoa também
  quase não carrega o super, então talvez o prêmio esteja indo justamente para quem menos
  precisa dele. Vale medir uma corrida com `hold: 0.05` antes de calibrar mais.
  **Próximo passo: medir a curva do dia 2, que continua pendente desde a sessão do mundo.**

- **2026-08-02 · a tocha virou epílogo, o muro é a única coisa que sobrevive ao reset, e a
  corrida ganhou seis capítulos.** Três peças do `LORE.md` aprovadas pelo dono, e só essas.
  Nada aqui toca cansaço, `metaPrestigio` (50 mil) nem a curva `15 × 1,15^n` — **medido:
  `node test/sim.js` antes e depois dá saída byte a byte idêntica** (`diff` vazio nas 17
  linhas da tabela; a vencedora segue `rhythm + hold + world` em 6m27s, 43 projetos, pior
  saúde do time 75%). Isso é por construção: o `test/formulas.js` lê o `CFG` do
  `index.html` e o `CFG` não foi tocado.

  **(1) O epílogo.** Passar a tocha era um painel e um reset. Agora, depois do YES, abre
  uma folha `THE TORCH PASSES` que diz **quem** era, **quanto** a corrida deixou e **quem**
  pega a tocha: `NIA ran the first year. / 12 projects started on this street. / MARA takes
  the torch.` A armadilha que o `LORE.md` avisava era real e virou teste: o
  `transicionar()` zera `S.geradores` **duas linhas** depois do começo, então tudo que o
  epílogo diz é lido para um objeto local **antes** do wipe — o smoke test falha com a
  mensagem "the epilogue lost the run it was describing (projects read after the wipe?)"
  se alguém inverter isso. O sucessor sai do `ELENCO` indexado por `S.transicoes`, que já
  existia e já sobrevive ao prestígio: **zero campo novo de save** para o epílogo (o
  `LORE.md` pedia um `S.sparkIdx`; era redundante). Reordenei o fim do `transicionar()`
  — muro, epílogo, e só então `salvar(); desenhar()` — porque o `desenhar()` dispara o
  capítulo I e ele não pode aparecer por cima do epílogo.

  **(2) O muro pintado, no lugar de THE LONG TABLE.** O dono recusou a mesa longa ("muito
  cavalheiro, medieval"), então é um muro de rua: cada tocha deixa um nome, e ele **só
  cresce**. Chave própria no `localStorage` (`proto_savetheworld_muro`), pelo mesmo motivo
  que a retenção tem a dela — o prestígio apaga o `S`. **Medido no teste:** apago o
  `proto_savetheworld` inteiro e o muro continua lá com as mesmas entradas; um registro
  editado à mão (`[{"nome":"OK"},{"lixo":1},7,null]`) é **reparado para 1 linha** em vez de
  derrubar o jogo; `"{not an array}"` vira lista vazia; e depois de 60 tochas ele guarda
  **30** (o `MURO_MAX`), começando na de número 31, então não cresce sem limite.

  **(3) Seis capítulos por corrida.** Limiares são **frações** de `CFG.metaPrestigio`
  (0 / 4% / 16% / 40% / 76% / 100%), calculadas na hora — o teste rejeita qualquer `frac`
  fora de [0,1] e confere que o cartão **não** vira a 4% menos um ponto e **vira** exatamente
  em 4%. O título nunca muda; a voz embaixo é escolhida por `min(S.transicoes, 2)` —
  **medido:** mesma corrida, capítulo II, corrida 1 ouve `MARA — "I started one too."` e a
  corrida 3 ouve `SAFI — "Nobody asked permission this time."`. `S.capVisto` é o único
  campo novo do save e é zerado no `transicionar()`.

  **O que quebrou no caminho, e o que o teste passou a cobrir.** (a) A tarja de volta era
  gateada em `S.geradores > 0`: quem passava a tocha e fechava o jogo voltava para uma tela
  **muda** — exatamente a pessoa que mais interessa. A saudação agora dispara sozinha, e o
  teste semeia um save com **zero projetos** e 12h de ausência e exige que ela apareça sem
  a linha de ganho. (b) O cartão de capítulo nasceu com a mesma borda **dourada** da tarja
  REAL DATA, ou seja, ficção com cara de dado com fonte; virou roxa. (c) A regra dura do
  `LORE.md` — **nenhum dígito em texto de ficção** — virou asserção: **99 strings autoradas
  conferidas, 0 com dígito**. Os números do epílogo são interpolados da corrida na hora de
  renderizar; nenhum está escrito na seção de ficção.

  **Da abertura só entrou o nome** (o dono não aprovou a reescrita da intro): uma frase, no
  parágrafo que já existia — a heroína é **NIA** e a Gran Odete a chamou de *a spark* como
  reclamação.

  **Exposto de propósito para a agente de estética, para o muro existir no cenário e não só
  numa folha:** `MURO` (array de `{n, nome, prox, proj, cauda, estilo}`), `muroNomes()`,
  `muroTotal()`, `MURO_MAX` e `tintaMuro(nome, n)` — `estilo` é um slot de tinta 0–5 estável
  por entrada, gravado uma vez, para o mesmo nome sair sempre com a mesma cor sem que
  ninguém precise guardar cor nenhuma.

  **Medido no fim:** smoke verde com **28 asserções novas**, FPS 61–62 (era 61), `sim.js`
  idêntico. **Próximo passo: a curva do dia 2 continua pendente — e agora tem um instrumento
  melhor para lê-la, porque o muro é uma coleção incompleta com contagem visível, que é
  exatamente a aposta de retenção do `LORE.md` §A.5. Dúvida honesta: o cartão de capítulo
  I dispara em toda abertura de corrida, inclusive quando a pessoa só recarregou a página —
  não sei ainda se isso vira ritual ou ruído.**

- **2026-08-02 · o ritmo virou clima, o tambor entrou na família e a barra de baixo virou
  uma coluna só.** Quatro pedidos do dono, nesta ordem de valor.

  **(1) O cenário não mudava nada entre GO FAST e GO STEADY.** Palavras dele: *"a troca de
  plantinha pro fogo tem que ser mais impactante… o cenário não muda nada. Um é melhor e
  outro é ruim."* Ele estava certo do jeito mais forte possível: os dois ritmos desenhavam
  quadros **pixel a pixel idênticos**, então a única decisão que este protótipo existe para
  medir não tinha consequência visível. Agora é **clima, não correção de cor** — o ar na
  frente de um mundo forçado é grosso, quente e cheio de brasa; o ar na frente de um mundo
  cuidado é limpo e cheio de bicho vivo. Sai tudo de um `ritmoV` amortecido (0 = steady,
  1 = fast, ~1,1s para atravessar, **quantizado em oitavos antes de tocar qualquer chave de
  cache**): o céu assa com névoa quente empoçando no horizonte (8% no zênite, 42% na linha
  do céu) e o sol embaça atrás de uma coroa laranja inchada; **cada entrada da paleta recebe
  névoa na proporção da distância que ela já carrega** — 6% no chão dos pés até ~38% na
  serra —, que é engrossamento de perspectiva aérea e é por isso que a separação por valor
  entre os planos vizinhos (a arquitetura inteira) sobrevive em todo t; o chão quase não se
  move (12% → 3%), porque ele é a âncora; a faixa separadora **apaga em vez de deslocar**;
  a fumaça deixou de esperar o time cansar (o `smog` antigo só respondia ao cansaço, que
  atrasa a decisão em minutos) e ganhou uma parcela própria do ritmo, mais um banco baixo
  deslizando ao contrário rente ao horizonte; o GO FAST levanta brasa da estrada e derruba
  cinza quente, o GO STEADY dobra folhas e motes, põe cinco pássaros no ar em vez de dois e
  baixa o limiar em que eles aparecem, e guarda as borboletas (que não saem por cima de uma
  estrada que você está queimando); e **a virada em si** joga uma rajada atravessando o
  quadro na cor do que você escolheu, pelo campo de partículas — ou seja, acontece *dentro*
  do mundo e atrás do herói, não no vidro na frente dele.
  **Medido, e é a medida que importa aqui: o arco doente→curado continua dominante.** Cor
  média do quadro a 76% de saúde: steady `(102,9 · 140,8 · 132,5)` contra fast
  `(119,8 · 142,9 · 123,7)` — **19,2 de distância RGB**, enquanto o arco doente→curado move
  o mesmo quadro muito mais que isso. Conferido nos prints: os dois ritmos a 6% ainda leem
  doente, os dois a 95% ainda leem curado. As brasas são **ocre apagado de propósito, não
  laranja de fogo**: a regra mais dura da direção é que num quadro doente a varinha é a
  única coisa quente e saturada da tela, e uma estrada de brasa acesa tirava isso dela.
  **Custo medido:** `drawScene` **1,14 ms/quadro** (orçamento 16,7); reassar paleta + céu +
  chão num passo de ritmo custa **0,70 ms** e há no máximo oito passos por troca; **FPS 61**.
  Pior quadro trocando de modo a cada 320 ms: **20,5 ms — contra 20,6 ms no commit anterior
  à camada de clima**, ou seja, o pico é o manipulador de troca que já existia e não as
  reassadas.
  **Quebrou no caminho, e foi feio:** enfiar o ritmo na chave de cache do `pal()` quebrou o
  `hv = key / 96`, que estava **recuperando a saúde do mundo de dentro da chave** — o mundo
  saiu ciano e magenta com canais acima de 255. Passo de saúde e passo de ritmo são termos
  separados agora. Só o print pegou; nenhum teste falhou.

  **(2) O tambor tóxico não era da mesma família.** Renderizei os três lado a lado
  ampliados e a resposta ficou óbvia: fumaça e saco de dinheiro são sólidos arredondados
  cuja **face inteira** é uma rampa de seis tons de uma borda esquerda escura até uma
  direita iluminada, e o tambor era um **retângulo de 90°** com UM verde chapado dentro —
  um pixel escuro à esquerda, um claro à direita, e uma parede entre eles. E era o **menor**
  dos três (16×20 contra 18×16 e 18×13) sendo a coisa mais pesada da rua, com 5 golpes.
  Mesma construção agora: silhueta chanfrada, contorno escuro sem interrupção, a mesma rampa
  lateral no corpo, olhos 2×2 e barra escura de boca recortados dela. A identidade fica onde
  nomeia o objeto — dois arcos de aço (agora sombreados na mesma rampa, com aresta superior
  iluminada, em vez de duas lajes chapadas), tampa iluminada, galão de risco. E **maior**:
  20×22, mais alto que qualquer irmão. **hp, spawn e hitbox intocados** — o teste de acerto
  lê `m.wx + 5`, nunca o sprite; só andaram o offset de desenho, a largura da sombra de
  contato e a fileira de pips (`VIDA_TOPO` 23 → 27).

  **(3) Os dois botões de cima em padrão quadrado — e metade disso era um bug shipado.**
  Palavras dele: *"os dois botões tão estranhos com essa planta e o botão do lado… podem
  ficar de forma vertical, na lateral, empilhado em cima do outro, e não nesse padrão
  quadrado."* Duas linhas abaixo da regra base de `button` havia um **rabo de comentário sem
  `/*` de abertura**, então o parser de CSS comia o seletor seguinte e derrubava
  `#modeQuick { flex: 1 1 auto; … }` inteiro — o leitor de ritmo, desenhado para ser a coisa
  **larga** do bloco justamente porque é a decisão que o protótipo mede, estava colapsando
  no conteúdo e virando um quadradinho com vão morto do lado. Corrigido, mas a forma que ele
  expôs era a reclamação de verdade. Então: os quatro controles secundários viraram **uma
  coluna vertical só** na lateral — guardar, ritmo, construir, construir — e a ação única
  ocupa a coluna inteira em altura cheia. **Sem tocar no markup**: os dois envelopes de
  linha e o par empilhado são `display: contents`, então os botões caem direto no grid do
  `#controls`. **Medido, 390×844:** bloco 122px → **135px**, e o `--hControles` acompanhou
  sozinho para 151 (folha de projetos em 729 contra o topo do bloco em 699); a ação foi de
  74px de altura para **219×135**.

  **(4) Botões mais bonitos, arredondados, com gradiente leve.** A armadilha é que raio +
  gradiente também é a receita do botão de app genérico; o que segura a linguagem de pôster
  é tudo o que ficou **duro**: contorno de tinta de 2px, sombra de deslocamento com **zero
  blur** (é sombra impressa, não fotográfica), o toque afunda em pixels inteiros e nada é
  translúcido. O que é novo é a modelagem **dentro** da forma: rampa vertical de três paradas
  com a quebra acima do meio no lugar de duas chapadas, e um brilho diagonal a 158° morrendo
  aos 62% — **a mesma direção de sol (em cima e à direita) que ilumina os sprites**, então o
  chrome e o mundo passaram a concordar sobre onde está a luz. Raios: botões 9, a ação 12,
  folhas 12, chips e cards 7–8, intro 14 — a coisa mais redonda da tela é a coisa que se
  aperta. **O ouro continua só na ação única.**

  **Dúvida nova, e é de calibragem:** a névoa do GO FAST está amarrada só ao `S.modo`, não a
  quanto o GO FAST está *custando*. O `eficiencia()` já entra pela fumaça antiga, mas a
  parcela do ritmo é constante — um GO FAST de dez segundos com o time inteiro parece igual
  a um GO FAST de dez minutos com o time a 5%. Provavelmente devia escalar, e isso é medível.
  **Próximo passo: a curva do dia 2 continua pendente desde três sessões, e o CLAUDE.md diz
  que três sessões sem mover a pergunta dos três dias obrigam a voltar para a lente *Medir*.**

## Would cut with one more day

The REAL DATA rotation (keep one fixed) and the snow caps. ~~The `confirm()` on the
torch~~ — done: PASS THE TORCH? is now a sheet like the others, and unlike a browser
dialog it can show what you keep beside what you hand on.
