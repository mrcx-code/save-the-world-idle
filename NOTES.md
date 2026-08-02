# NOTES — Save the World (3-day prototype)

Loop (unchanged since v1, tested): generator cost 15×1.15^n. GO FAST 3/s per project (6 with Big campaigns); GO STEADY 1/s ramping to 2/s in 120s (4/s and 2× ramp with Team training); switching resets the ramp. Tiredness: +0.15/s per project in fast mode (×1.5 with U1), heals ~0.5%/s (closed-form ODE, works offline too). Team health = 100/(100+tiredness) multiplies ALL output. Torch at 50K total: wisdom = ⌊√(total/2500)×health⌋, +10% forever each. Offline: rate at save time, 12h cap.

Presentation: fullscreen pixel side-scroller (canvas, 1 px = 3 screen px, resolution follows screen shape), hero runs and acts, floating +N numbers, project buildings (factories in fast / windmills in steady), world heals visually (WORLD FIXED %), menus are floating sheets over the game. Responsive type via clamp().

Open questions: (1) offline gain uses save-time efficiency — long dirty offline runs overpay; (2) first torch may pass 40 min if played 100% steady; (3) sprout/tap feedback may need more juice (sound is out of scope).

Would cut with one more day: the REAL DATA rotation (keep one), snow caps, the confirm() dialog on torch.
