# LAVA — Launch Recommendation

Honest headline: software is never truly "perfect," but this is now in good shape to launch,
with **one thing you must decide on first** (candidate-data security). Everything below is
either done for you or a clear, short action.

## Done in this pass (safe, app still builds & runs)
- **Natural voice** — reworked so the AI uses the best available human-sounding voice, with
  natural pauses instead of a flat robotic read. (see VOICE_AND_FIXES.md)
- **Type safety** — `npm run typecheck` now passes with **0 errors** (was 30+), including a
  broken import that could have crashed a module.
- **Faster load** — routes are code-split, so the first load is ~96 KB gzipped instead of a
  single ~360 KB bundle. Each page loads on demand.
- **Browser guard** — the landing page now warns candidates who open it in a browser without
  live speech recognition (Firefox, some Safari), so they don't take an invalid assessment.
- **Admin passcode** moved out of the source into an env var (`VITE_ADMIN_CODE`).
- **`.env.example`** added; `.env` confirmed git-ignored.

## MUST decide before you go live (security of candidate data)
The app talks to Supabase with a public key that ships in the browser, and the database
currently lets anyone with that key read / change / delete **all** candidate records. The
`/admin` page is protected only by a passcode that is visible in the shipped code.

For an internal demo or a controlled pilot with a handful of trusted users, that may be
acceptable for now. For a public launch where real candidates enter personal data, it is not.

Fastest safe paths:
1. **Apply the included migration** `supabase/migrations/20260716160000_harden_rls_for_launch.sql`
   (removes anonymous deletes). One paste into the Supabase SQL editor.
2. **Add Supabase Auth for staff**, and restrict the admin/report tables to logged-in staff.
   This is the real fix and the only way to truly protect candidate PII. Budget a little time
   for it — it's the main thing standing between "demo-ready" and "public-launch-ready."

## 5-minute pre-launch checklist
- [ ] Set `VITE_ADMIN_CODE` to a strong value in your host's env settings.
- [ ] Confirm `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set in the host (not the repo).
- [ ] Run the RLS migration above.
- [ ] Serve over HTTPS (the microphone / speech APIs require a secure origin).
- [ ] Test one full run in Chrome and in Edge (best voice + recognition support).
- [ ] Decide on the admin-auth plan above.

## Run locally
```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run typecheck  # should report 0 errors
```
