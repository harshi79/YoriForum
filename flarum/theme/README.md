# 🎨 YoriForum theme (no-code-install edition)

No Composer rebuilds, no SSH — everything applies **from the browser** in 5 minutes. Perfect for free shared hosting.

## Install (5 min)

1. **Logo + favicon:** Admin → Appearance → upload `assets/logo.png` as both Logo and Favicon.
2. **Theme:** Admin → Appearance → Custom LESS → paste the whole `yoriforum.less` → Save.
3. **Footer:** Admin → Extensions → Custom Footer → paste `custom-footer.html` → replace the `#telegram` / `#discord` links with your real invites → Save.
4. **Check:** hard-refresh (Ctrl+Shift+R). Toggle Night Mode — theme adapts (see note below).

## Files

| File | What |
|---|---|
| `yoriforum.less` | Full visual theme (plain CSS — header, buttons, cards, tags, posts, mobile, dark scope) |
| `custom-footer.html` | Footer columns + TG/Discord buttons + tiny JS (back-to-top, external links) |
| `README.md` | This guide |

## Tweaking

- **Colors:** edit the `:root` variables at the top of the LESS (`--yori-accent` etc.) and re-paste.
- **Dark scope:** the dark rules target `nightmode`/`dark` classes on `<html>`/`<body>`. If night mode is ON but the dark base doesn't apply: press F12, look at the `<body class="...">`, and replace the selectors in the "dark base" block with the real class. 2-minute fix, then it works forever.
- **JS:** the footer `<script>` is vanilla and guarded — it silently does nothing if elements are missing. Safe to delete if you don't want it.

## Later (optional pro path)

If you ever move to a VPS: convert this into a real theme extension (`flarum/theme` + `extend.php` registering the LESS/JS) so updates don't touch it. Until then, keep a copy of these files — re-paste after major Flarum upgrades if needed.
