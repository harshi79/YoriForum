# 03 — The PHCorner pack: features → extensions → settings

PHCorner's feel = classic sections + reactions + member ranks + dark mode + uploads + tight moderation. Here's exactly which (free) extension gives you each piece and how to set it. All of these are already in `flarum/composer.json` — enable them in **Admin → Extensions** in the order below.

## Enable order + config notes

### 1. Foundation (official, bundled with core)
Enable: **Tags, Likes, Mentions, Subscriptions, Sticky, Lock, Flags, Approval, Suspend, Statistics, Emoji, Markdown**.
- **Tags** = your sections. Create the structure below (Admin → Tags). Use tag colors + icons.
- **Approval** = spam shield: require approval for the first post of new users (set in Permissions).
- **Suspend/Warn, Flags, Lock, Sticky** = mod toolkit. No config needed.

### 2. Classic forum sections (the PHCorner look)
- **`askvortsov/flarum-categories`** — renders tags as a traditional category forum list instead of Flarum's default grid. This is the single biggest "looks like a real forum" switch.
- Suggested sections (rename to taste):
  1. 📢 Announcements (admins post only)
  2. 💬 General Discussion
  3. 📱 Tech & Internet
  4. 📚 Tutorials & Guides
  5. 🚀 Showcase
  6. 🙋 Help & Support (+ Best Answer, see below)
  7. 🎲 Off-Topic
  8. 📤 Share Zone — the anything-goes drop box: files, links, finds, dumps. Uploads ON, open to all Members (guests read-only), first-post approval still applies. Mods nuke red-line stuff (§3 of rules) on sight or flag.

### 3. Reactions + ranks (the addictive part)
- **`fof/reactions`** — emoji reactions on posts (integrates with Likes). Suggested set: 👍 ❤️ 😂 😮 😢 😡. Enable for all tags.
- **`fof/gamification`** — upvotes/downvotes + **automatic member ranks**. Suggested ladder (points ≈ activity + upvotes received — tune after a month of real data):
  | Rank | Points | PHCorner vibe |
  |---|---|---|
  | Newbie | 0 | just joined |
  | Member | 50 | settled in |
  | Active | 200 | regular |
  | Veteran | 500 | known face |
  | Elite | 1000 | top contributor |
  | Legend | 2500 | hall of fame |

### 4. Look & feel
- **`fof/nightmode`** — per-user dark mode toggle (forums live at night 🌙).
- **`fof/links`** — add nav links (Rules, FAQ, Discord/Telegram).
- **`fof/pages`** — create `/rules`, `/faq`, `/contact` pages with the WYSIWYG editor.
- **`fof/custom-footer`** — footer text + credits.
- **`fof/frontpage`** — pin welcome/rules discussions to the very top.

### 5. Content power
- **`fof/upload`** — file uploads (images, zips). Settings: local adapter, max **2–5 MB/file** (you have 5 GB total — be strict early), allowed types `jpg,jpeg,png,gif,webp,zip,txt,pdf`. Downscale images if the option exists.
- **`fof/polls`** — polls in discussions (great for engagement threads).
- **`fof/best-answer`** — "✅ Solved" markers. Enable **only for the Help & Support tag**.
- **`fof/drafts`** — autosave drafts (users love this).
- **`fof/formatting`** — extra text-formatting buttons.
- **`fof/filter`** — word/pattern filter for spam + slurs (add your list).

### 6. People & discovery
- **`fof/user-directory`** — public member list with search/sort (permission-gated).
- **`fof/subscribed`** — extra follow options (get notified on tags/authors).
- **`fof/sitemap`** — `sitemap.xml` for Google. Then submit it in Google Search Console (free) for indexing.
- **`fof/oauth`** — **login with GitHub/Google** alongside passwords. For GitHub: register an OAuth app (callback `https://your-forum.com/auth/github`), paste ID+secret in the extension settings.

### 7. Moderation & hygiene
- **`fof/anti-spam`** — checks signups against the StopForumSpam database (free, no key). Turn it on before you announce the forum anywhere.
- **`fof/prevent-necrobumping`** — warns when replying to ancient threads.
- **`fof/merge-discussions` + `fof/split`** — mod tools to merge dupes / split derails.

## Permissions recipe (Admin → Permissions)

| Group | View | Start discussion | Reply | Upload | Notes |
|---|---|---|---|---|---|
| Guest | ✅ | ❌ | ❌ | ❌ | read-only lures signups |
| Member | ✅ | ✅* | ✅ | ✅ | *first post needs approval (Approval ext) |
| Mod | ✅ | ✅ | ✅ | ✅ | + lock/sticky/split/merge/suspend |
| Admin | ✅ | ✅ | ✅ | ✅ | everything |

Lock 📢 Announcements to admin-only posting (tag permission).

## Launch-day content (don't launch empty)

Ready-made copy lives in [`content/`](../content/) — rules, FAQ, welcome thread, rank ladder, 6 seed discussions. Just paste + post:

1. Pages: create `/rules` + `/faq` from `content/rules.md` + `content/faq.md`, add to nav via Links.
2. Welcome discussion from `content/welcome-thread.md` → FrontPage it + Sticky it.
3. Ranks from `content/ranks.md` → type into Admin → Gamification.
4. Seed discussions from `content/seed-discussions.md` → post one per section.
5. Test account: register as a new user, post, react, upload — verify the whole loop.

Next → **[04-admin-handbook.md](04-admin-handbook.md)**
