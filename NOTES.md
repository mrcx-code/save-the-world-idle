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


- **2026-08-02 · visual — a cara nova inteira, a partir do art board aprovado.** O dono
  mandou esquecer o layout de hoje e seguir cem por cento o board: personagem, cetro,
  cenário e UI. Mesma funcionalidade, cara nova — nenhuma fórmula, nenhum `CFG`, nenhum
  campo do `S`, nenhum número da economia foi tocado; o `smoke.js` ficou verde em todos os
  cinco incrementos. **FPS medido: 61 no começo e 61 no fim**, incluindo o campo de
  paralelepípedos e a moldura, que são desenhados linha a linha todo frame.

  **(1) A paleta, amostrada do próprio board.** Rodei um script que lê os pixels da tira
  PALETA e saí com as seis famílias em hex: TERRA `#512d0c #804411 #9d561c #b9732c`,
  FOLHAS `#3e4721 #525d2a #767f34 #979a46`, ÁGUA `#54827d #71a39c #dad8c0`, CÉU
  `#567c8f #87a7ab`, LUZ `#fde79d #e3b970 #a88148 #5c421f`, ACENTO
  `#22190d #482f19 #5c3b1f #da7a29 #f3a03d`. Todo o mundo foi reautorado dentro delas.
  A mudança estrutural: **a ponta doente da `PALETA` deixou de ser escrita à mão**. Eram 40
  pares independentes; agora só a ponta sã é autorada e `desbotar()` deriva a doente
  guardando e **levantando** o valor e derrubando a croma para uma memória do ocre quente
  do board — uma regra só, aplicada igual em toda parte. O chão virou pedra quente (TERRA e
  LUZ) e não mais grama. O chrome parou de falar azul-marinho: creme sobre verde-oliva
  profundo, dourado guardado para a barra e para o único botão que importa.

  **(2) O menino e o BASTÃO — CETRO DA VIDA.** Herói trocado, não ajustado: pele escura,
  coroa grande de cabelo cacheado com folhas e florzinhas laranja dentro, poncho creme
  bordado caindo num pano só pelo ombro de trás, calça verde franjada e sandálias. A
  silhueta é **larga na cabeça e estreita no tornozelo de propósito** — o cabelo é a
  leitura a 22 px, e foi por isso que o primeiro desenho falhou: rosto grande demais e
  cabelo fino demais, virou uma bola marrom. Diminuí o rosto para 6 px de largura e o
  cabelo passou a ocupar 17. O cetro é o objeto que o board dá uma página inteira: galho
  trabalhado, cordão em espiral no cabo inteiro, folhas brotando dele, roda de oito raios
  com miolo aceso, folhas saindo do aro, e cordas com conta e cristal pendurados que
  **balançam atrasadas em relação ao golpe**. A roda é assada por `(raio, aceso)`, então um
  golpe custa um `drawImage` e não trinta `fillRect`.

  **(3) A gramática de UI do board, mapeada nas funções que já existem.** O dono disse que
  esse painel é melhor que o atual, então o rodapé inteiro foi refeito na linguagem dele — e
  **nada foi inventado para preencher**: barra de topo com três contadores numa pílula só e
  uma engrenagem apartada (abre o painel do teste de três dias, a única superfície com cara
  de config que existe aqui); painel de progresso `STREET n%` com barra dourada e uma linha
  embaixo; quatro cartões ícone/nome/valor — o RITMO, os PROJETOS, os UPGRADES e a TOCHA, e
  o cartão acende quando tem algo para você; e um trilho escuro embaixo com a única ação do
  jogo. Cantos arredondados, gradiente suave, creme sobre oliva. Todos os ids que o JS lê
  continuam existindo; o `--hControles` continua sendo medido do bloco real e continua
  crescendo com ele (o teste confere).

  **(4) A rua.** Do CENÁRIOS tirei composição, silhueta e densidade de props, **não** o
  nível de detalhe — pintura à mão não cabe em `fillRect` a 60 FPS num arquivo só, e imitar
  daria lama. Paralelepípedos em oito fiadas em perspectiva, cada uma mais alta, mais larga
  e mais rápida que a de trás. **A primeira tentativa saiu listrada**: a junta estava a um
  tom da face da pedra. Só passou a ler como calçamento quando a junta virou um degrau de
  valor de verdade, pintada por baixo antes das pedras. Postes de luz inclinados com
  travessa, nó de cabo e catenária real entre postes consecutivos — está em todas as
  miniaturas do board. Casario de dois andares com telha capa-e-canal, beiral fundo, janela
  de veneziana, porta na calçada, jardineira, vaso e trepadeira. E uma **moldura**: folhagem
  escura fechando as duas bordas com recorte serrilhado, porque sem ela um side-scroller é
  céu vazio com uma tirinha de coisas embaixo. As larguras da moldura são **frações de W** —
  a primeira versão usava pixels e engoliu a tela inteira, já que o canvas é
  `innerWidth / 3` e W dá 130 num telefone, não 320. As turbinas eólicas brancas eram a
  coisa mais alta e mais fora do board no quadro: um projeto agora é um telhado que alguém
  construiu — GO STEADY ganha horta e caixa d'água, GO FAST ganha um gerador que fumega.
  Mesmos dois estados, mesma mecânica.

  **(5) LUZ & ATMOSFERA: as quatro horas.** MANHÃ, TARDE, PÓS-CHUVA e NOITE, ciclo de
  **240 s**, e **não é um véu por cima do quadro** — a direção não tem pós-processamento e
  uma camada chapada acinzenta tudo que toca. A hora entra **dentro da resolução da paleta**
  (`luzDoDia()`) e o céu ganha uma **rampa própria por hora** em vez de um tom por cima da
  rampa do meio-dia, porque pôr do sol não é meio-dia com laranja. O relógio não lê a
  economia: o arco doente→são já roda na saturação e pendurar um segundo significado nos
  mesmos pixels tornaria os dois ilegíveis. À noite o sol some, saem 26 estrelas, e janelas
  e luminárias acendem por escuridão e não só por saúde do mundo. Na hora do PÓS-CHUVA cada
  poste escorre um reflexo pálido sobre a pedra. A paleta e o céu são reassados em 96
  degraus de hora — algumas vezes por minuto, não por frame.

  **O que não alcancei, e por quê.** As miniaturas do CENÁRIOS são ilustrações pintadas com
  um nível de detalhe que desenho procedural não alcança a 60 FPS; peguei paleta, composição,
  silhueta, densidade e as quatro luzes, e parei antes de virar ruído. Os marcos distantes
  (parlamento, museu, ópera) continuam sendo os antigos — ficam na bruma, leem como "cidade
  ao longe", mas não são o CENTRO HISTÓRICO do board. E **o herói não recebe a luz da hora**:
  ele é desenhado com cores fixas e à noite fica aceso como se fosse meio-dia. Defensável
  (o personagem tem que ser legível sempre, e ele carrega o Cetro da Vida), mas é uma
  escolha que eu não tomei — foi orçamento.

  **Medido no fim:** smoke verde, FPS 61 (era 61), `sim.js` intocado. **Próximo passo: as
  folhas de NPCs, ITENS & RECURSOS e ÍCONES do board ainda estão quase todas por usar — os
  vizinhos do cenário e os drops continuam com o desenho antigo, e a cadeira de rodas e o
  cachorro do board não existem no jogo. Dúvida honesta: o ciclo de 240 s pode ser rápido
  demais para quem joga em sessões de dois minutos, e não medi isso — pode ser que a hora
  deva andar com o relógio real do aparelho em vez de com o tempo de sessão.**


- **2026-08-02 · visual — o ritmo virou clima outra vez, o tambor entrou na família, e o
  menino finalmente recebe a hora.** Quatro incrementos, todos com `node test/smoke.js`
  verde e **FPS 61 do começo ao fim**. Nada de `CFG`, `S`, fórmula ou economia foi tocado —
  **medido: `node test/sim.js` dá saída byte a byte idêntica à do merge anterior** (`diff`
  vazio nas 17 linhas da tabela).

  **(1) A camada de ritmo-como-clima, reconstruída — não colada de volta.** O merge tinha
  derrubado a versão original porque a paleta foi reescrita por baixo dela: hoje a ponta
  doente sai de `desbotar()` sobre uma `PALETA` só-sã e tudo passa pelo relógio de quatro
  horas. Então ela foi reautorada **dentro** dessa estrutura. A bruma é misturada nas cores
  do próprio mundo **antes** do `luzDoDia()`, de modo que uma noite queimando é fumaça
  iluminada pelos postes e não um filme laranja por cima do escuro; o céu é a exceção
  (já vem resolvido na rampa da hora), então ele usa `hazeLuz()`, com um quarto do ocre cru
  segurado dentro, porque cidade sob fumaça brilha quente das próprias luzes. Cada entrada
  da paleta toma bruma **na proporção da distância que já carrega** (6% no pé, ~38% na
  serra), o chão quase não se move (12% → 3%), a faixa do horizonte escurece em vez de
  mudar, o sol incha numa corona laranja, a fumaça ganha uma parcela que não espera o time
  cansar, e entra um banco baixo correndo ao contrário na linha do horizonte. GO FAST levanta
  cinzas ocres foscas da rua (nunca laranja de fogo: em quadro doente o Cetro é a única coisa
  quente e saturada da tela); GO STEADY dobra folhas e motes, põe cinco pássaros no lugar de
  dois e mantém as borboletas. A virada joga uma rajada pelo campo de partículas — no mundo
  e atrás do herói, não no vidro à frente dele.

  **A fraqueza conhecida da versão original foi o que eu vim consertar.** Ela lia só
  `S.modo`, então dez segundos de GO FAST ficavam idênticos a dez minutos. O peso da bruma
  agora é `ritmoV × (0,34 + 0,66 × ritmoCusto)`, onde `ritmoCusto` é o quanto a escolha está
  custando, lido de `eficiencia()` (só leitura). **Medido**, cor média do quadro inteiro a
  76% de saúde do mundo: time descansado, steady (112,4 · 127,9 · 114,9) contra fast
  (118,2 · 129,3 · 112,9) = **6,4 rgb** — dá pra ver no segundo em que você troca; time
  gasto, o mesmo par = **15,8 rgb**. E o arco continua mandando: doente 6% contra são 96% =
  **47,1 rgb** em steady e **43,1 rgb** sob bruma cheia, ou seja o arco vale ~3× o ritmo, e
  os dois extremos continuam lendo certo (doente em GO FAST lê doente; são em GO FAST lê
  são). À noite a camada é mais discreta por construção, **5,9 rgb**, que é o que uma luz
  que já foi embora deve fazer com ela.

  **(2) O tambor tóxico entrou na família.** Era o único retângulo de 90° entre três sólidos
  arredondados, tinha **um** verde chapado onde os irmãos têm rampa de seis tons, e era o
  **menor** dos três sendo o mais pesado. Refeito na mesma construção — silhueta chanfrada,
  contorno escuro contínuo, a mesma rampa da esquerda escura para a direita acesa, olhos 2×2
  e a barra da boca recortados nela — e **maior: 20×22**, mais alto que qualquer irmão. A
  identidade dele fica onde nomeia o objeto: dois aros de aço sombreados na mesma rampa,
  tampa acesa e a divisa de perigo, único lugar onde o amarelo ácido pode sentar. Reconstruído
  na paleta de hoje, não colado: a rampa do corpo foi puxada meio caminho do verde de pôster
  antigo para as FOLHAS do board (`#26401a` … `#bcd47e`). `hp`, spawn e hitbox intocados — o
  teste de acerto lê `m.wx + 5`, nunca o sprite. Só a tinta mudou: offset, largura da sombra
  (18 → 20) e `VIDA_TOPO` (23 → 27).

  **(3) O menino recebe a hora.** Ele era a única coisa do quadro desenhada em cor fixa —
  à meia-noite ficava aceso como se fosse meio-dia. Agora passa por `luzPersonagem()`, com
  **dose diferente da do mundo**, porque duas coisas tinham de sobreviver. Legibilidade a
  tamanho de celular: o escurecimento dele tem **piso** (um terço do caminho de volta ao
  cheio) e a tinta da hora chega a 80%, então a noite move muito o matiz e pouco o valor —
  ele fica frio e quieto, nunca vira silhueta. E o Cetro: a madeira toma dose ainda mais
  suave (piso passado da metade, tinta a 45%) e o miolo aceso, o cristal e tudo que o `luz()`
  desenha **não tomam a hora**. **Medido**, luma do tom aceso do poncho nas quatro horas:
  **232,6 / 214,3 / 203,5 / 123,5** contra **229,6 fixo** antes. À NOITE isso o põe **72 de
  luma abaixo** do miolo do Cetro em repouso (195,8), 90 abaixo do cristal (213,9) e 126
  abaixo do miolo enquanto ele conjura (250) — antes o poncho **ganhava** do miolo em
  repouso por 34, e a coisa mais brilhante de uma rua noturna era a camisa dele. Ele ainda
  fica ~61 de luma acima da média do próprio quadro noturno (62), que é o que segura a
  silhueta. Herói, `CETRO` e a assadura da roda são resolvidos em 24 degraus do dia.

  **(4) Os marcos distantes.** Eram a última coisa falando o vocabulário pré-board:
  parlamento modernista de cúpula-e-disco, museu pendurado em dois pórticos vermelhos, cúpula
  de concerto, tudo na ardósia fria do skyline. Primeiro a paleta (`marcoC/L/E/R` saíram do
  azul-ardósia para pedra caiada, guarnição quase branca, marrom quente nos vãos e telha
  TERRA, mais um tom de telha acesa), depois os três: **a MATRIZ** (nave entre duas torres
  sineiras, janelas e porta em arco, telhado de telha, cordão, câmara do sino, coruchéu
  piramidal e cruz em cada torre, e um relógio numa delas quando o mundo já está são o
  bastante para alguém ter dado corda), **o MERCADO** (bloco colonial sobre arcada de cinco
  arcos, janelas de veneziana em cima, telhado tacaniço, frontão com relógio) e **o TEATRO**
  (colunata sob frontão, com cúpula de telha e lanternim atrás). Dois auxiliares fazem o
  trabalho: `arco()` — todo vão daquela cidade tem cabeça em meia-volta, e buraco quadrado
  lê como prédio moderno — e `telhado()`. O maciço e o elevador do penhasco ficaram como
  estavam: aqueles dois já eram do lugar. A `cupula()` virou código morto e saiu.

  **Peguei no ato, e refiz:** a primeira versão do mercado e do teatro pôs a arcada e a
  colunata nos quinze pixels de baixo, que é exatamente a faixa que a linha de árvores come
  naquela profundidade — os dois liam como telhado flutuando no nada. Os dois foram
  reempilhados para cima no plano do quadro.

  **Medido no fim:** smoke verde, **FPS 61**, `sim.js` idêntico. **Próximo passo: as folhas
  de NPCs, ITENS & RECURSOS e ÍCONES do board continuam quase todas por usar — os vizinhos e
  os drops seguem com o desenho antigo, e a cadeira de rodas e o cachorro do board não existem
  no jogo. Dúvida honesta: amarrei a bruma a `eficiencia()`, que é a mesma quantidade que já
  move o `smog` — não medi se as duas juntas fazem o cansaço pesar visualmente duas vezes e
  roubar leitura do arco doente→são num quadro já sujo.**

- **2026-08-02 · visual — a rua ganhou gente, e as folhas de ITENS, ÍCONES e DECORAÇÕES
  saíram do board para dentro do jogo.** Quatro incrementos, cada um com `node test/smoke.js`
  verde. **Nada de `CFG`, `S`, fórmula ou economia foi tocado — medido: `node test/sim.js`
  dá saída byte a byte idêntica nos quatro commits** (`diff` vazio, quatro vezes).

  **(1) NPCS — PESSOAS DA RUA.** O jogo tinha **uma** figurinha genérica de 5×11 em quatro
  cores de camisa arbitrárias, na paleta pré-board, mais uma segunda feita de três retângulos
  esperando na cozinha. Agora é o elenco do board: **cadeirante, mulher de avental, senhor de
  chapéu, criança, avó, homem de boné e cachorro**. Construção igual à do herói e dos
  monstros — contorno escuro em toda a volta, uma direção de luz só (sol em cima e à direita,
  então a borda acesa é sempre a da direita) e cores só das famílias do board. **Medido em
  células de sprite:** o vizinho antigo cabia em 7×11 = 77 células com 4 cores; os novos são
  11×16 = 176 (adultos), 15×14 = 210 (a cadeira de rodas), 11×13 = 143 (a criança) e 13×8 =
  104 (o cachorro), numa paleta de **22 cores**. Eles **tomam a hora** por `luzPersonagem`, mas
  na dose do mundo (piso 0,06–0,12) e não na do herói (piso 0,34): ele é a leitura do quadro e
  é segurado; um vizinho tem de descer junto com a rua. Resolvidos nos mesmos 24 degraus do
  dia, então um quadro é um `drawImage` por pessoa.
  **São cenário por construção, não por promessa:** função pura do índice do segmento e da
  saúde do mundo, igual a uma árvore. Sem entidade, sem estado, sem hitbox, nada tocável,
  nada que encoste na economia. Ficam **fora da pista**, não têm pips de vida e não usam os
  tiques vermelhos que significam "esse aí é para bater" — um vizinho não pode ser confundido
  com um problema. **Densidade medida** sobre 20.000 segmentos, com a rua sã: **3,9 pessoas,
  1,7 decorações e 0,4 varais por tela** (a tela tem 160 px de mundo = 3,33 segmentos).
  Aparecem a partir de `h > 0,55`, então rua doente continua rua vazia — e é essa a leitura
  que os prints entregam: doente tem os bancos e as jardineiras, e não tem ninguém.

  **(2) ITENS & RECURSOS e ÍCONES.** Os três drops eram um retângulo arredondado de 8×7 em
  três tons, distinguidos só pela cor. Viraram três dos doze do board, escolhidos porque já
  significam o que o jogo já diz na hora de recolher — **nenhum recurso novo foi inventado
  para justificar um desenho**: fumaça limpa deixa **FLOR** (o float já lê CLEAR!), o tambor
  deixa **ÁGUA** (CLEAN!) e o saco de dinheiro deixa **REFEIÇÃO** (SHARED!). Nos ícones,
  UPGRADES era uma seta para cima — "o número sobe", a única coisa que a pessoa já vê — e
  virou a **FERRAMENTA** do board, porque o primeiro upgrade do jogo é literalmente *better
  tools for all*; e TOCHA virou **LANTERNA**, que é o objeto que o board desenha para "o que
  você carrega e passa adiante". A panela da chamada virou **ARGILA**: era o último objeto
  pré-board da camada de mundo, um caldeirão violeta com tampa lilás. **Os tiques vermelhos
  embaixo do monstro ficaram como estavam** — aquilo é sinal de jogo, não decoração, e não
  vou enfraquecê-lo por arrumação de paleta.

  **(3) DECORAÇÕES.** Banco de ripas sobre ferro escuro, vaso de barro com copa assada,
  jardineira de madeira com canteiro e uma flor, cadeira que alguém deixou na calçada, varal
  com roupa, e o poste do board no lugar do mastro solar azul-ardósia. Compostas, não
  ladrilhadas: **no máximo uma por segmento**, o *se* vem de um hash e o *onde dentro do
  segmento* vem de outro — prop no mesmo x em todo segmento é cerca, não rua. O varal é a
  exceção posicionada e não sorteada: pertence a uma casa, então sai de uma, e só sobe com
  `h > 0,35` porque ninguém estende roupa no pior momento. A corda faz catenária e cada peça
  balança um pixel na sua própria fase. A barraca da cozinha veio junto para a paleta do
  board (toldo creme-e-terracota no lugar de creme-e-vermelho-alarme, balcão e mesa em
  madeira, panela em barro, bancos de navy para madeira) e a roda dela foi espaçada: o
  cadeirante e a mulher de avental estavam a três pixels um do outro, desenhados um dentro do
  outro.

  **(4) TILES & TERRENOS, no único encontro que dá para ver.** O plano do chão tem 30 px de
  mundo e a tarja REAL DATA cobre quase tudo: **o que sobra visível são os 6 primeiros
  pixels**, a faixa colada nos prédios. Então é ali que a folha de tiles ganha lugar — onde
  há prédio (casa ou cozinha) aquela faixa é **piso de ladrilho**, e no resto o
  paralelepípedo continua subindo até a parede. O ladrilho anda com o segmento, não com as
  fiadas, porque é da casa e não da rua. As pedras com musgo entraram junto: eram a última
  coisa azul-ardósia em pé no chão, uma cor que o board não tem.

  **O que os prints pegaram, e eu refiz — duas vezes.** (a) O primeiro corte dos NPCs dava
  **sete linhas de cabelo e crânio** num corpo de dezesseis e eles liam como bichinhos, não
  como gente; a cabeça caiu para seis linhas e o tronco ficou com os pixels. A roda da cadeira
  começou como um anel claro que lia como uma **tigela** onde ele estava sentado — hoje é
  metal cinza com o lado direito aceso, carimbada **na frente do colo** (roda escondida atrás
  de figura sentada é gente sentada no chão) e **atrás do peito**, que é onde uma roda de
  verdade fica. (b) O print da NOITE mostrou um **banco brilhando marrom-quente numa rua
  escura**: as decorações estavam todas em hexadecimal cravado, que não sabe que horas são.
  Passaram todas pela hora, nos mesmos 24 degraus. A exceção é o vidro do poste e o brilho
  dele — lâmpada é fonte de luz, e quanto mais escura a rua em volta, mais da luz do quadro
  ela deve ter (mesma regra que o Cetro já segue).

  **Medido no fim:** smoke verde nos quatro incrementos, **FPS 61 do começo ao fim**, e o
  `drawScene` foi de **2,528 ms para 2,604 ms** por quadro de MANHÃ (+3,0%) e de **2,256 para
  2,373 ms** à NOITE (+5,2%), medidos na mesma máquina e no mesmo procedimento (300 quadros
  com o mundo rolando, depois de assar) — ~15% do orçamento de 16,7 ms.
  **Próximo passo: as casas, as árvores e a barraca da cozinha continuam em hexadecimal
  cravado e continuam acesas à meia-noite — hoje as decorações, as pedras, os NPCs e o herói
  tomam a hora, e os prédios não, o que deixa a rua com dois regimes de luz no mesmo quadro.
  Dúvida honesta: subi a densidade para 3,9 pessoas por tela e julguei por print, não por
  medida de leitura; não sei dizer se num celular pequeno, com três monstros na fila e o
  campo de partículas cheio, o herói continua sendo a primeira coisa que o olho acha.**

- **2026-08-03 · visual — um regime de luz só, e a densidade finalmente medida em vez de
  julgada por print.** Três incrementos, cada um com `node test/smoke.js` verde. **FPS 61 do
  começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado — **medido: `node
  test/sim.js` dá saída byte a byte idêntica nos três commits** (`diff` vazio, três vezes).

  **(1) O bug que a onda passada deixou anotado: a rua tinha duas iluminações no mesmo
  quadro.** As decorações, as pedras, os vizinhos e o menino tomavam a hora; as casas, as
  árvores, a barraca da cozinha e as bandeirinhas não, porque estavam em hexadecimal cravado
  — e hexadecimal cravado não sabe que horas são. Varri o mundo inteiro por um par de
  funções novas, `wc(hex)` e `wp(nome, paleta)`, na **mesma dose do mundo** que as decorações
  já usam (piso 0,06, tinta cheia), resolvidas nos mesmos 24 degraus do dia. Entraram: casas
  (parede, telha, cumeeira, porta, veneziana, peitoril, jardineira, trepadeira), casca e copa
  das árvores, o ipê e as pétalas que ele solta, vitórias-régias, a barraca e o toldo listrado,
  as bandeirinhas e o cordão, a mesa, os telhados-projeto (horta e gerador), os postes de
  cabo, o guindaste e a antena da linha do horizonte, as florzinhas da beira, os brotos e
  **as partículas de clima ambiente** (cinza, cinzas quentes, folhas e pétalas ao vento —
  o quadro noturno tinha confete verde e rosa caindo dentro dele).

  **A regra é uma só, e é a que as luminárias já seguiam: ou a coisa é FONTE, ou toma a
  hora.** Ficaram de fora, e só elas: janela acesa, vidro da luminária e o derrame dela, o
  reflexo molhado da PÓS-CHUVA, o pisca-pisca da antena, as faíscas de combate e o Cetro.

  **Medido**, faixa do mundo com a rua sã, **antes → depois**: à NOITE o percentil 99,5 de
  luma caiu de **209,3 para 123,6** e a fatia de pixels acima de luma 150 (ou seja, com cara
  de dia) caiu de **1,93% para 0,38%** — e os 0,38% que sobraram são luminária, janela acesa
  e Cetro, que é exatamente o ponto. A média foi de 69,4 para 64,5. **E o dia não foi
  acinzentado junto:** MANHÃ média 143,7 → 144,4 e percentil 99,5 246,5 dos dois lados.

  **(2) Os três monstros eram o mesmo bug de cara nova, e eram o pior caso.** Eram as últimas
  figuras do mundo em hexadecimal cravado, e sendo as maiores formas saturadas da rua eram
  também a coisa mais acesa à meia-noite. Passaram por `luzPersonagem` com **piso 0,26 contra
  o 0,34 do menino** — margem de propósito: ele é a leitura do quadro e tem de ficar acima
  das coisas em que bate. O flash branco do acerto e os pips de vida **não** passam por ali:
  aquilo é sinal de jogo, não tinta.

  **(3) A densidade, medida.** Montei o pior caso que a onda passada não soube julgar —
  rua sã, três monstros na fila, campo de partículas no teto de 190, decorações e vizinhos
  na densidade máxima — em `test/medir.js`. **Método:** todo bloco do tamanho do herói
  (22×34 px de mundo) numa grade de 5 px sobre a faixa do mundo recebe uma nota de contraste
  local = **desvio absoluto médio dos pixels do bloco em relação à luma média do anel em
  volta**. A diferença das médias foi a primeira tentativa e **não mede nada**: um herói
  metade poncho creme e metade calça escura tem média igual à do próprio fundo e tira **1,9**.
  A moldura de folhagem é contada à parte, porque proscênio é arquitetura e não prop
  disputando o olho.

  **Antes → depois:** à NOITE o herói tira **20,7** e o rival mais forte caiu de **52,4 para
  32,9** — razão herói/rival de **0,40 para 0,63**; posição entre 873 blocos, 168 → 143 (fora
  da moldura, 104 → 96). À MANHÃ o herói foi de 52,8 para 53,1 contra rival 62,1, razão 0,85
  → 0,86, e fora da moldura 34 → 27 de 519.

  **A resposta honesta é que ele ainda não é o primeiro.** À frente dele estão a silhueta do
  proscênio contra o céu e o monstro mais próximo — e um monstro que você deve acertar lendo
  um pouco mais alto que ele não é obviamente o quadro errado. O que estava errado, e não
  está mais, é que à noite ele perdia por fator 2,5.

  **Tentei e desfiz:** subir o piso noturno do próprio menino de 0,34 para 0,46. Comprou 2,5
  pontos (20,8 → 22,3) e custou a escolha que a onda anterior tomou medindo — luma do poncho
  123,6 → 134,5, ele lendo menos como alguém de pé no escuro. Não vale por 2,5 pontos.

  **(4) A maior distância que sobrava para o board.** Pondo os dois lado a lado: o painel
  LUZ & ATMOSFERA / NOITE do board **não é uma rua escura com pontinhos de luz**, é uma rua
  feita de **poças** — cada luminária deita uma elipse quente sobre a pedra e o escuro é o
  que sobra entre elas. `pocaLuz()` faz isso, das luminárias de poste e do lampião da rua.
  **Não acrescenta objeto nenhum** — é luz sobre chão que já existe, e é por isso que não
  deixa um quadro já cheio mais cheio. Só existe em proporção a `escuridao()`, então MANHÃ e
  TARDE saem idênticas ao pixel.

  **Peguei no print, não no código:** a primeira versão deitava a poça em 13 linhas descendo
  da linha do chão e a tarja REAL DATA comia tudo — o plano do chão tem 30 px de mundo e o
  que se vê são umas sete linhas abaixo da linha do chão. Refeita larga e rasa dentro dessa
  faixa, que é também o que uma poça de lampião parece num ângulo tão rasante. A força saiu
  do print também: 0,13 era invisível, 0,30 lavava os vizinhos, **0,22** é uma rua de pé
  dentro da luz. Custa ~0,5 ponto de legibilidade do herói (20,8 → 20,6 à NOITE, 53,1 → 52,2
  à MANHÃ), porque a poça também clareia o entorno dele.

  **Conferido em dois níveis de saúde e em quatro horas**, não só no quadro fácil: rua doente
  à NOITE fica cinza-malva desbotada e escura, com o Cetro como única coisa quente; rua doente
  à TARDE fica ocre e clara. O arco doente→são continua mandando e a hora continua sendo uma
  camada por cima dele.

  **Medido no fim:** smoke verde nos três incrementos, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: os pips brancos de vida em cima dos monstros são hoje a coisa mais clara
  da faixa do chão num quadro noturno — são sinal de jogo e por isso ficaram de fora da
  varredura, mas agora que os monstros escureceram eles ficaram desproporcionais e alguém
  precisa decidir se aquilo é leitura ou ruído. Dúvida honesta: `test/medir.js` mede contraste
  de luma e mais nada; o board separa doente de são pela CROMA, e um herói que é a única coisa
  saturada de um quadro pode estar lendo primeiro por um canal que a minha medida não olha —
  não sei se estou subestimando ele.**

- **2026-08-03 · visual — a medida ganhou croma, a medida ganhou vergonha, e o proscênio
  finalmente fechou por cima.** Três incrementos, cada um com `node test/smoke.js` verde.
  **FPS 61 do começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado —
  **medido: `node test/sim.js` dá saída byte a byte idêntica nos três commits** (`diff`
  vazio, três vezes).

  **(1) A dúvida da onda passada: a medida era cega para cor.** `medir.js` agora pontua cada
  bloco da grade por **três eixos** sobre o mesmo centro-entorno: **LUMA** (intacta, então
  todo número das ondas anteriores continua querendo dizer a mesma coisa), **CROMA** (a mesma
  ideia rodada só no plano `a*b*`, valor jogado fora — figura cinza em rua cinza tira zero
  por mais clara que seja) e **DE** (CIE76 nos três eixos). Mais uma leitura simples de C*
  médio, para a frase "ele é a única coisa saturada do quadro" virar fato ou mentira.

  **A resposta honesta é que a cor não o resgata, e à NOITE a frase é falsa.** Medido no
  pior caso: à MANHÃ o C* dele é **24,2 contra 16,6 do quadro** (razão 1,45) — ele é mesmo o
  mais saturado —, mas em *contraste* de croma ele cai para **182/873**, o pior dos três
  eixos, contra 100/873 na luma; quem ganha em croma é **o monstro mais próximo**, em
  (105,158). À NOITE o C* dele é **7,4 contra 9,9 do quadro** (razão **0,74**): ele é
  **menos** saturado que a rua ao redor, porque `luzPersonagem` o tinge 80% para o azul da
  hora. Aí a croma ajuda um pouco (65/873 contra 165/873 na luma) e o DE fica em 93/873,
  razão 0,78 contra 0,62 da luma. **Resumo: à noite a cor melhora a posição dele, de manhã
  não muda nada, e em nenhuma das duas ele é o primeiro. Não mexi na arte por causa disso** —
  a medida não pediu, e subir a saturação dele à noite desfaria a escolha que a onda 7 tomou
  medindo.

  **Dois bugs da bancada, achados no caminho, e os dois vinham envenenando todo antes/depois
  deste repositório.** (a) **`desenhar()` é o HUD, não o quadro** — a tela é pintada por
  `drawScene()` + `desenharMundo()` de dentro do laço rAF, então todo preparo daqui vinha
  medindo o quadro que o laço tinha deixado para trás: a tabela saía **uma hora atrasada** em
  relação ao rótulo. (b) O laço seguia andando com `worldX` e `animT` e **respawnava monstros
  dentro do controle sem monstros**. Hoje: `QUADRO()` explícito, rAF congelado, preparo e
  leitura dentro de um `evaluate` só, `worldX`/`animT`/campo de partículas fixados. A NOITE
  repete no dígito.

  **(2) Os pips desproporcionais.** Continuam **sem tomar a tinta da hora** — pip que fica
  azul à meia-noite entrou no mundo em que ele deveria estar por cima. Mas não podiam ignorar
  o *nível*: com os monstros no piso 0,26, o `#e8edf6` cru era a coisa mais clara do quadro.
  **Medido**, faixa do mundo à NOITE: dos **189 px acima de luma 200**, **108 eram o mostrador
  de vida**, com pico **237** — acima do miolo do Cetro (195,6) e do cristal (214,7), o que
  inverte a única regra que a onda da luz tinha fixado. Agora escurecem **só em valor**,
  neutros, com piso alto (0,67; o flash do acerto fica em 0,82, porque dois quadros de branco
  é a confirmação de que você acertou). **Antes → depois à NOITE: acima de 200, 108 px → 0;
  pico 237 → 159; e ainda põem 108 px acima de luma 150 num quadro cujo percentil 99,5 é
  111.** Inconfundível, sem ser o mais alto. MANHÃ intacta (241 → 223 px acima de 200).

  **(3) A maior distância que sobrava, medida em vez de julgada.** Parti o quadro do mundo em
  faixas e pontuei cada uma como pontuo os blocos: **CEU alto 38% do quadro a dE local 8,9 /
  2,8; CEU baixo 30% a 6,9 / 3,6; HORIZONTE 16% a 23,4 / 11,8; RUA 14% a 20,2 / 7,7** (MANHÃ
  / NOITE). **Dois terços da imagem a um terço da densidade de evento de todas as outras
  faixas** — e o bloco do proscênio dizia desde que foi escrito que fechava "as duas bordas
  **e os cantos de cima**" e nunca desenhou senão as duas colunas. Agora a copa vem por cima:
  mais funda nos cantos, afinando numa franja recortada no meio, de modo que a fresta de luz
  vira um **arco**, que é como todo painel de rua do board está composto. **Não acrescenta
  objeto nenhum** a um quadro já cheio — é a mesma massa, os mesmos dois verdes, a mesma
  borda acesa e o mesmo quase-zero de parallax das colunas de onde ela sai, e desbota com o
  mundo: rua doente ganha arco ocre e empoeirado, não verde.

  **Medido:** dE local do CEU alto **8,9 → 10,0** à MANHÃ e **2,8 → 3,1** à NOITE. A nota do
  próprio menino **não se move em nenhuma das duas horas** (48,4 / 20,2), e contra o que de
  fato disputa com ele — proscênio à parte, que agora quer dizer três lados, por uma regra de
  posição que teria excluído o bloco vencedor **antes** desta mudança também — a posição dele
  se segura: MANHÃ **52/519 → 49/485** na luma e **39/519 → 38/485** no dE; NOITE **76 → 76**,
  igual no dígito. O que ele perde é só contra a moldura: o bloco do topo do quadro, ao lado
  do sol, vai de **64,0 para 75,2**, então a razão dele contra a coisa mais alta de
  **qualquer** lugar cai de **0,76 para 0,64** à MANHÃ. Aquele bloco está 180 px acima da
  cabeça dele, no canto da imagem.

  **Tentei e desfiz, os dois medidos:** afinar a borda acesa da copa no vão do meio, na
  teoria de que o brilho é que criava o rival — comprou 0,01, que é ruído, e o desenho mais
  simples ficou. E copa **só nos cantos**, sem franja no meio — comprou 0,02 de razão, custou
  0,6 de céu autorado e quebrou o arco em dois borrões.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`, novo — os `cruz-*.png`
  não tinham script que os regerasse).

  **Medido no fim:** smoke verde nos três incrementos, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: a faixa CEU baixo continua sendo a mais vazia do quadro — 30% da imagem a
  dE local 6,9, e a copa não a alcança; é o vão entre a franja de folhagem e a linha do
  telhado, e no board é exatamente onde ficam as fachadas do meio-termo e a segunda fiada de
  telhados recuando para o ponto de fuga. Dúvida honesta: o jogo é side-scroller e não tem
  ponto de fuga, então não sei se uma segunda camada de telhados a 0,45× preenche aquilo ou
  só empilha mais silhueta numa faixa que já tem serra, cidade e marco disputando os mesmos
  40 px.**

- **2026-08-03 · visual — a pergunta em aberto respondida com número (e a resposta era
  "não"), e o céu ganhou o que faltava nele.** Três incrementos, cada um com
  `node test/smoke.js` verde. **FPS 61 do começo ao fim.** Nada de `CFG`, `S`, fórmula ou
  economia foi tocado — **medido: `node test/sim.js` dá saída byte a byte idêntica**
  (`diff` vazio, três vezes).

  **(0) A bancada aprendeu a dizer ONDE dentro de uma faixa está o buraco.** `CEU baixo`
  tem 55 px de altura e a dúvida sobre ela era se uma segunda fiada de telhados a
  preenchia. Média de faixa não responde isso: uma camada que só encosta na borda de baixo
  sobe a média e deixa o buraco intacto. `medir.js` agora parte `CEU baixo` em três.
  **Linha de base, MANHÃ: y86-107 dE 7,8 | y107-129 dE 3,6 | y129-150 dE 15,0.** NOITE:
  2,9 | 2,1 | 9,2. **O buraco é o terço do MEIO**, e o terço de baixo já era a coisa mais
  densa do quadro depois do horizonte.

  **(1) A dúvida da onda passada: a segunda fiada de telhados a 0,45×. Construída, medida
  e jogada fora.** Um renque de fachadas de 2–3 andares com telha, janelas que acendem com
  a saúde e caixa d'água, na paleta do morro, entre a mata longe e a mata do meio.
  **Medido:** ela pôs **100% da massa no terço de BAIXO** — 15,0 → **19,0** à MANHÃ e
  9,2 → 11,3 à NOITE, ou seja, empilhou silhueta exatamente onde já estão as duas serras,
  a cidade e o marco — e **0,0 no terço do meio**, que ficou em 3,6 **no dígito**. E cobrou
  do menino: fora da moldura, dE **38 → 53 de 485** à MANHÃ e **54 → 62** à NOITE; luma à
  NOITE 76 → 81. **Desfeita.** A intuição registrada na onda 9 estava certa e agora tem
  número: um side-scroller não tem ponto de fuga, então "recuar para o ponto de fuga" vira
  "descer na tela", e descer na tela é entrar na faixa cheia.

  **(2) O que o board de fato põe naquele vão são os FIOS.** Abri o painel RUA DO BAIRRO
  ampliado ao lado do quadro do jogo: os postes são a coisa mais alta da imagem por larga
  margem e os fios atravessam o céu aberto, não a linha do telhado. O jogo já tinha postes,
  mas paravam em **46–55 px**, o que punha toda travessa e todo vão de fio entre **y136 e
  y152** — dentro da faixa mais cheia do quadro e na altura da cabeça do menino. Agora
  **74–86**: travessa em y105–117, barriga do fio passando por y123–134.
  **Medido, o terço vazio y107-129: MANHÃ 3,6 → 13,5; NOITE 2,1 → 6,9.** `CEU baixo`
  inteira: **6,9 → 11,0** e **3,6 → 5,7**. E o terço de baixo, o cheio, **desce**:
  15,0 → 14,2 e 9,2 → 8,9 — os fios saíram de lá. **O menino lê MELHOR, não pior:** fora
  da moldura, MANHÃ luma **49 → 40** e dE **38 → 36**; NOITE luma **76 → 67** e dE
  **54 → 49** de 485. **Nenhum objeto novo entrou no quadro** — é o mesmo poste e o mesmo
  fio, mais altos. A lâmpada ficou onde sempre esteve (`base-42`), num braço a meio do
  mastro: lâmpada a 80 px do chão é holofote de pátio, não luminária de rua, e assim o
  derrame e a poça sobre a pedra não se mexeram.

  **(3) A maior distância que sobrou, e o motivo dela é contável.** Com `CEU baixo`
  resolvida, a faixa mais vazia passou a ser `CEU alto`: **38% do quadro a dE 10,0 / 3,1**.
  O motivo não é estético: os cúmulos ficam **um a cada 34 px de TELA**, então um quadro de
  130 px comporta **quatro**, e os quatro caem num só banco baixo. Tudo acima disso era
  degradê pelado. Os quatro painéis de LUZ & ATMOSFERA do board têm céu inteiro: cirros em
  bandas por cima dos cúmulos. Entrou um **segundo estrato**: riscos de 2–3 px, borda de
  cima acesa (o sol está acima deles), barriga sombreada, mais finos e mais apagados quanto
  mais baixo pendem, no **parallax mais lento do quadro (0,05, metade do cúmulo)** porque
  são a coisa mais distante que existe. Vivem entre y8 e 0,44·GROUND — **100 px acima da
  cabeça do menino**, então não disputam nada. **Medido: `CEU alto` 10,0 → 10,6 à MANHÃ e
  3,1 → 3,4 à NOITE.** É um movimento pequeno e está relatado como pequeno: a faixa tem
  83 px de altura e cirro fino sobre quase tudo não move média por bloco. **O menino não se
  move**: 40/485 na luma e 35/485 no dE à MANHÃ, 67 e 49 à NOITE.

  **Tentei e desfiz, medido:** os mesmos riscos com **+45% de alfa**. Comprou 0,3 de dE
  (10,6 → 10,9) e o print mostrou o preço — naquela força deixam de ser cirro e viram
  **barras brancas duras** deitadas no céu.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): rua doente ganha
  bandas cinza-pálidas, não brancas, e os fios desbotam com o mundo junto com o resto.

  **Medido no fim:** smoke verde nos três incrementos, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: `CEU alto` continua sendo a maior faixa e a menos autorada — 38% do
  quadro a dE 10,6, e o cirro só arranhou. Dúvida honesta: acho que a distância que sobra
  ali não se fecha com mais coisa no céu, e sim com o céu sendo MENOS do quadro. Nos
  painéis do board o céu é ~25% da imagem porque as fachadas sobem pelos dois lados até
  quase o topo; aqui o céu é 68% porque `GROUND = 0,68·H` e a rua é uma faixa fina no pé.
  Não sei medir "o enquadramento está errado" com a bancada que tenho, e mexer em `GROUND`
  encosta em colisão e em `HX`, o que é bem mais do que uma troca de tinta.**

- **2026-08-03 · visual — o enquadramento, que era a maior distância que sobrava, e a
  medida que finalmente enxerga enquadramento.** Quatro incrementos, cada um com
  `node test/smoke.js` verde. **FPS 61 do começo ao fim.** Nada de `CFG`, `S`, fórmula ou
  economia foi tocado — **medido: `node test/sim.js` dá saída byte a byte idêntica nos
  quatro commits** (`diff` vazio, quatro vezes).

  **(0) A bancada era cega para enquadramento, e a onda passada mediu na direção errada
  sem saber.** dE de faixa responde "quanto evento tem nesta tira"; não responde "o quadro
  está composto", porque **uma parede preenchendo o topo da imagem é massa chapada e massa
  chapada pontua perto de zero** — fechar o quadro ABAIXA a nota da faixa enquanto aproxima
  a imagem do board. Provado no primeiro incremento: engordei as colunas do proscênio em
  2,5× e `CEU alto` foi de **10,6 para 10,4**. A medida certa é outra e é contável: o passe
  de céu é assado num canvas só e pintado primeiro, e todo o resto do mundo é pintado por
  cima — então **um pixel que ainda carrega exatamente o que `skyCanvas` pôs ali é céu
  aberto e nada foi desenhado nele**. `medir.js` agora conta isso (`CEU ABERTO`), no canvas
  inteiro e **só na parte que a barra do HUD não cobre**, porque um quadro que fecha onde
  ninguém vê não fechou nada. **Linha de base: 39,0% do canvas, 41,4% do visível.** (O "68%"
  da onda passada era área de faixa, não céu aberto — nuvens, fios e postes já ocupavam
  muita coisa.)

  **(1) A rota: subir as paredes, não a linha do horizonte.** As duas foram consideradas e a
  escolha tem número. `GROUND` é lido por colisão, por `HX`, por toda âncora de chão, pela
  onda de choque, pela fila de monstros e pela coleta de drop — e, medido no próprio print,
  **o plano do chão já está quase todo debaixo da tarja REAL DATA**: sobram ~6 linhas
  visíveis abaixo da linha do chão. Subir o horizonte compra pixel escondido, não imagem.
  Então `GROUND` não se mexeu **um pixel** e o que subiu foi a massa das bordas.
  O *swell* do proscênio foi de `0,062·W` para `0,24·W` com queda mais íngreme (expoente
  1,5 → 2,2): **15,6 px → 38 px** de largura no alto do quadro e **8,5 px contra 8,2** na
  altura em que a fila de monstros para (`HX+26`, +20, +20 → sx 60/80/100), que é a única
  altura em que a rua deve alguma coisa à jogabilidade. Céu aberto visível **41,4% → 37,4%**.

  **(2) O proscênio ganhou a alvenaria que ele promete desde que foi escrito.** O comentário
  dizia "folhagem escura **e alvenaria escura** apertando as duas bordas" e só desenhou
  folha. Na largura velha dava para viver com isso; na nova, uma laje verde chapada com um
  terço do quadro não é parede, é buraco. Os **60% de fora** de cada coluna viraram fachada
  — linha de piso a cada dezessete fileiras, um vão de veneziana por andar virado para a
  rua, vidraça que acende pela mesma regra de fonte/superfície do resto do mundo — e os 40%
  de dentro continuam sendo a mesma folhagem, na frente dela. **Mesmo vão por fileira,
  partido em dois: nenhum objeto novo, nenhuma chamada de desenho nova.**

  **(3) O arco fechou no meio, onde ele estava pendurado atrás da barra do HUD.** A copa de
  cima tinha `dMeio = 0,030·W` — **quatro pixels** — e a barra superior cobre as primeiras
  **vinte e cinco** fileiras do canvas: no meio do quadro a copa não fechava nada que
  alguém pudesse ver. Com `0,16·W` e o recorte de folha quase triplicado, a franja fica
  entre 9 e 33 fileiras e o que aparece debaixo da barra é orla recortada, não corte reto.
  **Medido: céu aberto visível 37,4% → 34,9%, `CEU alto` aberto 44,1% → 32,4%.** E **o
  menino lê MELHOR por causa disso**, porque o bloco que ganhava dele era a coroa do sol no
  topo do quadro e agora tem folha em cima: MANHÃ razão de luma **0,65 → 0,79**, dE
  **0,78 → 0,81**, posição em dE fora da moldura **38/485 → 36/485**.

  **(4) Fechado o enquadramento, a maior distância medida virou o terço de CIMA de
  `CEU baixo`** — y86-107, dE **9,1** de dia e **3,6** à noite, e 61% daquela faixa ainda
  céu aberto. Toda árvore desta rua termina em `GROUND-45`, que é y147: **a linha de árvores
  inteira mora nas duas faixas que já eram as mais cheias**. O painel PRAÇA COMUNITÁRIA do
  board é construído em volta de **uma árvore enorme** cuja copa ocupa exatamente aquele
  pedaço da imagem, com os telhados e os fios passando por baixo. Então **uma árvore de rua
  em cada oito é aquela árvore**, na construção do cúmulo (união de cinco lóbulos resolvida
  a um topo e um fundo por coluna, contorno desenhado **uma vez** em volta da massa toda).
  **Medido: y86-107 dE 9,1 → 12,5 à MANHÃ e 3,6 → 5,2 à NOITE; `CEU baixo` 11,0 → 15,2;
  céu aberto em `CEU baixo` 61,1% → 50,1% e no visível 34,9% → 31,2%.**

  **E ela cobra do menino — o número está aqui e não escondido.** Fora da moldura, MANHÃ
  luma **41/485 → 52**, croma **92 → 168**, dE **36 → 46**; NOITE **67 → 80**, **48 → 64**,
  **49 → 58**. O quadro que a bancada congela põe a árvore **exatamente em cima da cabeça
  dele**, que é a pior colocação que existe; e diferente do renque de telhados que a onda 10
  desfez (dE 38 → 53 por **0,0** de ganho na faixa alvo), aqui a troca é real dos dois
  lados. As razões dele se seguram: dE **0,81 → 0,82** à MANHÃ.

  **Tentei e desfiz, os quatro medidos:** (a) `dMeio = 0,22·W` na franja — céu aberto
  **32,0% contra 34,9%**, melhor no papel, e o print recusou: naquela profundidade a língua
  do meio **engole o sol inteiro**, e a direção é CLEAR SKY. (b) A copa grande carimbando
  quatro vezes o `TREE_MAP` de 22×16 que já existe — **cada carimbo traz o próprio contorno
  escuro em toda a volta**, então quatro deles lado a lado são quatro pirulitos num pau, não
  uma copa. (c) Subir a árvore nove fileiras: terço alvo **12,7 → 12,2** e custo em dE
  **46 → 54**. (d) A copa na paleta clara das árvores: croma do menino **185/485**; a escura,
  que já estava no arquivo, devolve 17 posições por 0,2 de faixa.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): rua doente ganha
  moldura de alvenaria ocre empoeirada e não verde, a árvore grande **não nasce** com
  `h ≤ 0,5` (rua doente continua rua sem árvore alta), e à NOITE a copa é massa escura
  contra o céu com o Cetro seguindo a única coisa quente do quadro.

  **Medido no fim:** smoke verde nos quatro incrementos, **FPS 61**, `sim.js` idêntico.
  **Total do enquadramento: céu aberto no visível 41,4% → 31,2%, `CEU alto` 50,5% → 32,2%,
  `CEU baixo` 65,0% → 50,1% — sem mexer em `GROUND`, em `HX` nem em uma coordenada de
  jogo.** O board ainda está em ~25%.
  **Próximo passo: `CEU alto` continua a maior faixa e a de menor dE (10,6 / 3,8) mesmo com
  um terço a menos de céu aberto — o que sobra ali é gradiente entre a franja e o banco de
  cúmulos, e a resposta do board é a segunda fiada de fachadas subindo pelos lados até quase
  o topo, que é justamente o que o proscênio não pode fazer sem virar túnel. Dúvida honesta:
  a croma do menino piorou de 92 para 168 de 485 nesta onda e eu aceitei isso duas vezes
  seguidas (a franja e a copa) porque em cada uma o preço era pequeno; ninguém mediu o
  acumulado contra o que a onda 8 disse, que é que a croma já era o pior eixo dele. Se a
  próxima onda puser mais verde no quadro, mede isso primeiro.**

- **2026-08-03 · visual — a dívida da onda passada paga: a croma do menino, e o board medido
  em vez de sentido.** Quatro incrementos, cada um com `node test/smoke.js` verde. **FPS 61
  do começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado — **medido:
  `node test/sim.js` dá saída byte a byte idêntica nos quatro commits** (`diff` vazio,
  quatro vezes).

  **O placar, que é o que esta onda existe para mover.** Pior caso, fora da moldura, de 485:

  | | luma | croma | dE | C* dele | C* do quadro |
  |---|---|---|---|---|---|
  | MANHÃ antes | 52 | **168** | 46 | 23,0 | 16,5 (razão 1,39) |
  | MANHÃ depois | **49** | **83** | **33** | 23,4 | 15,8 (razão **1,48**) |
  | NOITE antes | 66 | 63 | 45 | 7,5 | 9,0 (razão **0,83**) |
  | NOITE depois | 76 | **27** | **30** | 8,7 | 9,0 (razão **0,96**) |

  **A croma dele voltou de 168 para 83 à MANHÃ e de 63 para 27 à NOITE**, e à NOITE ele
  deixou de ser **menos** saturado que a própria rua. **Céu aberto no visível ficou em 31,2%
  no dígito** — o enquadramento da onda 11 não foi desfeito em lugar nenhum.

  **(1) A hora não o esfriava, ela o achatava.** Tingir 80% na direção de **uma** cor não o
  move só em matiz: puxa todo pigmento que ele tem para o mesmo ponto do plano `a*b*`. Agora
  a mistura entrega matiz e valor exatamente como antes e a croma residual é **reexpandida em
  torno da luma dele**, que é um movimento de saturação puro — a luma Rec.709 do resultado
  não muda, então **o poncho continua em 123,6, no dígito**, e a escolha que a onda 7 tomou
  medindo fica intacta. **Medido: NOITE croma 63 → 32, dE 45 → 34, C* 7,5 → 8,8.** MANHÃ
  croma 168 → 157. **Custa um ponto de contraste de luma à NOITE (66 → 80 de 485) e eu não
  consigo explicar:** limitar o fator para nenhum canal estourar mudou o número em **0,0**,
  logo não é *clipping*, e o mesmo ponto se perdia a 0,65 e a 1,05.

  **(2) O board medido, e a impressão de quem roteou estava errada na média e certa na
  forma.** `test/board.js` é novo: recorta o painel **RUA DO BAIRRO** do board e põe ao lado
  do quadro do jogo, comparando **luma e C* médios do quadro inteiro**, que é o que uma
  tabela de faixas não consegue enxergar. **Quadro inteiro: board luma 90,1 / C* 19,5; o jogo
  à MANHÃ 130,5 / 15,6.** Somos **metade mais claros** que o board e **menos** saturados —
  "estamos materialmente mais escuros e pesados" é falso e está aqui o número. O que é
  verdade é a **forma**: do topo do quadro até a linha do chão, em quintos, o board faz
  **141 101 83 60 66** — mais claro em cima, recuando para a sombra — e nós fazíamos
  **116 140 145 138 112**, um U invertido com o quinto **mais escuro em cima**. Isso é uma
  **tampa**, e tampa é a única coisa que nenhum painel de rua do board tem.

  **Então a massa da copa de cima não perdeu um pixel de profundidade** (céu aberto tinha de
  ficar onde estava) **e ganhou luz**: a franja passa dos verdes das colunas nos cantos
  fundos para **BRILHO** no meio fino, o que **sobe o valor e ABAIXA a croma**, porque folha
  daquela espessura está segurando dia do outro lado. **Medido: quinto de cima 116 → 121, C*
  do quadro 16,5 → 16,3, céu aberto 31,2% no dígito**, e o menino melhora nos três eixos:
  luma 52 → 49, croma 157 → 149, dE 43 → 40.

  **(3) A árvore grande devolveu a saturação e ficou com a massa.** Desligá-la é a atribuição
  mais limpa do arquivo, e foi feita: ela compra **todo** o enquadramento da onda 11 (céu
  aberto visível 34,9% → 31,2%, `CEU baixo` 61,1% → 50,1%, y86-107 dE 9,1 → 12,5) **e cobra
  do menino croma 73 → 149, dE 29 → 40, luma 35 → 49 à MANHÃ**. Os dois se separam: quem
  disputa com ele **não é a MASSA da árvore** — massa chapada pontua perto de zero, que é a
  razão de a medida de enquadramento ter sido reescrita na onda 11 — **é a SATURAÇÃO dela
  contra céu aberto**. Então a massa fica no pixel e os cinco verdes são puxados **38% na
  direção da própria luma Rec.709**. **Medido: MANHÃ croma 149 → 85, dE 40 → 38; NOITE croma
  31 → 26, dE 34 → 31; céu aberto 31,2% e `CEU baixo` 50,1% não se movem um décimo; a faixa
  alvo y86-107 custa 12,5 → 11,6.**

  **(4) Uma quina que toma a hora não é quina.** O contorno dele tomava a mesma dose da pele
  (piso 0,34, tinta 80%), então à NOITE a linha que o separa da rua já estava quase toda no
  azul da rua. Agora toma piso 0,02 e 30% da tinta — é a única coisa nele que pode ir a quase
  preto à noite. **Medido: MANHÃ dE 38 → 33; NOITE luma 79 → 76, dE 31 → 30.** Pequeno, e
  relatado como pequeno.

  **Tentei e desfiz, os três medidos:** (a) Graduar a franja do topo para `mataNear/mataNearL`
  em vez de BRILHO — mesmo valor, mas põe **mais verde** no quadro e a croma dele foi
  **157 → 173**, que é exatamente a troca pela qual a onda 11 foi cobrada. (b) A mesma
  dessaturação da copa feita como **mistura para BRILHO**: mediu **melhor** — croma 149 → 100
  a 0,42, e ainda subia a luma dele — e **o print recusou**, porque funciona **clareando**: a
  copa saiu mais pálida que as serras atrás dela, e árvore perto mais pálida que morro longe
  inverte a profundidade do quadro inteiro. (c) Limitar a reexpansão de croma para nenhum
  canal estourar: **0,0**.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): rua doente continua
  desbotada e não escura, a árvore grande continua não nascendo com `h ≤ 0,5`, e à NOITE o
  Cetro segue a coisa mais quente do quadro (miolo 195,6 / cristal 214,7 contra poncho 123,6).

  **Medido no fim:** smoke verde nos quatro incrementos, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: `CEU alto` continua a maior faixa e a de menor dE, e agora sabemos o que o
  board faz ali — o quinto de cima dele é o MAIS CLARO da imagem (141) e o nosso é 121; a
  diferença não é falta de coisa no céu, é que o board deixa a luz entrar por cima e nós
  ainda temos folha lá. Dúvida honesta: o único eixo que ANDOU PARA TRÁS nesta onda é a luma
  do menino à NOITE, 66 → 76 de 485, e a atribuição está feita — com a árvore grande
  desligada a reexpansão de croma custa 0, com ela ligada custa 14 posições, ou seja o preço
  não é do efeito, é de onde ele o põe no meio do pelotão de blocos da copa. Não sei se isso
  é medida frouxa (o ranking é denso ali) ou perda real, e a razão dele contra o rival não
  piorou (0,65). Se a próxima onda mexer na luma dele, mede isso primeiro.**

- **2026-08-03 · visual — a rampa do céu estava virada ao contrário, e era ela o U invertido.**
  Seis incrementos, cada um com `node test/smoke.js` verde. **FPS 61 do começo ao fim.** Nada
  de `CFG`, `S`, fórmula ou economia foi tocado — **medido: `node test/sim.js` dá saída byte a
  byte idêntica nos seis commits** (`diff` vazio, seis vezes).

  **O placar, `test/board.js`, quadro inteiro, contra o painel RUA DO BAIRRO:**

  | | luma | C* | topo→chão em quintos |
  |---|---|---|---|
  | BOARD | 90,1 | 19,5 | 141 101 83 60 66 |
  | JOGO MANHÃ antes | 131,5 | 15,1 | **121 140 145 138 112** |
  | JOGO MANHÃ depois | **118,8** | **16,7** | **125 131 116 120 102** |
  | JOGO TARDE antes | 130,0 | 23,7 | 121 134 141 138 115 |
  | JOGO TARDE depois | 124,5 | 22,7 | 125 134 130 127 108 |
  | JOGO NOITE antes | 62,5 | 8,3 | 54 64 72 69 54 |
  | JOGO NOITE depois | 59,8 | 8,7 | 56 63 66 64 50 |

  **O U invertido acabou: o pico saiu do MEIO do quadro e os três quintos de baixo agora
  descem, que é a assinatura que o board tem e nós não tínhamos.** O C* do quadro medido por
  `medir.js` (que olha uma janela um pouco maior) vai de **15,8 para 18,1** contra 19,5 do
  board. **Céu aberto no visível ficou em 31,2% no dígito, e `CEU alto` em 32,2%** — o
  enquadramento das ondas 11 e 12 não foi tocado em lugar nenhum.

  **(0) A atribuição primeiro, porque "de onde vem esse brilho" era palpite.** Escrevi uma
  bancada descartável que parte o quadro medido nos mesmos cinco quintos e, dentro de cada
  um, separa **pixel que ainda é céu aberto** de **pixel desenhado** (a mesma identidade de
  pixel contra `skyCanvas` que a onda 11 inventou). **Medido, MANHÃ, antes:** quinto 1 **22%**
  de céu a L 158,6 e desenhado a 110,9; quinto 2 **50%** a 165,1 / 114,7; quinto 3 **55%** a
  **187,9** / 94,2; quinto 4 16% a **199,9** / 126,0; quinto 5 **0%** de céu, desenhado 112,4.
  Ou seja: **metade dos dois quintos do meio é céu aberto e esse céu ficava MAIS CLARO quanto
  mais descia.** Não era falta de haze nem uso da paleta — era a faixa de valor do próprio céu.

  **(1) A rampa do céu ia ao contrário do board.** Amostrei o painel: o céu dele mede
  **[149,186,201], L 179 no alto do quadro** e **[128,149,142], L 144 onde encosta no
  telhado** — escurece descendo, porque a luz está em cima e a rua está recuando para a
  sombra. A nossa ia de **136 no zênite a 231 no horizonte**. Todas as rampas de dia foram
  viradas; a NOITE ficou intacta, porque à noite a luz é a lâmpada da própria rua e ali o
  valor sobe mesmo em direção à linha do céu. **Medido: perfil 121 140 145 138 112 → 130 140
  122 129 112, luma 131,5 → 126,6.**

  **(2) Distância que lava para quase-branco não é haze, é borracha.** `horizonC` era
  [220,213,198] doente / [226,233,216] são — **L 214 e 231, C* abaixo de 9** — e todo plano
  distante carrega uma `dist` para dentro dele, até 0,44 na serra longe. Resultado: serra,
  cidade e mata longe chegavam **mais claras que o céu na frente delas** e sem cor. O board
  não faz nem uma coisa nem outra: o fundo da rua dele mede **[132,115,87], L 117 a C* 21**.
  Agora é um verde quente enevoado quando são e um ocre lavado quando doente, os dois
  **abaixo** do topo do céu e os dois com croma de verdade. **Medido: quinto 4 129 → 122,
  luma 126,6 → 125,1, C* 15,5 → 15,7** — e o print é que é o argumento: a serra voltou a
  ficar ATRÁS da faixa do céu em vez de brilhar na frente dela.

  **(3) A rua estava pavimentada no valor de pedra em sol aberto, e a do board está na
  sombra.** Linha a linha: **todo o chão visível é fiada de paralelepípedo**, então
  `chaoCanvas` quase nunca aparece e o valor inteiro mora em `trilha`/`trilhaL`/`sulcoA` —
  e só o `trilhaL` chegava a **L 224 aceso**. O calçamento perto do board mede **[113,87,48],
  L 89,5 a C* 27,5**, porque os prédios dos dois lados estão entre ele e o sol. Mesma família
  TERRA, quatro degraus abaixo, croma mantida: sombra é mais escura e mais QUENTE, não mais
  cinza. A faixa separadora do horizonte deixou de ser misturada 30% ao branco e passou a 12%.
  **Medido: quinto 5 112 → 102, luma 125,1 → 123,1, C* 15,7 → 15,9.**

  **(4) A faixa debaixo do arco era o pico de um perfil que devia estar caindo.** Virada a
  rampa, a anomalia que sobrou era o **segundo** quinto — 140 contra 101 do board, mais alto
  que o quinto acima dele. Ele é 50% céu aberto e esse céu estava em **L 164**, a leitura mais
  clara do quadro, porque a queda só começava abaixo dele. Agora a queda começa **no topo do
  quadro visível**. E aqui apareceu a armadilha do resto da onda: **escurecer céu custa
  croma** — a primeira tentativa perdeu 0,4 dela. As mesmas lumas foram reautoradas com o
  azul **mais afastado do cinza** em vez de mais perto: **perfil 130 140 122 122 102 → 125 131
  116 120 102, luma 123,1 → 118,8, C\* 15,9 → 16,5.**

  **(5) Ele não ficou mais sem graça, o pelotão o alcançou.** A reexpansão de croma que a onda
  12 pôs no menino **só disparava onde a tinta da hora mordia**, e à MANHÃ `forca` é 0,04:
  não fazia absolutamente nada. A croma dele ficou fixa em C* 23,5 enquanto esta onda levava a
  rua de C* 15,8 a 18,1. **A nota absoluta dele nunca se moveu (14,8) e a razão dele contra o
  rival mais forte nunca se moveu (0,64), mas a posição caiu de 83 para 201 de 485** — está
  medido e a atribuição é essa, não é perda de contraste, é o campo subindo. A direção diz
  desde a primeira linha que **ele não dessatura com o mundo**; então isso virou um **piso de
  1,32** sob a reexpansão, em toda hora, em torno da luma dele — neutro em luma pelo mesmo
  argumento do termo ao lado, e **o poncho sai em 123,4 contra os 123,6 da onda 7**.

  **O menino, de 485, fora da moldura, onda 12 → agora:** MANHÃ luma **49 → 16**, croma
  **83 → 92**, dE **33 → 12**; NOITE luma **76 → 54**, croma **27 → 12**, dE **30 → 11**.
  Razão C* dele / C* do quadro: MANHÃ **1,48 → 1,48**, NOITE **0,96 → 1,04** — ele deixou de
  ser menos saturado que a própria rua em qualquer hora.

  **(6) Cúmulo aceso por cima tem topo quente e barriga fria.** `CEU alto` é 38% do quadro a
  C* 16,7 e ~10% dela é nuvem autorada como três neutros (C* 7, 5 e 11), de quando o céu atrás
  também era quase branco. **Só o matiz, o valor intocado. Medido: C\* do quadro 16,6 → 16,7.**
  Pequeno, e relatado como pequeno.

  **Tentei e desfiz, os três medidos:** (a) as nuvens puxadas para L 200/228 e tingidas de
  céu, na teoria de que 17,5% de tudo o que é desenhado no segundo quinto é nuvem a L 233/253
  — **comprou 2 pontos de perfil e 0,1 de C\*, e o print recusou**: o cúmulo parou de se
  separar do céu e a única coisa nítida lá em cima ficou embaçada. As nuvens do board são
  brancas. (b) O caiado do morro (`MORRO_PAREDE`/`MORRO_LUZ`, cuja face acesa está autorada em
  **L 232**, valor que o board não usa em prédio nenhum) 10–12% abaixo: **mexeu 0,0 em tudo**,
  porque a favela não está no trecho de rua fixado em `worldX 4000`. Não medível nesta
  bancada, não ficou. (c) A rampa do céu escurecida sem alargar o azul: perfil melhor, **C\*
  0,4 pior**.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): rua doente continua
  ocre lavada e **não escura** (ARCO DOENTE/MANHÃ luma 139,5 contra SÃ 114,5 — o doente segue
  sendo o mais CLARO dos dois), à NOITE o Cetro segue a coisa mais quente do quadro
  (miolo 195,6 / cristal 214,7 contra poncho 123,4) e a rua doente à NOITE continua cinza
  desbotada com o menino colorido em cima dela.

  **Medido no fim:** smoke verde nos seis incrementos, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: o que resta do perfil é quase todo de composição, não de tinta. O quinto de
  cima do board é 141 e o nosso é 125, e a atribuição diz por quê: lá em cima só 22% do nosso
  quadro é céu e os outros 78% são a franja da copa a L 115 — o board põe folha só nos CANTOS
  e deixa o topo do meio aberto, e nós fazemos exatamente o contrário. Dúvida honesta: dá para
  subir a franja no meio e engordar as colunas na mesma medida, o que deixaria o céu aberto
  parado em 31,2% e viraria o quadro na direção do board de graça; não fiz porque é desfazer o
  incremento (3) da onda 11, que foi medido e aprovado, e porque a mesma mudança pode virar
  túnel — e túnel foi recusado por print duas vezes já. A outra que sobra é o par esq→dir:
  board 63 86 115 125 61 contra nosso 106 112 140 134 102, ou seja as bordas dele são metade
  do valor das nossas, e isso é a mesma pergunta pela lateral.**

- **2026-08-03 · visual — a franja saiu do meio, e a moldura virou duas casas em vez de um arco.**
  Três incrementos que ficaram e dois que foram desfeitos, cada um com `node test/smoke.js`
  verde. **FPS 61 do começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado —
  **medido: `node test/sim.js` byte a byte idêntico**.

  **O placar, `test/board.js`, quadro inteiro, contra o painel RUA DO BAIRRO:**

  | | luma | C* | topo→chão | esq→dir |
  |---|---|---|---|---|
  | BOARD | 90,1 | 19,5 | 141 101 83 60 66 | 63 86 115 125 61 |
  | JOGO MANHÃ antes | 118,7 | 16,7 | 125 131 116 120 102 | 106 112 140 134 102 |
  | JOGO MANHÃ depois | **115,7** | **16,5** | **130 126 110 115 99** | **93 115 141 138 90** |
  | JOGO TARDE antes | 124,5 | 22,7 | 125 134 130 127 108 | 116 117 139 137 113 |
  | JOGO TARDE depois | 121,6 | 22,2 | 127 130 125 122 105 | 106 119 140 141 103 |
  | JOGO NOITE antes | 59,8 | 8,7 | 56 63 66 64 50 | 56 57 66 65 54 |
  | JOGO NOITE depois | 58,4 | 8,8 | 57 62 63 61 49 | 52 58 66 66 49 |

  **As duas bordas caíram 13 e 12 pontos e o meio SUBIU (140→141 e 134→138), que é a
  assinatura do board pela lateral: quadro pesado nas quinas, rua aberta no miolo.**

  **(1) O board põe folha nas QUINAS e não põe nada no topo do meio.** A onda 13 já tinha
  atribuído: lá em cima só 22% do quadro era céu e 78% era franja a L 115. `dMeio` caiu de
  0,16·W (20,8 px de folha rasgada pendurada dentro da faixa visível, de lado a lado) para
  **0,045·W**, que são 6 px e moram inteiros **atrás da barra de HUD** — o meio da borda de
  cima deixou de existir como imagem. A massa não sumiu, mudou de lugar: `alcance` de 0,46·W
  para 0,34·W (quina, não tampa) e `dTopo` de 0,46·W para 0,72·W. O festão de folha passou a
  ser pesado pelo mesmo termo da quina, senão devolvia ±12 px de folha exatamente onde o meio
  tinha acabado de abrir. **Medido: quinto de cima 125 → 133; o sol voltou a aparecer no
  print.**

  **(2) Uma coluna três vezes mais larga em cima do que embaixo é um arco, e o arco É o
  túnel.** Base 0,058·W contra bojo 0,24·W dava 39 px de massa no topo e 7,6 px na linha do
  chão: as duas se encontravam por cima do meio e morriam na altura dos olhos — buraco de
  fechadura, que é o que os dois prints recusados sempre foram. Agora base **0,092·W** e bojo
  **0,16·W**: 33 px em cima, 12 px embaixo, lados retos como os prédios que emolduram todo
  painel de rua do board. O limite de jogabilidade continua valendo e continua apertando (a
  terceira vaga da fila de monstros).

  **(3) E o resto da massa das colunas foi tomado em VALOR, não em largura — é assim que o
  board consegue quina escura sem fechar o quadro.** Os verdes da moldura eram os **mesmos
  dois** da faixa de grama do primeiro plano; agora têm três próprios (`colunaC/colunaL/
  colunaB`) a ~2/3 da luma, e a alvenaria desceu os mesmos degraus. **A primeira versão
  escalou os três canais por igual e custou C\* 16,7 → 15,6** — croma que três ondas
  pagaram. Reautorada **abrindo a rampa entre os canais conforme o valor cai** (folha escura
  num quadro com esta luz rebatida não é um verde mais cinza, é um mais fundo e mais
  saturado): **C\* 16,5, ou seja 0,2 de custo em vez de 1,1.** A copa passou a nascer dos
  verdes das próprias colunas, então quina e coluna voltaram a ser uma massa só.

  **Tentei e desfiz, os dois medidos:** (a) `alcance` 0,34 → 0,40·W para devolver 1,3 ponto
  de céu aberto — **devolveu na moeda errada**: céu aberto do quadro inteiro 32,1% → 31,4%
  mas o **visível** 32,6% → 32,5%, isto é, cada pixel devolvido ficou atrás da barra, e o
  quinto de cima pagou um ponto (130 → 129). (b) Base da coluna 0,092 → 0,115·W: **mediu
  exatamente o que prometia — bordas 93/90 → 86/84** — **e o print recusou**: naquela largura
  a coluna da direita começa a comer o terceiro monstro da fila, a fresta de céu entre as
  duas fecha num poço, o menino anda para trás nos três eixos (MANHÃ luma 25 → 29, croma
  74 → 81, dE 18 → 21 de 485) e o céu aberto atravessa os 31,2% para baixo, 30,1%. **É a
  terceira vez que este projeto confia no print contra o número e a terceira vez que o print
  estava certo.** Os dois estão escritos no arquivo ao lado do número que os matou.

  **O que ficou segurado:** poncho **123,4** à NOITE no dígito (miolo 195,6 / cristal 214,7
  seguem sendo o mais quente do quadro); o menino à NOITE **54 / 12 / 11 de 485**, parado;
  rua doente segue **mais clara** que a sã (ARCO DOENTE/MANHÃ 139,1 contra SÃ 113,4) e
  desbotada, não escura. **O que NÃO ficou segurado, e é a dívida desta onda:** céu aberto
  visível **31,2% → 32,6%**, +1,4 — abrir o topo do meio necessariamente abre céu, e o único
  lugar onde ainda dá para devolver à vista é o próprio topo do meio. E o menino à MANHÃ
  piorou de **16 / 92 / 12** para **23 / 73 / 16 de 485**: a croma dele melhorou 19 posições,
  a luma e o dE pioraram 7 e 4, e a atribuição está feita — os rivais novos são blocos em
  (105,18) e (110,18), a fronteira entre o céu recém-aberto e a massa da quina, logo abaixo
  da barra. Razão dele contra o rival mais forte: 0,57 na luma, 0,81 no dE.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): sem erro de console,
  e à NOITE as janelas acesas das colunas viraram pontos quentes contra alvenaria de verdade
  escura, que é ganho e não estava previsto.

  **Medido no fim:** smoke verde nos três commits, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: as bordas ficaram em 93/90 contra 63/61 do board e essa distância agora
  tem um limite medido, não uma opinião — largura acabou (o print recusa 0,115·W) e valor
  quase acabou (`luzDoDia()` soma ~+26 de luma em cima de qualquer coisa que a moldura
  autore à MANHÃ, então baixar mais a tinta rende cada vez menos). O que sobra e ainda não
  foi tentado é o terceiro caminho, o único que o board também usa: as bordas dele são
  escuras porque estão em SOMBRA PRÓPRIA, com o sol vindo do fundo da rua — ou seja um
  gradiente de valor ao longo do X do quadro inteiro, e não tinta mais escura na moldura.
  Dúvida honesta: isso é perigosamente perto de pós-processamento, que a direção C proíbe
  em letra maiúscula, então talvez a resposta certa seja "está no limite" e a próxima onda
  deva ir gastar o esforço no céu aberto de 32,6%.**

- **2026-08-03 · visual — o céu, e a descoberta de que o alvo de 25% foi lido no recorte
  errado.** Três incrementos, cada um com `node test/smoke.js` verde. **FPS 61 do começo ao
  fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado — **medido: `node test/sim.js`
  byte a byte idêntico nos três commits**.

  **(0) A bancada, primeiro, porque ninguém tinha medido o CÉU do board — só a área dele.**
  `test/ceu.js` é novo. `medir.js` conta **céu nu** (pixel que ainda carrega o que
  `skyCanvas` pôs ali), que responde "quanto do quadro está sem autoria" e nada sobre a
  autoria do resto; `board.js` tira média do quadro inteiro, e uma vez que o chão entra na
  média o céu some dentro dela. Esta separa **céu de nuvem dentro do céu** e relata a
  relação: fração, separação de valor, croma de cada um, tamanho das peças, altura do banco.

  **O board, RUA DO BAIRRO:** nuvem é **26,3% do céu dele** e **4,9% do quadro**, a
  **L 220 contra 171 do céu atrás, separação 49**, com o céu a **C\* 16,1** e as nuvens a
  **C\* 12,5 — as nuvens do board NÃO são neutras**. Nós: nuvem **19,1% do céu**, **7,1% do
  quadro**, L 190 contra 145, **separação 45**, céu a **C\* 13,5**, nuvem a C\* 11,0. Ou
  seja: **MENOS nuvem que o board em relação ao céu, MAIS área pintada, e a separação de
  valor já estava certa** — que é exatamente por que duas ondas mexendo no VALOR da nuvem
  foram recusadas pelo print. O que faltava era distribuição e croma.

  **(1) Uma classe de tamanho num banco só não é o que o board tem.** O cúmulo saiu de um
  espaçamento de 34 px com uma classe (w0 25–84 px, ou seja **metade da largura do quadro**)
  para **três classes por hash própria** — dois terços pequena, um quarto média, um décimo o
  aglomerado grande — num espaçamento de **12 px**. Mesmo laço, mesmos lóbulos, nenhum objeto
  novo, nenhuma chamada de desenho nova. **Medido: céu aberto no visível 32,6% → 30,6%
  (a dívida da onda 14 paga, e abaixo dos 31,2% de antes dela), céu aberto em `CEU alto`
  47,1% → 38,0%, `CEU alto` dE 11,3 → 13,4, nuvem 24,0% do céu, separação 45 → 53.**

  **(2) Uma silhueta carimbada dez vezes é uma fileira de bolinhas.** Dois conjuntos de
  lóbulos e um esticão vertical no bojo, escolhidos por hash. **Medido: céu aberto 30,6% →
  30,4%; o menino à MANHÃ 21/78/16 → 20/78/16 de 485; o resto parado no dígito.** Pequeno,
  e relatado como pequeno — o argumento é o print, onde a cadeia deixou de ser um colar de
  contas do mesmo tamanho.

  **(3) O céu estava três de croma abaixo do board, e nunca esteve abaixo em valor.** Céu do
  board **C\* 16,1**, o nosso **13,3**. O céu é a maior região do quadro, então aqueles três
  pontos são a maior parte do **16,3 contra 19,5** do quadro inteiro. Três ondas já pagaram
  céu na moeda do valor e foram recusadas pelo print, então esta **não toca em valor**: a
  croma residual da rampa é **reexpandida em torno da luma Rec.709 dela mesma**, o mesmo
  movimento neutro em luma das ondas 12 e 13 no menino e na copa grande. **Medido: C\* do
  quadro 16,3 → 17,5 (board 19,5), com o perfil vertical parado no dígito — 136 125 111 115
  99 antes e depois. C\* do céu 13,3 → 17,1.** E o arco doente→são **abre** em vez de
  fechar: DOENTE/MANHÃ C\* 8,1 → 8,6 contra SÃ 17,9 → 18,8, com a rua doente seguindo a
  **mais clara** das duas (139,0 contra 115,0).

  **E é ganho SÓ DE DIA, e isso está medido, não suposto.** Rodado liso no relógio inteiro
  ele leva o quadro da NOITE de C\* 9,8 para 10,8 e **inverte o que a onda 12 comprou**: o
  menino deixa de ser mais saturado que a própria rua à noite (razão 1,00 → **0,90**) e a
  croma dele vai 12 → 17 de 485. Zerado depois do escuro.

  **E o pelotão o alcançou outra vez à MANHÃ, exatamente como na onda 13**, então o piso da
  reexpansão dele foi de **1,32 para 1,50** — a direção diz desde a primeira linha que ele
  não dessatura com o mundo, e isso vale nos dois sentidos. **O menino, de 485, fora da
  moldura, começo → fim da onda:** MANHÃ **23/73/16 → 21/89/13**; NOITE **54/12/11 →
  52/9/6**. Razão C\* dele / C\* do quadro **1,50** à MANHÃ e **1,08** à NOITE. Poncho
  **123,4** no dígito, Cetro seguindo a coisa mais quente do quadro (miolo 195,6 / cristal
  214,7). A dívida da onda 14 é paga em luma (23 → 21) e em dE (16 → 13, contra os 12 de
  antes da onda 14) e **não** em croma (73 → 89) — a atribuição é o céu mais saturado atrás
  dele, e está aqui em vez de escondida.

  **A descoberta que muda o alvo das próximas ondas: os 25% foram lidos no recorte errado.**
  As ondas 11 a 14 perseguiram "o board dá cerca de um quarto da imagem ao céu aberto", que
  foi lido num prato **2,15:1 deitado** enquanto nós compomos um **0,85:1 em pé**. Tela alta
  sobre rua que rola de lado mostra mais céu, necessariamente. `ceu.js` agora recorta o board
  **na nossa proporção**, centrado na rua: **RUA DO BAIRRO a 0,85:1 dá 30,5% de céu, 22,6%
  dele nuvem, ou seja 23,6% de céu aberto**; o painel MANHÃ a 0,85:1 dá 26,2% / 20,9%. Nós
  estamos em **30,4%**. A distância é real e é de ~7 pontos, mas **o alvo certo é 23,6%, não
  25%**, e ele é mais duro, não mais fácil. E o caminho para lá **não é mais nuvem**: já
  temos **25,1% do céu em nuvem contra os 22,6% do board na mesma proporção** — essa alavanca
  acabou honestamente.

  **O que a bancada RECUSOU confirmar, e fica escrito.** A hipótese que motivou o incremento
  (1) era tamanho de peça, e **as duas métricas de tamanho que construí não a confirmam**:
  corrida de linha p90 ficou em 42 px antes e depois, e as peças conexas foram de **15 peças
  de largura mediana 12** para **11 de mediana 11** — ou seja **menos** peças e não mais.
  As duas medem mal aqui: o cirro entra na conta, os cúmulos vizinhos se fundem pela base
  chapada, e o limiar de "nuvem" é mediana+22 e anda quando a população anda. O que se moveu
  sem ambiguidade foi cobertura, estrutura e croma. **Confiei no print, que é a regra deste
  projeto desde a onda 11, e o print é claro: antes eram dois borrões moles, agora é uma
  cadeia de oito nacos brancos nítidos em alturas diferentes, como o board.**

  **Tentei e desfiz, os dois medidos:** (a) O ganho de croma do céu rodando no relógio
  inteiro — número melhor no quadro (C\* 17,5 e a NOITE de 8,8 para 9,9) e **desfeito**,
  porque desfaz a razão 1,00 da onda 12 à NOITE. (b) Tirar o cirro alto, na teoria de que o
  painel RUA DO BAIRRO não tem cirro nenhum (só o TARDE do board tem): **céu aberto visível
  de 28,5% para 30,1% e `CEU alto` de 37,3% para 42,5% no mesmo controle pareado** — o cirro
  compra 1,6 ponto de céu aberto e 5,2 em `CEU alto` e fica.

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): sem erro de console,
  rua doente segue ocre lavada e **não escura**, o cúmulo doente sai bege-quente em vez de
  branco, e à NOITE o banco vira massa cinza-escura contra o azul com o Cetro seguindo a
  única coisa quente do quadro.

  **Medido no fim:** smoke verde nos três commits, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: o céu chegou. Nos eixos que o board dá para medir ele está lá — nuvem
  25,1% do céu contra 22,6%, separação de valor 53 contra 47, croma do céu 17,1 contra 16,9,
  croma da nuvem 11,3 contra 12,1 — e o quinto de cima do quadro está em 136 contra 141.
  A maior distância medida que sobra saiu do céu e desceu: contra o board o nosso perfil é
  136 125 111 115 99 contra 141 101 83 60 66, e os quintos 4 e 5 estão 55 e 33 pontos acima.
  Isso é a rua, os telhados e a faixa separadora, não o céu. Dúvida honesta: a onda 13 já
  desceu o calçamento quatro degraus e ganhou 10 pontos no quinto 5; faltam 33, e não sei se
  isso se paga com tinta ou se o quinto 4 do board está em 60 porque a rua dele está entre
  dois prédios altos e a nossa não — que é a mesma pergunta de largura que o print recusou
  duas vezes, agora pela vertical.**

- **2026-08-03 · visual — o chão, e a dúvida da onda passada respondida: o quinto 5 é tinta,
  o quinto 4 é enquadramento, e agora os dois têm número.** Três incrementos que ficaram e
  três que foram desfeitos, cada um com `node test/smoke.js` verde. **FPS 61 do começo ao
  fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado — **medido: `node test/sim.js`
  byte a byte idêntico nos três commits**.

  **O placar, `test/board.js`, quadro inteiro, contra o painel RUA DO BAIRRO:**

  | | luma | C* | topo→chão | C* por quinto |
  |---|---|---|---|---|
  | BOARD | 90,1 | 19,5 | 141 101 83 60 66 | 18,7 19,0 20,4 17,7 21,6 |
  | JOGO MANHÃ antes | 117,0 | 17,6 | 136 125 111 115 99 | 15,5 17,4 15,6 18,9 20,4 |
  | JOGO MANHÃ depois | **113,7** | **17,8** | **136 125 111 112 85** | 15,5 17,4 15,6 18,9 **21,5** |
  | JOGO TARDE antes | 122,8 | 23,4 | 132 130 125 122 105 | — |
  | JOGO TARDE depois | 119,7 | 23,6 | 132 130 125 120 **91** | — |
  | JOGO NOITE antes | 58,8 | 8,8 | 59 62 63 61 49 | — |
  | JOGO NOITE depois | 57,8 | 9,0 | 59 62 63 60 **45** | — |

  **O quinto 5 caiu 14 pontos e GANHOU croma no caminho (20,4 → 21,5 contra 21,6 do board),
  que é a primeira vez nesta série que valor foi comprado sem que a croma pagasse.** O quinto
  4 andou 3.

  **(0) A atribuição primeiro, porque "de onde vem esse brilho" era palpite outra vez.**
  `test/quinto.js` é novo: parte a mesma janela que o `board.js` mede nos mesmos cinco
  quintos e conta cada quinto **por cor exata de pixel**, mapeando a cor de volta para a
  entrada da paleta que a pintou, com a faixa de `y` em que ela vive. Uma tira não é uma
  coisa que se pinta; uma entrada da paleta é. **Medido, MANHÃ, linha de base:** o quinto 5
  (98,5) tem como maior item único **`trilhaL` — o fio de luz no topo de cada pedra —, 13,4%
  do quinto a L 165, pagando 22,1 dos 98,5 sozinho**; o quinto 4 (114,6) tem **`serraNear`,
  18,8% a L 141, pagando 26,5**. O `board.js` também aprendeu a dizer C\* e RGB médio por
  quinto, porque **"mais escuro" e "mais escuro E mais quente" não são a mesma instrução** e
  só a segunda é o que o board fez: q4 dele é **69,59,35** e q5 é **81,65,35** contra os
  nossos 115,116,94 e 107,99,67.

  **(1) A rua estava calçada como pedra em sol aberto, as oito fiadas no mesmo valor.** No
  board a rua **recua para longe do observador em direção à luz** — as fiadas do fundo pegam
  o horizonte, as do pé estão na sombra de tudo o que está atrás de você, e o calçamento
  perto dele mede [113,87,48], L 89,5 a C\* 27,5. Agora cada fiada desce um degrau em direção
  ao pé do quadro, misturada para o escuro de ACENTO e não para o cinza, **com a croma
  residual reexpandida em torno da luma Rec.709 do resultado** (o movimento neutro em luma
  das ondas 12, 13 e 15) — a primeira versão sem isso custou C\* 20,4 → 19,8 e **o quinto
  calçado do board é o MAIS saturado dele, não o menos**. A rampa é gasta nas fiadas que dá
  para VER: oito são assentadas e as duas últimas caem debaixo da tarja REAL DATA, então
  indexar a 7 põe a profundidade toda onde ninguém olha. **Medido: quinto 5 99 → 88 com C\*
  20,4 → 21,4;** e mais tarde, com a rampa mais funda (0,52 → 0,68), **88 → 85 a C\* 21,5**.

  **(2) Uma silhueta mais clara que o céu atrás dela não é distância, é buraco.** `serraNear`
  resolvia em **L 141 e o céu na mesma linha mede L 136–137**. A onda 13 endireitou a rampa
  do céu por exatamente esse motivo e deixou as duas serras no valor velho. Mesmo matiz, ~85%
  da luma, croma reexpandida. **Medido: serraNear 141 → 131, quinto 4 115 → 112, C\* do
  quadro parado em 17,8 e C\* do quinto 4 parado em 18,9. E o menino MELHORA à MANHÃ
  (luma 21 → 18 de 485).**

  **(3) O teto, medido em vez de suposto, e é ele a resposta da dúvida da onda 15.**
  `quinto.js` agora conta também **quanto de cada quinto ainda é céu nu e a que luma**, o que
  dá um **piso aritmético** para a tira: um quinto que é s% de céu a L não pode descer abaixo
  de s·L nem que todo pixel desenhado nele vá a zero. **Medido, MANHÃ: quinto 4 é 14,3% de
  céu a L 136 → piso 19,5; quinto 5 é 0,0% de céu → piso 0.** Ou seja: **o quinto 5, que está
  em 85 contra 66, é inteiramente pagável com tinta; o quinto 4, em 112 contra 60, exigiria
  que TODO pixel desenhado nele fosse a L 47** — e é onde o menino tem a cabeça. O board põe
  60 ali porque a rua dele está entre duas fachadas em sombra e **não tem céu nenhum naquele
  quinto**; nós temos 14,3%. A pergunta da onda 15 tem resposta: **quinto 5 é tinta, quinto 4
  é enquadramento.**

  **Tentei e desfiz, os três medidos:**
  **(a) A faixa separadora, que era o suspeito óbvio.** É a coisa visivelmente mais clara da
  metade de baixo do quadro. **Desenhada com alfa 0, ela move o quinto 4 de 112 para 111 e o
  quinto 5 de 88 para 88.** Um ponto. O número ficou escrito ao lado dela no arquivo.
  **(b) A distância média inteira, 18% de valor abaixo** — `serraFar`, `cidade`, os marcos, o
  morro, `mataFar`, `mataMid`, `mataNear`, tudo o que fica entre o skyline e a linha de
  árvores. **Comprou UM ponto do quinto 4 e um do quinto 5**, porque neste trecho de rua essa
  pilha inteira está ocluída pela banda perto, pelo proscênio e pelos objetos. Desfeita — e a
  lição é a mesma da onda 13, item (b): mudança que a bancada não mede é mudança que ninguém
  aprovou.
  **(c) Um segundo degrau na serra, do mesmo tamanho do primeiro.** Comprou quinto 4
  **112 → 110** e **custou o menino à NOITE, 57 → 59 de 485** — e a bancada nomeia o
  mecanismo: os rivais novos dentro do quadro aparecem em **(85..95, 138)**, que é a linha
  onde a serra encosta no céu. **Escurecer a distância média atrás dele não o enterra; ela
  FABRICA uma quina de silhueta que disputa com ele.** O primeiro degrau tinha um defeito para
  consertar (a serra estava mais clara que o próprio céu), este só tinha uma média para
  perseguir.

  **O que ficou segurado:** poncho **123,4** à NOITE no dígito (miolo 195,6 / cristal 214,7
  seguem sendo o mais quente do quadro); **céu aberto no visível 30,6% → 30,4%**, ou seja não
  foi devolvido nada (alvo verdadeiro 23,6%); **C\* do quadro 17,5 → 17,8** contra 19,5 do
  board; razão C\* dele / do quadro **1,49** à MANHÃ e **1,06** à NOITE; e o arco doente→são
  segue rodando em saturação com o doente **mais claro** (ARCO DOENTE/MANHÃ 136,0 contra SÃ
  112,3). **O que NÃO ficou segurado, e é a dívida desta onda:** o menino à NOITE foi de
  **52 para 57 de 485** na luma, com croma 9 e dE 6 parados no dígito e a razão contra o
  rival em 0,76 — a atribuição é o degrau da serra do incremento (2), pelo mesmo mecanismo
  que fez o incremento (c) ser desfeito, só que a um terço do tamanho. À MANHÃ ele melhora
  (21/89/13 → **18/90/14**).

  **Conferido em três níveis de saúde e quatro horas** (`test/cruz.js`): sem erro de console,
  rua doente segue **ocre lavada e não escura** — a rampa de sombra do calçamento sai como um
  degradê empoeirado e quente na rua doente, não como sujeira —, e à NOITE o calçamento perto
  continua com grão de pedra em vez de virar uma barra preta (conferido num recorte 4× da
  faixa do chão, MANHÃ e NOITE).

  **Medido no fim:** smoke verde nos três commits, **FPS 61**, `sim.js` idêntico.
  **Próximo passo: o quinto 5 tem 19 pontos ainda por pagar (85 contra 66) e o piso dele é
  ZERO, então é tinta e nada mais — mas a atribuição diz que já não há item grande: depois do
  calçamento o maior é `mataNear` com 9,2% a L 101, que vale 1,4 ponto, e o resto está
  espalhado em quarenta cores. Dúvida honesta: os quintos 2 e 3 estão em 125 e 111 contra 101
  e 83, com pisos de céu de 75 e 69 — ou seja lá SOBRA margem (24 e 28 pontos, dos quais 50 e
  42 são pagáveis) e ninguém olhou para eles porque a onda 15 apontou para baixo. Pode ser que
  a maior distância medida que resta não esteja no chão, e sim no meio do quadro, onde metade
  de tudo ainda é céu nu.**

- **2026-08-03 · onda 17: os quintos 2 e 3 não têm tinta a pagar, e a dívida da onda 16 foi
  paga.** A onda 16 fechou com a suspeita de que sobravam 50 e 42 pontos pagáveis no meio do
  quadro. **A suspeita está errada, e a medida que a derruba é o outro lado da mesma
  aritmética.** O `quinto.js` sabe exatamente quanto de cada quinto NOSSO ainda é céu nu,
  porque compara pixel a pixel contra o `skyCanvas`. O board não tem `skyCanvas`, então toda
  comparação de perfil até hoje pôs o NOSSO piso ao lado da MÉDIA CRUA do board e leu a
  diferença como tinta.

  **(0) O `board.js` agora roda a mesma heurística de céu nos dois lados** (azul claramente
  acima do vermelho e claro, mais o quase-branco da nuvem — boa num painel de dia, sem
  sentido à TARDE e à NOITE, então só é impressa onde significa algo), e tira o piso da
  média para publicar o **PINTADO**, que é a única metade do perfil que um pincel move.
  **Medido, MANHÃ:**

  |  | quinto 1 | 2 | 3 | 4 | 5 |
  |---|---|---|---|---|---|
  | board luma | 141 | 101 | 83 | 60 | 66 |
  | board céu% | 35,3 | **14,4** | **1,6** | 0,1 | 0,0 |
  | board PINTADO | 128 | **89** | **82** | 60 | 66 |
  | jogo luma | 136 | 125 | 111 | 112 | 85 |
  | jogo céu% (heurística) | 45,7 | **59,8** | **53,6** | 14,9 | 0,0 |
  | jogo PINTADO | 100 | **81** | **77** | 108 | 85 |

  **A tinta dos quintos 2 e 3 já está IGUAL OU MAIS ESCURA que a do board (81 contra 89 e 77
  contra 82).** Os 24 e 28 pontos inteiros são fração de céu: o board tem 14,4% e 1,6% de céu
  nesses quintos, nós temos 51,0% e 49,8% pelo teste exato do `quinto.js`. Ou seja **os
  quintos 2 e 3 são enquadramento, exatamente como o 4** — e o único alavanque de
  enquadramento que existe (a largura das colunas) foi medido e **recusado pelo print** na
  onda 14 a 0,115·W. Não há onda de tinta a fazer no meio do quadro; a próxima pessoa que
  olhar o perfil e vir 125 contra 101 deve olhar esta linha antes de pegar o pincel.

  **(1) A serra perto estava sendo cobrada de noite por uma correção de dia, e quem pagava
  era o menino.** A onda 16 puxou `serraNear` para 85% da luma por um defeito declarado: ela
  resolvia em L 141 contra um céu de L 136–137 nas mesmas linhas, e silhueta mais clara que o
  próprio fundo é buraco. **Medido: à NOITE a serra resolve em L 57 contra um céu de L 85–86
  nas mesmas linhas** — já está vinte e oito pontos à frente, o puxão não compra nada ali, e
  a onda 16 registrou o que ele custava (menino à NOITE 52 → 57 de 485). O puxão agora é
  devolvido em proporção a `escuridao()`, com a luma reescalada e os desvios de croma
  carregados inteiros. `escuridao()` é **exatamente 0 à MANHÃ**, então o dia inteiro fica
  parado no dígito. **Medido: MANHÃ 136 125 111 112 85 e menino 18/90/14 de 485, ambos
  parados; NOITE menino luma 57 → 49 de 485** (croma 9 e dE 6 parados), quadro 57,8 → 58,3,
  quinto 4 60 → 62; TARDE quinto 4 120 → 121 (`escuridao` 0,10). **A dívida da onda 16 está
  paga e passou dos 52 de antes dela.**

  **Tentei e desfiz, medido:** o mesmo puxão de 15% de dia em `serraFar`, que tem o defeito
  no papel — resolve em L 165 com o céu das próprias linhas em ~135. **Não comprou nada: o
  perfil da MANHÃ não moveu um dígito, o PINTADO do quinto 4 foi de 108 para 107 e o menino
  foi de 18 para 19 de 485.** A serra longe está ocluída pela serra perto e pela copa, e o
  que sobra dela é a faixa de luz sobre a qual toda a arquitetura de valor se apoia. Defeito
  no papel que a bancada não mede não vale um posto do menino. O número ficou escrito ao lado
  dela no arquivo.

  **CONSOLIDAÇÃO — estado honesto, com todas as bancadas rodadas em sequência:**
  - **perfil topo→chão, MANHÃ:** `136 125 111 112 85` contra `141 101 83 60 66` do board.
    TARDE `132 130 125 121 91`; NOITE `59 62 63 62 45`.
  - **PINTADO (perfil menos o piso de céu), MANHÃ:** `100 81 77 108 85` contra `128 89 82 60
    66`. Só os quintos 1 e 4 têm tinta devendo, e o 4 tem 14,3% de céu e a cabeça do menino.
  - **croma:** quadro MANHÃ **C\* 17,8** contra 19,5 do board (por quinto 15,5 17,4 15,6 18,9
    21,5 contra 18,7 19,0 20,4 17,7 21,6). TARDE 23,5. NOITE 9,0.
  - **céu aberto:** quadro inteiro 29,1%, **visível 30,4%** (alvo verdadeiro 23,6%) —
    não se mexeu nesta onda. `CEU alto` 38,0%, `CEU baixo` 48,0%.
  - **menino de 485, fora da moldura:** MANHÃ **18 / 90 / 14** (luma/croma/dE), razões contra
    o rival 0,56 / 0,75 / 0,85, C\* dele / do quadro **1,49**. NOITE **49 / 9 / 6**, razões
    0,77 / 0,84 / 0,93, razão de croma **1,06**.
  - **fonte à NOITE:** poncho **123,4**, miolo 195,6, cristal 214,7, conjurando 250,5 — o
    Cetro segue a coisa mais quente de um quadro noturno.
  - **arco doente→são:** DOENTE/MANHÃ luma **136,0** a C\* 8,8 contra SÃ **112,3** a C\*
    **18,9** — o doente segue mais CLARO e quase sem croma, o são mais escuro e saturado, que
    é o arco rodando em saturação e não em brilho. À NOITE 82,5 / C\* 5,3 contra 57,3 / 9,7.
  - **céu (`ceu.js`), MANHÃ:** céu 37,0% do quadro, nuvem 25,1% do céu, 11 peças de mediana
    11 px, C\* do céu **17,1** contra 16,1 do board — a única medida em que passamos o board.
  - **smoke verde, FPS 61, `sim.js` byte-idêntico** nos três commits; `cruz.js` sem erro de
    console em três saúdes × quatro horas.

  **O que ainda falta, sem maquiagem:** os 7 pontos de céu aberto (30,4% contra 23,6%) e os
  quintos 2, 3 e 4 do perfil — e as três coisas são **a mesma coisa**, uma só: o board é uma
  rua entre duas fachadas e o nosso é uma rua com um vão de céu no meio. A única alavanca
  conhecida é a largura das colunas, e ela foi medida e recusada pelo print. **Próximo passo:
  se alguém quiser esses pontos, o trabalho não é tinta nem é a moldura de novo — é pôr no
  vão coisa que o board põe e nós não temos: fachadas de meia-distância descendo a rua entre
  as colunas, na altura y62–138. Antes de tentar, medir o custo no menino a cada passo, e
  lembrar da onda 16: escurecer atrás dele não o enterra, FABRICA uma quina de silhueta que
  disputa com ele.**

- **2026-08-03 · onda 18: as fachadas desceram a rua, e o vão de céu virou uma cunha.**
  Três incrementos que ficaram e três que foram desfeitos, cada um com `node test/smoke.js`
  verde. **FPS 61 do começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado —
  **medido: `node test/sim.js` byte a byte idêntico**.

  **O placar, `test/board.js`, quadro inteiro, contra o painel RUA DO BAIRRO:**

  |  | luma | C* | topo→chão | céu% por quinto | PINTADO |
  |---|---|---|---|---|---|
  | BOARD | 90,1 | 19,5 | 141 101 83 60 66 | 35,3 14,4 1,6 0,1 0,0 | 128 89 82 60 66 |
  | JOGO MANHÃ antes | 113,7 | 17,8 | 136 125 111 112 85 | 45,7 59,8 53,6 15,0 0,0 | 100 81 77 108 85 |
  | JOGO MANHÃ depois | **111,2** | **18,3** | **136 125 105 105 85** | 45,7 58,4 **34,5** **5,9** 0,0 | 100 82 87 103 85 |
  | JOGO TARDE depois | 116,5 | 23,9 | 132 129 117 113 91 | — | — |
  | JOGO NOITE depois | 56,0 | 8,5 | 59 61 58 56 45 | — | — |

  **A onda 17 provou que os quintos 2 e 3 não tinham tinta a pagar — a nossa já estava em 81
  e 77 contra 89 e 82 do board — e que a diferença inteira era FRAÇÃO DE CÉU. Esta onda foi
  buscar a fração.** Pelo teste exato do `quinto.js` (identidade de pixel contra o
  `skyCanvas`): quinto 3 **49,8% → 32,1%**, quinto 4 **14,3% → 5,3%**, quinto 2 51,0% → 49,6%.
  **Céu aberto no visível 30,4% → 24,7%, contra o alvo verdadeiro de 23,6%** — a distância que
  a onda 15 mediu em 6,8 pontos ficou em 1,1. E **o C\* do quadro subiu de 17,8 para 18,3**
  (19,2 na janela do `medir.js`, contra 19,5 do board), isto é, fechar céu desta vez não
  custou croma, comprou.

  **(1) A única alavanca de enquadramento conhecida era a largura das colunas, e o print a
  recusou na onda 14. Esta é a outra, e é a que o board de facto desenha.** As frentes dos
  dois lados **recuam** para um ponto de fuga na linha do horizonte (`vy = GROUND-26`,
  `vx = 0,60·W`), então as cumeeiras rasgam das quinas de cima para o fundo da rua e o céu que
  sobra é uma **cunha**, não uma fresta. Fecha céu no MEIO do quadro sem tocar em nenhuma das
  duas bordas — a fila de monstros não sabe que isto aconteceu. **O envelope é fixo à TELA e
  só o tecido rola**, que é o que um corredor faz quando se anda por ele: ponto de fuga que
  escorrega de lado não é ponto de fuga. Um laço, nenhum objeto novo. **Medido, primeiro corte
  (0,38/0,30·H, expoente 1,2): quinto 3 111 → 107, quinto 4 112 → 105, céu aberto visível
  30,4% → 26,2%, C\* 17,8 → 18,3.**

  **(2) Perspetiva de uma fiada de casas iguais dá uma diagonal RETA, e a do board é uma só,
  sem quebra, da quina do painel até ao fundo da estrada.** Expoente 1 e as duas fiadas
  levantadas para 0,46/0,34·H (a da esquerda é a mais alta, como no board). **Medido: céu
  aberto 26,2% → 24,7%, céu do quinto 3 40,8% → 34,5%.**

  **(3) Meia-distância é uma afirmação sobre CROMA antes de ser sobre valor.** O primeiro
  corte deu-lhes telha cheia sobre ocre cheio com um peitoril aceso em cada piso, e a bancada
  cobrou no menino: **croma dele à MANHÃ 90 → 116 de 485 com os rivais de topo parados**, que
  é a assinatura do CAMPO a subir e não dele a cair — o `medir.js` pontua um bloco pelo
  espalhamento de croma dentro dele, e um telhado, um vão e um peitoril aceso dentro de um
  bloco 22×34 é muito espalhamento. O ar come saturação antes de comer valor: os telhados
  vieram ao encontro das paredes em matiz e as seis entradas carregam mais `dist`. E **uma
  janela acende quando está ESCURO, não quando a rua está sã** — quarenta pontos amarelos a
  arder ao meio-dia a duzentos metros. **Medido: croma 116 → 103 de 485, luma 17 → 19, dE 15
  parado; à NOITE 45/8/6 → 40/8/3, à frente dos 49/9/6 com que a onda começou.**

  **Tentei e desfiz, os três medidos:**
  **(a) O envelope a 0,50/0,42·H.** Chega aos **24,0% de céu aberto** — o alvo — e **custa o
  menino à NOITE, 43 → 58 de 485 na luma**. Dois terços de um ponto de céu por treze postos.
  **(b) As seis entradas das frentes 12% mais escuras**, com o argumento de que o nosso
  PINTADO do quinto 3 lê 87 contra 82 do board e um cânion de rua sombreia as próprias
  fachadas. **Comprou DOIS pontos (PINTADO 87/103 → 85/101) e custou SETE postos ao menino à
  NOITE (40 → 47, dE 3 → 6).** É o mecanismo da onda 16 pela terceira vez nesta série.
  **(c) O ponto de fuga a 0,66·W**, para alongar a fiada da esquerda: **mexeu um décimo de
  ponto no céu, pôs o quinto 3 de volta PARA CIMA (105 → 106) e levou a luma do menino à
  MANHÃ de 19 para 33 de 485** — deslizar o ponto de fuga para a direita faz a cumeeira alta
  da esquerda caminhar em direção à cabeça dele. Os três números estão escritos no arquivo ao
  lado da coisa que mataram.

  **CONSOLIDAÇÃO — estado honesto, com todas as bancadas rodadas em sequência:**
  - **perfil topo→chão, MANHÃ:** `136 125 105 105 85` contra `141 101 83 60 66` do board.
    TARDE `132 129 117 113 91`; NOITE `59 61 58 56 45`.
  - **PINTADO (perfil menos o piso de céu), MANHÃ:** `100 82 87 103 85` contra `128 89 82 60
    66`. O quinto 3 passou a ter 5 pontos de tinta A MAIS que o board (era 5 a menos) — é a
    tinta nova; o quinto 4 desceu de 108 para 103.
  - **céu por quinto (exato, `quinto.js`), MANHÃ:** 27,3 / **49,6** / **32,1** / **5,3** /
    0,0% contra 35,3 / 14,4 / 1,6 / 0,1 / 0,0 do board.
  - **croma:** quadro MANHÃ **C\* 18,3** contra 19,5 do board (por quinto 15,5 17,4 16,1 21,0
    21,5 contra 18,7 19,0 20,4 17,7 21,6). TARDE 23,9. NOITE 8,5.
  - **céu aberto:** quadro inteiro 24,1%, **visível 24,7%** (alvo verdadeiro 23,6%) — de
    30,4% no início da onda. `CEU alto` 38,0%, `CEU baixo` 31,8%.
  - **menino de 485, fora da moldura:** MANHÃ **19 / 103 / 15** (luma/croma/dE), razões contra
    o rival 0,53 / 0,72 / 0,81, C\* dele / do quadro **1,52**. NOITE **40 / 8 / 3**, razões
    0,77 / 0,89 / 0,98, razão de croma **1,11**. **À NOITE ele está melhor do que esteve em
    toda a série; à MANHÃ a croma dele pagou 13 postos e está escrito.**
  - **fonte à NOITE:** poncho **123,4**, miolo 195,6, cristal 214,7, conjurando 250,5 — o
    Cetro segue a coisa mais quente de um quadro noturno, no dígito.
  - **arco doente→são:** DOENTE/MANHÃ luma **135,3** a C\* 9,6 contra SÃ **110,1** a C\*
    **18,9** — o doente segue mais CLARO e quase sem croma. À NOITE 78,0 / C\* 5,7 contra
    55,3 / 9,1.
  - **céu (`ceu.js`), MANHÃ:** céu 30,9% do quadro, nuvem 28,5% do céu, separação 52, C\* do
    céu **17,7** contra 16,9 do board na nossa proporção.
  - **smoke verde nos quatro commits, FPS 61, `sim.js` byte-idêntico**; `cruz.js` sem erro de
    console em três saúdes × quatro horas, e à NOITE as janelas acesas das fachadas que recuam
    viraram uma fiada de pontos quentes descendo a rua, que é o que o painel NOITE do board
    tem e nós não tínhamos.

  **O que ainda falta, sem maquiagem:** o quinto 2 (`124,9` contra 101) está praticamente
  intocado e continua a ser **49,6% de céu** — a cumeeira só entra nele entre x33 e x45, uma
  lasca de um quadro de 130 px de largura, e levantá-la mais é o experimento (a) que custou
  treze postos do menino. O quinto 3 fechou mas o PINTADO dele passou o do board por 5
  pontos, e baixá-lo é o experimento (b). **Próximo passo: esta série tem agora quatro
  refusals medidos que apontam todos para o mesmo sítio — largura da coluna (onda 14), segundo
  degrau da serra (onda 16), fachadas mais escuras e ponto de fuga deslocado (esta) — e o
  mecanismo é sempre o mesmo: qualquer massa nova entre a barra do HUD e a cabeça do menino
  compra perfil e vende o menino. O céu aberto está a 1,1 ponto do alvo verdadeiro e a croma
  a 1,2 do board. A recomendação honesta é PARAR de comprar perfil e ir consolidar: o que
  resta é do tamanho do ruído das próprias bancadas, e o único eixo que ainda anda sem custo
  é a croma do quadro, que quatro ondas mostraram poder subir junto com o valor.**

- **2026-08-03 · onda 19: a croma chegou ao número do board, e esta é a última onda da série.**
  Três incrementos que ficaram e três experimentos desfeitos, cada um com `node test/smoke.js`
  verde. **FPS 61 do começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado —
  **medido: `node test/sim.js` byte a byte idêntico nos três commits**.

  **O placar, `test/board.js`, quadro inteiro, contra o painel RUA DO BAIRRO:**

  |  | luma | C* | topo→chão | C* por quinto |
  |---|---|---|---|---|
  | BOARD | 90,1 | **19,5** | 141 101 83 60 66 | 18,7 19,0 20,4 17,7 21,6 |
  | JOGO MANHÃ antes | 111,2 | 18,3 | 136 125 105 105 85 | 15,5 17,4 16,1 21,0 21,5 |
  | JOGO MANHÃ depois | 111,3 | **19,5** | 136 125 105 106 85 | **17,5 18,7 17,0 22,1 22,3** |
  | JOGO TARDE depois | 116,5 | 25,5 | 132 129 117 113 91 | 19,9 20,9 26,6 30,6 29,4 |
  | JOGO NOITE depois | 56,0 | 8,5 | 59 61 58 56 45 | 9,8 10,5 8,3 7,8 6,3 |

  **A croma do quadro à MANHÃ está no número do board no dígito, e o perfil não se moveu
  (um ponto no quinto 4).** Os quintos 1, 2 e 3 subiram 2,0 / 1,3 / 0,9 e a NOITE ficou
  parada em tudo, que era a condição.

  **(1) Uma moldura baixada em valor e depois levantada pela luz do dia volta mais CINZA do
  que entrou.** O quinto de cima media **C\* 15,5 contra 18,7** e era a maior distância de
  croma que sobrava; o `quinto.js` atribui **40% desse quinto a sete entradas e as sete são
  proscênio** — `muroM/muroC/muroK/muroL` e `colunaC/colunaL/colunaB`. A onda 14 tomou a
  massa delas em VALOR de propósito, e é por isso que elas têm de continuar escuras; mas
  `luzDoDia()` soma ~+26 de luma chapados por cima, e somar o mesmo valor a três canais que
  já não estão longe um do outro é dessaturar. A croma residual é **reexpandida em torno da
  luma Rec.709 da própria entrada** — o movimento das ondas 12, 13, 15 e 16, valor move zero
  porque a expansão age sobre `c − y` e os pesos desse vetor somam zero. **Medido: C\* do
  quadro 18,3 → 19,5, por quinto 15,5 17,4 16,1 21,0 21,5 → 17,5 18,7 17,0 21,9 22,2, perfil
  136 125 105 105 85 → 136 125 105 106 85.**
  **E é ganho SÓ DE DIA, e isso é medido e não suposto** — a onda 15 rodou um ganho de croma
  liso no relógio e inverteu o que a onda 12 comprou. `escuridao()` é exatamente 0 à MANHÃ,
  então o dia sai inteiro e a NOITE fica no dígito: **8,5 e 59 61 58 56 45, iguais.**

  **(2) O ganho foi cobrado no menino na hora, e a resposta é a mesma de sempre: ele não
  dessatura com o mundo.** Com a moldura de volta à sua croma, a razão C\* dele / do quadro
  caiu **1,52 → 1,43 com os rivais de topo parados** — assinatura do CAMPO a subir, não dele
  a cair, exatamente a leitura das ondas 13 e 15 quando levantaram o piso dele para 1,32 e
  1,50. Piso **1,50 → 1,70**, neutro em luma como antes. **Medido, MANHÃ: C\* dele 29,1 →
  30,7 contra 20,5 do quadro, razão 1,43 → 1,50; croma 110 → 70 de 485 (a onda abriu em
  103), dE 15 → 13, luma 19 parada. NOITE: 40 / 4 / 1 contra 40 / 8 / 3, razão 1,11 → 1,19.**
  **Acima disso ele CEIFA:** a 1,78 a C\* mede 31,3 onde a razão pura pede 32,7, e ceifar é o
  que quebra a neutralidade de luma em que o movimento inteiro se apoia — o poncho lê
  **123,3** em vez de 123,4 e a luma dele à NOITE vai de 40 para 43. **O décimo do poncho fica
  registado: é o único número da lista de segurar que se moveu, e moveu-se por um dígito.**

  **Tentei e desfiz, os três medidos, e os três estão escritos no arquivo ao lado do botão
  que mexem:**
  **(a) O mesmo ganho a 1,25 nas seis frentes de meia-distância**, apontado ao quinto 3, que
  é a maior distância de croma que sobra (17,0 contra 20,4). **Caiu no quinto ERRADO: o 3 foi
  17,0 → 17,9 e o 4 foi 21,9 → 23,6**, e o 4 já estava 4,2 acima de um board que lê 17,7 ali,
  porque o quarto quinto do board é chão de cânion em sombra. O quadro passou para C\* 20,0 e
  **o menino pagou nos três eixos ao mesmo tempo (MANHÃ 19/70/13 → 21/81/14 de 485)**.
  Estreitado às duas entradas de parede, a forma é idêntica: 17,6 / 23,2 / 19,9 / 20-75-13.
  **(b) O mesmo ganho da moldura a 1,42 em vez de 1,30.** Compra o quinto de cima —
  **17,5 → 18,3 contra 18,7 do board**, e o segundo 18,7 → 19,2 — mas leva o quadro inteiro a
  **C\* 20,0, ou seja PASSA os 19,5 que perseguia**, e leva um posto de dE (13 → 14).
  **(c) A conclusão aritmética que fecha o quinto 3, e é a razão de não haver onda 20 de
  tinta ali:** aquele quinto é **32,1% de céu nu a C\* 17,7**, e o nosso céu já está **acima
  do céu do board (16,9 na nossa proporção)** — para o quinto chegar a 20,4 a TINTA dele teria
  de chegar a **21,7**, e as duas tentativas acima mostram o que isso custa. **É a mesma
  resposta que a onda 17 deu para o VALOR do mesmo quinto: enquadramento, não pincel.**

  **INSTANTÂNEO FINAL — todas as bancadas rodadas em sequência no commit que fecha a série:**
  - **perfil topo→chão, MANHÃ:** `136 125 105 106 85` contra `141 101 83 60 66` do board.
    TARDE `132 129 117 113 91`; NOITE `59 61 58 56 45`. Esq→dir MANHÃ `86 110 136 137 87`
    contra `63 86 115 125 61`.
  - **PINTADO (perfil menos o piso de céu), MANHÃ:** `100 83 87 103 85` contra `128 89 82 60
    66`. Só os quintos 1 e 4 têm tinta devendo, e o 4 tem a cabeça do menino.
  - **croma:** quadro MANHÃ **C\* 19,5 — o número do board, no dígito**. Por quinto
    **17,5 18,7 17,0 22,1 22,3** contra 18,7 19,0 20,4 17,7 21,6. TARDE 25,5. NOITE 8,5.
  - **céu por quinto (exato, `quinto.js`), MANHÃ:** 27,3 / 49,6 / 32,1 / 5,3 / 0,0% contra
    35,3 / 14,4 / 1,6 / 0,1 / 0,0 do board. Pisos aritméticos 48,1 / 73,4 / 44,8 / 7,2 / 0,0.
  - **céu aberto:** quadro inteiro **24,1%**, **visível 24,7%** (alvo verdadeiro 23,6%, lido
    no recorte 0,85:1). `CEU alto` 38,0%, `CEU baixo` 31,8%.
  - **céu (`ceu.js`), MANHÃ:** céu 30,9% do quadro, nuvem **28,1% do céu** contra 22,6% do
    board na nossa proporção, separação de valor **52** contra 47, **C\* do céu 17,7 contra
    16,9** — a única medida em que passamos o board, e é ela que agora limita o quinto 3.
  - **menino de 485, fora da moldura:** MANHÃ **19 / 70 / 13** (luma/croma/dE), razões contra
    o rival 0,53 / 0,71 / 0,82, C\* dele / do quadro **1,50**. NOITE **40 / 4 / 1**, razões
    0,77 / 0,96 / **1,02**, razão de croma **1,19**. **À NOITE ele é o bloco de dE mais forte
    do quadro inteiro, o que nunca aconteceu nesta série; à MANHÃ a croma dele está 33 postos
    à frente de onde a onda 18 a deixou.**
  - **fonte à NOITE:** poncho **123,3**, miolo **195,6**, cristal **214,7**, conjurando 250,5
    — o Cetro segue a coisa mais quente de um quadro noturno.
  - **arco doente→são:** DOENTE/MANHÃ luma **134,6** a C\* 9,9 contra SÃ **110,1** a C\*
    **20,2** — o doente segue **mais CLARO** e quase sem croma, o são mais escuro e saturado.
    À NOITE 78,0 / C\* 5,7 contra 55,3 / 9,1. **O arco ABRIU nesta onda: a distância de croma
    doente→são à MANHÃ foi de 9,3 para 10,3** (doente 9,6 → 9,9, são 18,9 → 20,2), porque um
    ganho sobre croma quase nula continua quase nulo — que era a promessa desta técnica desde
    a onda 15, e agora está medida nos dois extremos em vez de assumida.
  - **um regime de luz só:** NOITE média 55,6, p99,5 140,3, **0,22% acima de luma 150** —
    lâmpada, janela acesa e Cetro, e mais nada.
  - **smoke verde nos três commits, FPS 61, `sim.js` byte-idêntico**; `cruz.js` sem erro de
    console em três saúdes × quatro horas, com os doze prints olhados: a rua doente segue
    ocre lavada e mais clara, e a moldura mais saturada NÃO aparece na rua doente, que é
    exatamente o que a técnica prometia.

  ### ONDE ESTE BUILD REALMENTE ESTÁ CONTRA O BOARD

  **Chegou, e está medido:** a **croma do quadro** (19,5 contra 19,5), o **céu** em todos os
  eixos que o board dá para medir (fração de nuvem, separação de valor, croma do céu e da
  nuvem, tamanho das peças), o **céu aberto** a 1,1 ponto do alvo verdadeiro (24,7% contra
  23,6%), o **quinto 5** em valor e em croma (85/22,3 contra 66/21,6 — a única tira do fundo
  do quadro que é inteiramente pagável com tinta, e foi paga), a **tinta dos quintos 2 e 3**
  (PINTADO 83 e 87 contra 89 e 82), o **arco doente→são a rodar em saturação e não em brilho**
  com o doente mais claro, o **regime de luz único à NOITE**, e o **menino a ler primeiro em
  dE à NOITE**. Sete ondas atrás nenhuma destas frases tinha número.

  **Não chegou:** o **perfil vertical**, que é a espinha do board. Ele corre 141 101 83 60 66,
  uma queda contínua do céu ao chão; nós corremos 136 125 105 106 85, que é uma queda muito
  mais rasa com um patamar no meio. Os quintos 2, 3 e 4 estão 24, 22 e 46 pontos acima. E
  **não chegou o par esquerda→direita**: 86 110 136 137 87 contra 63 86 115 125 61, ou seja
  as bordas do board continuam a ser dois terços das nossas.

  **E isto é o que é estruturalmente inalcançável, com a atribuição feita e não com uma
  desculpa.** Aqueles 24, 22 e 46 pontos **não são tinta** — a onda 17 provou-o e a onda 19
  repetiu-o pelo eixo da croma: a nossa tinta nesses quintos já está igual ou mais escura que
  a do board. **A diferença inteira é FRAÇÃO DE CÉU.** O board tem 14,4% / 1,6% / 0,1% de céu
  nesses três quintos; nós temos 49,6% / 32,1% / 5,3%. O board é uma rua fotografada num
  prato **2,15:1 deitado, entre duas fachadas que saem do topo do quadro**; nós compomos um
  **0,85:1 em pé** por cima de uma rua que rola de lado. **Uma tela alta sobre um cenário que
  rola mostra mais céu — necessariamente, por geometria, não por escolha de paleta.** Os
  quatro caminhos conhecidos para fechar esse céu foram todos tentados e todos medidos:
  largura das colunas (onda 14), segundo degrau da serra (onda 16), fachadas mais escuras e
  ponto de fuga deslocado (onda 18), frentes mais saturadas (esta). **Os cinco falham pelo
  mesmo mecanismo, agora nomeado cinco vezes: qualquer massa nova entre a barra do HUD e a
  cabeça do menino compra perfil e vende o menino.** Ele é o único personagem do jogo; o
  perfil é uma média. A troca não vale, e recusá-la é a decisão, não a falha.

  **O que é inalcançável num renderizador de `fillRect` a 60 FPS num arquivo só,** e é
  honesto dizê-lo em vez de o deixar em aberto: o board é arte gerada com gradiente contínuo,
  oclusão ambiente, luz difusa e textura por pixel. Nós temos retângulos de cor chapada,
  algumas assadas em canvas offscreen, sem pós-processamento por decisão de direção. Isso põe
  um teto em três coisas: **(a) transição de valor** — cada plano nosso é um degrau, o board
  tem rampa, e é por isso que o nosso perfil tem patamar onde o dele tem queda; **(b) textura
  de superfície** — o calçamento do board tem grão por pedra, o nosso tem quatro faces e um
  fio de luz, e a quinta face custa uma chamada de desenho por pedra por quadro; **(c)
  densidade de objeto** — o board põe dezenas de coisas pequenas na rua e nós temos um
  orçamento de quadro, medido, de 61 FPS num telemóvel. Nenhuma das três se resolve com mais
  ondas de tinta. Resolvem-se com um renderizador diferente, e um renderizador diferente é
  outro projeto.

  **Um aviso para quem voltar a isto:** as bancadas medem o que medem. O `medir.js` pontua um
  bloco pelo espalhamento interno, e um bloco com um telhado, um vão e um peitoril dentro dele
  pontua alto sem estar visualmente errado; o `board.js` compara um painel 2,15:1 com um
  quadro 0,85:1 e a onda 15 já apanhou um alvo lido no recorte errado por quatro ondas
  seguidas; o `ceu.js` chama "nuvem" a mediana+22 e o limiar anda quando a população anda.
  **Três vezes nesta série o print recusou um número que estava bom, e as três vezes o print
  tinha razão.** A regra desde a onda 11 mantém-se e é a última linha desta série: **quando o
  número e o print discordarem, olhe para o print.**

  **Próximo passo: nenhum, nesta frente.** O visual chegou ao patamar que uma bancada pode
  defender e a fila da seção 6 do `CLAUDE.md` tem trabalho que move a pergunta das três dias,
  que é a pergunta que este repositório existe para responder. Quem abrir isto a seguir deve
  ler o parágrafo acima e ir para a lente **Medir**, não para o pincel.

- **2026-08-03 · onda 20: o cenário virou uma coisa nomeada com sete parâmetros, e a PRAÇA
  COMUNITÁRIA é a prova.** Três incrementos, cada um com `node test/smoke.js` verde. **FPS 61
  do começo ao fim.** Nada de `CFG`, `S`, fórmula ou economia foi tocado — **medido:
  `node test/sim.js` byte a byte idêntico nos três commits**.

  **(0) A regressão primeiro, porque a rua não podia pagar um pixel pelo refactor.**
  `test/igual.js` é novo: as mesmas doze células do `cruz.js` (três saúdes × quatro horas),
  o quadro congelado como todas as bancadas já congelam, **e mais o relógio (`tick`), o campo
  de partículas e os dados (`Math.random`) fixados** — sem isso o hash não repetia, porque a
  camada de clima sorteia cinza e folha **dentro** do mesmo `drawScene()` que depois as
  desenha. Saída: um SHA-1 por célula. Um pixel diferente em qualquer uma muda um hash.
  **Medido: doze hashes idênticos antes e depois da extração**, idênticos de novo depois de
  hoistar `serra()` e `faixaVerde()` para helpers compartilhados, e idênticos no fim da onda.

  **(1) A extração.** `drawScene()` tinha uma rua chumbada dentro dele. Agora desenha o que
  `CEN()` devolve, em sete ganchos — `fundo` (serras, faixa separadora, cidade, marcos),
  `meio` (o que preenche o vão entre a moldura), `veg`, `chao`, `segmentos` (os props, um
  desenho por segmento de 48px), `moldura` e `fios` — mais dois parâmetros de cor: `paleta`
  (overrides sobre a `PALETA_BASE`, resolvidos por cenário em `paletaCen()`) e `chaoCor` (as
  duas pontas da rampa da laje do chão). **Fica de fora de propósito, e é isso que faz o
  segundo cenário custar algumas centenas de linhas em vez de um segundo jogo:** o céu e as
  quatro horas, as nuvens e o cirro, o clima que carrega o ritmo, o campo de partículas, o
  menino, os monstros e a HUD. Cenário é lugar, não renderizador. A chave de cache da paleta,
  do céu e do chão passou a carregar o nome do cenário — **como texto e não empacotado num
  número**, que é a armadilha que a correção do relógio na `main` acabou de pagar.

  **(2) O merge da `main` (correção do strobe do fundo) entrou no meio da onda e as duas
  correções dela vivem exatamente no código que eu estava movendo.** Conferido do jeito que
  importa: **o `index.html` mesclado desenha as doze células pixel a pixel iguais às do
  `index.html` da `main`** (mesma bancada `igual.js`, rodada nos dois). O `acendeu(semente)`
  e o `topoCol()` por coluna estão dentro do gancho `meio` da rua. E o aviso da coordenação
  virou regra escrita no cenário novo: **o envelope da praça é de tela e o tecido é de mundo,
  e nada que ladrilha lê o próprio tamanho do envelope** — a fiada de casas e o anel de copas
  tiram altura do hash do bloco, nunca de onde o bloco está na tela.

  **(3) PRAÇA COMUNITÁRIA, lida do painel dela e não de memória.** `test/board.js` agora
  recorta o painel do cenário que se está medindo (`CEN=praca`), e os painéis da tira não têm
  largura igual — as frestas medem em x 16, 248, 466, 682, 876, 1064, 1285 e 1518.
  **O painel PRAÇA: luma 76,1 a C\* 19,3** contra 90,1 / 19,5 da RUA, **perfil topo→chão
  93 75 77 65 72** contra 141 101 83 60 66, **esq→dir 87 92 80 64 58** contra 63 86 115 125 61,
  **céu por quinto 12,0 / 8,9 / 0,9 / 0 / 0** contra 35,3 / 14,4 / 1,6 / 0,1 / 0. Ou seja: a
  praça é **mais escura em cima** (uma copa só por cima dela em vez de uma fresta de céu), a
  croma dela **sobe** em direção ao chão (16,6 → 24,3 por quintos) e ela é iluminada pela
  **esquerda** com a massa da árvore à direita. Foi isso que eu construí, nesta ordem:
  chão de terra batida com lajes gastas (mesma rampa de sombra por fiada da rua, com a croma
  reexpandida em torno da luma Rec.709 do resultado), a borda construída **plana** (uma praça
  não tem ponto de fuga; a rua tem), **o anel de copas** que fecha o meio onde a rua fecha com
  as fachadas que recuam, a fileira de barracas, a gente, **a árvore que a praça tem no meio**
  — nua quando o mundo está doente, com fruta quando não está — e **uma copa por cima em vez
  de duas colunas dos lados**.

  **O placar, `test/board.js`, quadro inteiro, os dois cenários contra os dois painéis:**

  |  | luma | C* | topo→chão | céu por quinto (exato) |
  |---|---|---|---|---|
  | BOARD RUA | 90,1 | 19,5 | 141 101 83 60 66 | 35,3 14,4 1,6 0,1 0,0 |
  | JOGO RUA MANHÃ | 110,6 | **19,6** | 137 124 104 104 85 | 27,3 46,3 27,1 3,6 0,0 |
  | BOARD PRAÇA | 76,1 | 19,3 | 93 75 77 65 72 | 12,0 8,9 0,9 0,0 0,0 |
  | JOGO PRAÇA MANHÃ | 108,1 | **21,1** | **87** 122 124 116 91 | **3,0** 36,1 35,5 26,0 0,0 |

  **O quinto de cima da praça sai em 87 contra os 93 do painel — a única tira desta série que
  passou o board — e o céu nu dele em 3,0% contra 12,0%.** TARDE 116,1 / 27,8; NOITE 56,5 /
  7,9. Céu aberto no visível: **praça 20,8% contra rua 22,7%**.

  **O menino, medido nos dois lugares** (`test/medir.js`, pior caso, luma/croma/dE, fora da
  moldura): **RUA MANHÃ 19 / 66 / 13 de 485** e **NOITE 44 / 1 / 1**; **PRAÇA MANHÃ 59 / 110 /
  31 de 413** e **NOITE 95 / 8 / 16**. Ele lê **pior na praça, e a atribuição está feita**: um
  mercado, uma multidão e um anel de copas são um quadro mais cheio que um corredor entre duas
  fachadas, e os rivais que a bancada nomeia são as barracas em (100,158) e a barriga da copa
  em (60..85, 128..143). O que **não** mudou é ele: a nota absoluta dele é **41,0 na praça
  contra 41,8 na rua** na luma e **29,0 contra 28,9** no dE — o campo subiu, ele não caiu.
  Razão C\* dele / do quadro **1,33 na praça** e 1,51 na rua; à NOITE ele é **8/413 em croma**,
  o que é a mesma frase da rua com outro cenário embaixo.
  **A bancada teve de aprender uma coisa para essa comparação existir:** a exclusão da moldura
  era **de rua** (duas colunas laterais e dezesseis linhas no topo). A praça é emoldurada **por
  cima**, então a mesma regra contava a moldura dela como prop disputando o olho. O cenário
  agora **declara a própria extensão** (`molduraAte(x)`) e o `medir.js` lê isso; para a rua a
  função devolve os mesmos 16 de sempre e **a rua não se move um dígito**.

  **Segurado nos dois cenários:** poncho **123,3** à NOITE no dígito, miolo 195,6 e cristal
  214,7 — o Cetro segue a coisa mais quente de um quadro noturno **também na praça**; um
  regime de luz só (NOITE p99,5 **142,7** e 0,48% acima de luma 150, contra 140,3 e 0,21% da
  rua); e o arco doente→são rodando em **saturação** com o doente **mais claro** (PRAÇA
  DOENTE/MANHÃ **131,7** a C\* 10,7 contra SÃ **100,2** a C\* 21,8).

  **Tentei e desfiz, os cinco medidos:**
  **(a) Copa preenchendo cada coluna sólida.** O número fecha o quadro e **o print recusou**:
  uma laje verde chapada em cima de dois postes. Um quinto das colunas passou a ser cortado em
  duas com o contorno acompanhando o corte — é o buraco que faz folha ler como folha.
  **(b) O anel de copas preenchido até uma linha fixa em `GROUND-30`.** Fechava a faixa e
  saía uma **sebe com bainha reta**; a copa virou copa e o tronco desceu com ela.
  **(c) Dois galhos horizontais no tronco grande**, que é como a árvore pequena da rua faz.
  Naquela espessura de tronco o print leu **travessa de poste** — e a rua já tem postes.
  **(d) A bainha da copa acesa de ponta a ponta.** Os três blocos mais fortes do quadro inteiro
  caíam em cima dela, em y33-38: linha reta comprida contra céu aberto é justamente o mecanismo
  que as ondas 16 e 18 pagaram duas vezes. Acesa só onde `quina > 0,30`, e a bainha passou a
  ser **mordida por coluna** (um dente de hash) em vez de ondulada por senos.
  **(e) Lâmpadas do varal a `#fde79d`.** L 226, ou seja **acima do miolo do Cetro (195,6) e do
  cristal (214,7)** — o percentil 99,5 do quadro noturno foi a 183,6 contra os 140,3 da rua.
  A L 168 continuam inconfundivelmente lâmpadas e ficam **debaixo** da varinha.

  **O que a abstração ainda NÃO expressa, sem maquiagem.** (i) **A HUD não sabe onde você
  está**: a barra de progresso diz `STREET n%` numa praça, e o texto é do jogo e não do
  cenário. (ii) **O céu é um só**: `HORAS` e o `skyCanvas` são globais, então uma ORLA ou um
  CERRADO — que no board têm céu próprio — só conseguiriam mudar a rampa por cima da paleta,
  não a rampa em si. (iii) **`GROUND` e `HX` são do jogo, não do lugar**: qualquer cenário com
  outra linha de horizonte encosta em colisão. (iv) **A camada do mundo é fixa**: monstros,
  drops, a panela e os NPCs de rua saem do `desenharMundo()`, que nenhum cenário vê — o que é
  a razão de a praça não ter custado nenhuma mecânica, mas também significa que um cenário não
  pode dizer "aqui as pessoas ficam em outro lugar". (v) **Não há troca**: `setCenario()` é
  gancho de depuração, não existe caminho de jogador, e isso é de propósito — como o jogador
  encontra um cenário é desenho e é do dono.

  **Medido no fim:** smoke verde nos três commits, **FPS 61**, `sim.js` idêntico, `igual.js`
  com a rua pixel a pixel igual, `cruz.js` sem erro de console em três saúdes × quatro horas
  nos **dois** cenários (vinte e quatro prints, olhados).
  **Próximo passo: a maior distância medida que sobra na praça são os quintos 2 e 3 —
  122 e 124 contra 75 e 77 do painel — e o `quinto.js` já diz que é a mesma história da rua:
  36,1% e 35,5% daquelas tiras ainda são céu nu, e o PINTADO delas (95 e 113) está acima do
  board (65 e 75). Fechar aquilo é pôr massa entre a barra da HUD e a cabeça do menino, que é
  o mecanismo que esta série recusou cinco vezes — e desta vez a copa por cima foi a exceção,
  porque comprou o quadro E o menino ao mesmo tempo. Dúvida honesta: não sei se isso se
  repete uma segunda vez ou se a copa só pagou porque estava a 150 px acima dele.**


- **2026-08-03 · onda 21: o céu virou do cenário, a MATA ATLÂNTICA nasceu — e no meio da onda
  o dono disse "cadê o Brasil?" e a moldura passou a ser o assunto.** Cinco commits, todos com
  `node test/smoke.js` verde e **FPS 61**, `node test/sim.js` **byte a byte idêntico** do
  começo ao fim. `CFG`, economia, alvo do prestígio e curva de custo: intocados.

  **(1) O CÉU PASSOU A SER DO LUGAR, e a rua não pagou um pixel por isso.** A onda 20 fechou
  nomeando este bloqueio: `HORAS` e o `skyCanvas` eram globais, então uma ORLA ou um CERRADO só
  conseguiam tingir a rampa da rua. A divisão é a mesma que a abstração de cenário já faz em
  todo o resto: **o RELÓGIO continua do jogo** (as quatro horas, quanto escurece, a luz que cai
  em cada sólido — um regime de luz só é regra da direção) e **o CÉU passa a ser do lugar**:
  a rampa sã de cinco paradas, uma rampa de cinco paradas por hora, o expoente da queda até o
  horizonte, quanto da hora entra, o ganho de croma diurno, onde fica o sol e de que tamanho,
  quantas estrelas, **se há nuvem** e a cor em que a distância se dissolve. O `CEU_PADRAO` traz
  os números da RUA escritos como as MESMAS expressões que estavam inline — nada de `lerp(a,b)`
  onde antes havia `0.30 + 0.55*h`, porque `0.85-0.30` não é `0.55` em ponto flutuante.
  **Medido: `test/igual.js` imprimiu os mesmos doze hashes para a RUA e os mesmos doze para a
  PRAÇA depois da extração.**

  **(2) MATA ATLÂNTICA, lida do painel dela — e os recortes do board estavam errados desde a
  onda 11.** Uma varredura de linhas e colunas no board diz que a área pintada de todo painel da
  tira é `y 728..852` e que as bordas verticais estão em x 17, 246, 467, 681, 865. As janelas
  que as ondas 11-20 usaram (`18,724,228,106` e `252,724,212,106`) carregam **quatro linhas do
  passe-partout creme a L 227** e a da RUA ainda entra **oito colunas dentro do painel da
  PRAÇA**. Quatro linhas de L 227 em 106 valem uns cinco pontos de luma num número que a série
  inteira perseguiu por três. Recortes corrigidos, e os alvos mudam:
  **BOARD RUA 90,1 → 81,4** (C\* 19,5 → 18,9), **BOARD PRAÇA 76,1 → 72,9** (19,3 → 20,1),
  **BOARD ORLA 104,5 / 19,9**, **BOARD MATA 53,1 / 17,4**.

  O painel da mata: perfil topo→chão **51 62 57 48 47**, esq→dir **47 49 78 57 35**,
  **céu por quinto 0,5 / 0 / 0 / 0 / 0,4** — não há céu nenhum ali, e a coisa mais clara é a
  clareira no fim da trilha, [149,150,87]. Então a rampa desta mata corre **ao contrário de
  todas as outras do arquivo**: quatro das cinco paradas abaixo de L 90, `curva` 1,80, `nuvem`
  0 (um cúmulo passando por um buraco na copa não é atmosfera, é um bug que dá pra ver), sol
  pequeno dentro da clareira, e a distância se dissolvendo em **ar verde escuro** e não na luz
  da clareira. **Medido, MANHÃ, quadro contra painel: luma 71,8 contra 53,1** (a rua lê 110,5
  contra os 81,4 dela — a mesma razão de 1,35), **C\* 18,0 contra 17,4**, perfil 58 68 79 90 64,
  e **céu aberto 0,0% em todos os cinco quintos** contra 0,5/0/0/0/0,4 do painel: **o primeiro
  cenário desta série sem céu nu em lugar nenhum.** TARDE 83,7 / 26,3; NOITE 39,9 / 6,7.

  **Cinco tentativas desfeitas na mata, todas recusadas pelo print:** (a) o eixo de luz a alpha
  0,86 abrindo em `GROUND·0,28` — um holofote, quadro a 122 contra um painel de 53; (b) uma
  faixa de `mataFar` a 55% de alpha atravessando o meio — um filme por cima do quadro inteiro;
  (c) uma copa por bloco em dois planos, cada uma com um tronco inteiro até o chão — **um
  renque de tubos de órgão**; (d) uma elipse chapada por bloco — pingos pendurados no nada;
  (e) fissuras horizontais nos troncos de frente — **uma escada**. A que ficou: copas como
  união de cinco lóbulos por coluna, quatro tons sorteados por coluna, **um buraco em cada
  cinco colunas** (toda folha daquele board é definida por um vão e não por um contorno) e um
  pixel de luz salpicado — sem o salpico, uma massa verde é uma sebe por melhor que seja a
  silhueta.

  **(3) A MOLDURA ESTAVA COMENDO O MUNDO, E ISSO É UMA FALHA DE MEDIÇÃO.** No meio da onda o
  dono escreveu *"cadê o Brasil, os cenários de brasilidades e as referências??"*. Estava tudo
  desenhado — o maciço com a figura, o elevador do penhasco, a matriz, o arcade, o morro
  pintado, a cidade sendo reconstruída — e nada dava pra ver. **A causa é minha bancada, não o
  desenho:** as ondas 11 a 14 tinham **um número de enquadramento só** — céu aberto contra
  23,6% — e todo jeito barato de mexer nesse número é pôr massa na frente do céu. A moldura
  cresceu onda após onda, cada passo medido, cada passo uma melhora pela única medida que
  existia, e **ninguém nunca perguntou quanto sobrava de MUNDO**. Dois prints recusaram um túnel
  e foram vencidos pelos números das ondas seguintes.

  **`test/mundo.js` é o número contrário.** A moldura é medida **exatamente**: o quadro é
  desenhado duas vezes, uma com o gancho `moldura` do cenário e outra sem, e os pixels que
  diferem SÃO a moldura — nada de heurística, nada de supor onde ela está. Céu nu contra o
  `skyCanvas` como o `quinto.js` faz. O resto é o jogo. Mais uma contagem por família (marco,
  morro, cidade, rua, serra), porque *"a matriz está desenhada"* e *"dá pra ver a matriz"* são
  afirmações diferentes e só a segunda vale alguma coisa. Cinco posições de mundo × dois níveis
  de saúde. **Medido, antes → depois:**

  | | antes | depois |
  |---|---|---|
  | **MUNDO%** (o que é jogo) | 50,8 | **57,3** |
  | moldura% | 24,4 | **20,3** |
  | céu nu% | 24,9 | **22,3** |
  | matriz visível | 4/10 quadros, 0,75% do quadro | **8/10, 5,8%** |
  | morro visível | 4/10, 0,86% | **10/10, 0,98%** |

  O que mexeu: o inchaço das colunas **0,16·W → 0,075·W** (a BASE não se mexe — está limitada
  pela fila de monstros e a onda 14 mediu esse limite); a copa **0,72·W sobre 0,34·W → 0,40·W
  sobre 0,26·W**, então as quinas continuam escuras (o ganho de valor da onda 14 era real) e
  deixam de ser um terço do quadro; **marcos a cada 210 px em vez de 460 e desenhados a 1,55×**;
  o morro com casa um terço maior, encosta metade mais alta, presente em 78% dos trechos em vez
  de 38%, a cada 230 px em vez de 340; a cidade a cada 250 em vez de 420.
  **E o céu aberto NÃO subiu — desceu**: `medir.js`, na janela dele, 22,7% → **17,5%**, com o
  `CEU baixo` indo de 22,9% para **7,4%**. O jeito honesto de fechar céu é **pôr o lugar
  dentro dele**, não construir um muro na beirada. O menino paga o campo mais cheio de dia e
  está registrado: MANHÃ luma 19 → 15 de 485, croma 66 → 78, dE 13 → 11.

  **(4) O JUDDER DO SCROLL É A MESMA MOLDURA — E É UM CONFLITO DE PROJETO, NÃO UM BUG.**
  Medido com `scratchpad/scroll.js`: **a câmera é lisa, 0,823 px de mundo por frame com 0,4% de
  variação**. O que treme é a quantização: 1 px de mundo = **2,44 px de tela**, e cada camada de
  parallaxe anda um número inteiro de pixels de mundo por frame. Passo por frame em 120 frames:
  camada 0,05 → `{0:114, 1:5}`; 0,15 → `{0:94, 1:25}`; 0,42 → `{0:78, 1:41}`;
  0,66 → `{0:55, 1:64}`; 1,00 → `{0:21, 1:98}`. **Nenhuma delas anda regularmente** — todas
  alternam 0 e 1 de forma irregular, e cada troca é um salto de 2,44 px de tela. Não é defeito
  de uma camada: é o tamanho do pixel contra a velocidade da câmera.
  **Conclusão, e ela é do dono:** rolagem contínua tipo One Piece e o pixel atual estão em
  conflito direto. Desenhar em posição fracionária faz o canvas antisserrilhar a arte (a direção
  proíbe pós-processamento); resolução interna mais fina reduz o salto de 2,44 px para 1,63 px
  em `SCALE 2` mas **não** torna o passo regular, e custa o pixel grosso. O que esta onda fez de
  concreto é **encolher a área que treme**: a moldura era a camada mais lenta e mais próxima e
  saiu de 24,4% para 20,3% do quadro. Fica registrado para o dono escolher.

  **(5) Três recados do dono, todos de apresentação, nenhum tocando lógica.**
  **(a) Barra de vida vermelha no lugar dos pontinhos brancos.** Lê `m.hp`/`m.hpMax` e nada
  mais. Uma largura só para todo monstro, porque com pips o COMPRIMENTO da barra era o hp
  máximo e isso lê como "esse é mais largo" e não como "esse aguenta mais". **E isso conserta
  um defeito que uma onda anterior só tinha conseguido remendar: `medir.js`, PIPS NOITE, o que
  os monstros põem no quadro acima de luma 150 vai de 108 px para 0 px, e o posto do menino à
  NOITE em luma vai de 52 para 8 de 485** — os pips brancos eram rivais dele. Poncho 123,3,
  miolo 195,6, cristal 214,7, tudo no dígito.
  **(b) Os bichos parados agora animam.** Cada um é o próprio estrago: a fumaça arrota e engrossa
  o ar em volta, o tambor vaza e a poça cresce e encolhe embaixo dele, o saco de dinheiro treme
  e joga moeda fora. Roda em `m.parado` e `tick` e mais nada.
  **(c) O drop é a coisa que ele te dá.** Pegar um drop dá impacto, e impacto já tem um glifo —
  a folha do contador do HUD. Três itens lindos que não são aquele glifo ensinam que existem três
  moedas quando existe uma. O drop agora é **o ícone do HUD, o mesmo mapa, as mesmas cores, o
  mesmo contorno**, mais um "+" no ouro ACENTO (o creme do chrome mede L 244 e poria um drop
  acima do cristal do Cetro à noite). Qual bicho deixou continua sendo dito pela cor dos quatro
  tracinhos e pela palavra que pula ao pegar.

  **Fora do meu território a partir do meio da onda:** o sprite do herói, o Cetro e os visuais
  de conjuração/combo passaram para um agente dedicado. **Eu tinha começado a simplificar o
  `lancarMagia` e o bloco de magia do `drawHero()` e revertí tudo com `git checkout`** assim que
  o recado chegou — nada disso está nos commits.

  **Medido no fim:** smoke verde nos cinco commits, **FPS 61**, `sim.js` idêntico, `cruz.js` sem
  erro de console em três saúdes × quatro horas nos **três** cenários, e o `igual.js` **rebaseado
  de propósito** para rua e praça (a rua mudou de moldura e as três mudanças de monstro/drop
  valem em todo cenário — os hashes novos estão no commit e valem como novo ponto de partida).
  **Próximo passo: ORLA, que ficou parada quando o recado do dono chegou. O painel dela já está
  medido (`BOARD ORLA 104,5 / 19,9, perfil 126 126 94 93 83, céu por quinto 60,6/13,9/3,4/3,6/0`)
  e o céu por cenário — que era o bloqueio — está feito. Dúvida honesta que sobra: o `mundo.js`
  ainda não sabe distinguir "moldura" de "moldura que É o cenário" — na PRAÇA e na MATA a copa
  por cima conta como moldura e ela é o lugar, então o 20,3% da rua não se compara direto com o
  número delas.**

## Would cut with one more day

The REAL DATA rotation (keep one fixed) and the snow caps. ~~The `confirm()` on the
torch~~ — done: PASS THE TORCH? is now a sheet like the others, and unlike a browser
dialog it can show what you keep beside what you hand on.
