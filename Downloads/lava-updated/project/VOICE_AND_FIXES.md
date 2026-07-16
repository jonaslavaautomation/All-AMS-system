# LAVA — Improvements Summary

## 1. Natural AI voice (main request)
The app uses the browser's built-in Web Speech API for the "AI voice." The old code
picked *any* English voice it found first, which on most machines is a robotic system
voice (e.g. Microsoft David/Zira). That's why it sounded like a machine.

`src/lib/speech.ts` was rewritten to sound human while keeping the exact same functions
(nothing else in the app had to change):

- **Smart voice selection.** Voices are now scored and the most natural one is chosen.
  It strongly prefers modern neural voices ("Natural", "Neural", "Online", Google, Apple
  premium / Siri) and penalises the classic robotic ones.
- **Prefers cloud/neural voices** (`localService === false`), which are the human-sounding ones.
- **Natural delivery.** Long text is split into sentences with small breath-pauses instead of
  one flat monotone run-on. Default rate/pitch nudged to human-like values (0.98 / 1.02).
- **Reliable voice loading.** Fixes the Chrome bug where voices load asynchronously and the
  first attempt would fall back to a robotic default.

### Important note on the ceiling
Web Speech API quality depends on the device/browser:
- Edge / Windows: excellent (Microsoft "Online (Natural)" neural voices)
- Chrome desktop: good ("Google" voices)
- macOS / iOS Safari: very good (premium / Siri voices)
- Older Android / some Linux: still limited

For a *guaranteed* human voice on every device, use a cloud neural TTS
(ElevenLabs, Azure Neural, OpenAI, Google Cloud). That needs an API key + a tiny server
proxy (the key can't live in the browser). The code is structured so this can be plugged in
later without touching the rest of the app — ask if you'd like it wired up.

## 2. Bug fixes (kept everything running, made it cleaner)
`npm run typecheck` went from **30+ errors to 0**. `npm run build` still succeeds.

- Removed a broken import (`getTransitionLine` was imported from the wrong module; the real
  one lives in `personalityEngine`). This was dead code that could have caused a crash.
- Corrected the stored-data types (`responses`, `emotionSummary`) so they honestly match what
  the modules save — fixed 3 real type errors with zero runtime change.
- Cleaned up ~20 unused imports/variables/parameters across modules, pages and lib files.

## 3. Still open (optional — not done, to avoid risk)
- **Lint:** ~50 pre-existing `no-explicit-any` errors. Cosmetic; doesn't affect running.
  Can be typed properly on request.
- **Bundle size:** one 1.2 MB JS chunk. Could be code-split with dynamic `import()` /
  `manualChunks` for faster loads.
- **Security:** `.env` (with the Supabase anon key) is committed and not in `.gitignore`.
  The anon key is designed to be public, but committing `.env` is still bad practice.
