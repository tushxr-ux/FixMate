# Legacy prototype (not part of the shipped app)

These files are the pre-React prototype that used to live at the repo root.
They are NOT imported, routed, or served by the real app in `fixmate-app/`
(the Vercel build outputs `fixmate-app/dist` only), so they were moved here
intact on 3 November 2026 during a local cleanup — nothing was deleted.

- `fixmate_prototype.html` — original single-file prototype
- `checklist.html` — implementation checklist (formerly linked from the
  Profile screen; that link was removed because the Vite app has no
  `/checklist` route and never served this file)
- `css/main.css`, `js/app.js`, `js/store.js` — the prototype's assets

To restore them to the repo root, move this folder's contents back
(`git mv` preserves history). Do not re-add them to the Vite build.
