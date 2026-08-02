# NOTES — Save the World (3-day prototype)

## Loop

Generator cost `15 × 1.15^n`. **GO FAST** 3/s per project (6 with Big campaigns);
**GO STEADY** 1/s ramping to 2/s over 120s (4/s and 2× ramp with Team training);
switching modes resets the ramp. Tiredness: `+0.15/s` per project in fast mode
(×1.5 with U1), heals ~0.5%/s — solved in closed form
(`p = eq + (p − eq)·e^(−kt)`, `eq = emission/k`, `k = −ln(1 − decay)`), so the same
equation covers offline time. Team health `= 100/(100+tiredness)` multiplies **all**
output, taps included. Torch at 50K total impact: `wisdom = ⌊√(total/2500) × health⌋`,
+10% forever per point. Offline: rate at save time, 12h cap.

## Upgrades (7)

| # | name | cost | effect |
|---|---|---|---|
| U1 | Big campaigns | 100 | 2× fast output, 1.5× tiredness |
| U2 | Friends help friends | 400 | each tap heals 2 tiredness |
| U3 | Team training | 1,200 | steady ramps 2× faster, cap 4/s |
| U4 | Neighbors join in | 3,000 | auto-taps 2/s, no input needed |
| U5 | Better tools for all | 8,000 | every tap counts 3× |
| U6 | Fair share | 18,000 | +30% to production *and* taps |
| U7 | Rest days | 30,000 | tiredness heals 3× faster |

All seven reset on prestige. Old saves without `u4..u7` load fine (missing keys read
as falsy).

## Feel

Taps chain a 3-hit combo: horizontal slash → rising slash → **leap slam** (hero jumps
~26px, drives the sword down, lands with a white flash, an expanding shockwave and
cracked dirt). Holding the main button repeats at ~7 hits/s. Sprouts are capped at 40
so holding in steady mode doesn't flood the scene.

Presentation: fullscreen pixel side-scroller. The world renders at 1 world px = 2 screen
px; hero and monsters are drawn at 2× on top of that, so they read as chunky sprites
over a fine-grained world. Everything (sky bands, mountains, city windows, foliage,
ponds, community kitchens) lerps from sick to healthy off `worldHealth()`. Menus are
floating sheets above the character; type scales with `clamp()`.

## Open questions

1. Offline gain uses efficiency at save time — a long dirty offline run overpays.
2. First torch may pass 40 min if played 100% steady; not simulated end to end.
3. With U4 + U5 + U6 stacked, taps may outpace projects entirely — worth watching
   whether that flattens the "build projects" decision.
4. Hold-to-attack at 7/s was picked by feel, not tuned against retention.

## Would cut with one more day

The REAL DATA rotation (keep one fixed), the snow caps, and the `confirm()` on the
torch — a proper in-game panel would be better than a browser dialog.
