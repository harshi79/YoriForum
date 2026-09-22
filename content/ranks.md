# 🏆 YoriForum rank ladder (for Admin → Gamification)

Type these into **fof/gamification** rank settings. Points = activity + upvotes/reactions received (tune thresholds after ~1 month of real data).

| # | Rank | Points | Badge color | Emoji |
|---|---|---|---|---|
| 1 | Newbie | 0 | `#9aa3b8` (grey) | 🌱 |
| 2 | Member | 50 | `#22c55e` (green) | 👤 |
| 3 | Regular | 200 | `#06b6d4` (cyan) | 💬 |
| 4 | Veteran | 500 | `#f59e0b` (amber) | 🔥 |
| 5 | Elite | 1,000 | `#ec4899` (pink) | 💎 |
| 6 | Legend | 2,500 | `#8b5cf6` (violet) | 👑 |

## Staff groups (Admin → Groups, separate from ranks)
| Group | Color | Emoji | Notes |
|---|---|---|---|
| Mod | `#3b82f6` (blue) | 🛡 | lock/sticky/split/merge/suspend/approve |
| Admin | `#ef4444` (red) | ⚡ | everything. Max 1–2 humans. |

## Suggested perks (manual, monthly review)
- **Veteran+**: access to a private "Lounge" tag (create tag, limit visibility to a Veteran group you maintain).
- **Elite+**: custom user title on request.
- **Legend**: pick an emoji reaction to add + hall-of-fame mention in Announcements.
- Top monthly contributor (most Best Answers): shoutout thread. Costs $0, motivates a lot.

## Anti-farming notes
- Keep `fof/anti-spam` + first-post approval ON.
- If someone's points jump impossibly fast, check their voters for alt accounts (same signup IP/time pattern) → reset + suspend per rules.

## ⚡ YoriCoins (`shebaoting/flarum-money` settings)
- Money name: `⚡ [money] YC` · Initial money (signup bonus): **50**
- New post: **+5** · Reply: **+2** · Like received: **+1** · Like given: **0** (no farming by liking everything)
- Character threshold: 100 chars → +1 per 200 extra chars (rewards effort, not spam)
- Hide zero balances: ON · Auto-update on delete/hide: ON (deleting spam removes its coins)
- Future perks (announce later): custom title 500 YC · Lounge entry 300 YC · username glow for Legends

## 🎖 Badge catalog (`v17development/flarum-user-badges`)
Create categories: Milestones / Contributor / Staff picks / Events.
| Badge | How earned |
|---|---|
| 🌱 First Steps | first discussion posted |
| 📤 Sharer | first Share Zone thread |
| 💡 Helper I / II / III | 1 / 10 / 50 Best Answers |
| 🔥 On Fire | 100 upvotes received (total) |
| 🏆 Top Monthly | most Best Answers in a month (staff awards) |
| 🎖 Veteran · 💎 Elite · 👑 Legend | reaching the rank (monthly check / on request) |
| 🛡 Staff | mods + admins |
| 🎉 Founding Member | first 100 registered users — award at launch+30 days |
