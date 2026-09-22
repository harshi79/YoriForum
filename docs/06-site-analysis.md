# 06 — Deep analysis: PHCorner + CrackWeb → YoriForum feature map

Sources: live fetches of phcorner.org (homepage + full forum list) and crackweb.org (homepage) on 2026-09-22. Scale context: PHCorner = **2.33M threads · 29.2M posts · 1.15M members** — the mechanics below are proven at massive scale.

## PHCorner findings (what makes it work)

**Structure (threads/posts captured live):** Chitchat 123K/1.1M · Contest 5.7K/214K · Crypto/Earn/Referrals 105K/1.5M · **Freemium Access 204K/3.2M** (the #1 engine!) · Globe&TM 182K/6.5M · Smart&TNT 136K/4.2M · Mobile Support 130K/882K · Freenet&Tunneling 49K/1.4M · Broadband/Modem 16.5K/360K · DITO 8.7K/142K · WWW 9.2K/132K · GOMO 2.8K/48K.

**Mechanics worth stealing:**
1. Per-carrier trick sections (users self-sort by SIM — genius organization)
2. Per-group Help sections (support lives next to each topic)
3. Thread prefixes per section ([TUT] [REFERRAL] [CONFIG] [JIO]…)
4. Contest section (214K posts of pure engagement)
5. Referral-rules (referrals quarantined to ONE section with hard scam rules)
6. Freemium concept (free-access drops — their top section by far)
7. Featured content slider, Trending (7-day), Top Contributors (monthly), Online-now, Forum statistics
8. Style variation (light/dark), PWA install prompt, Telegram + Discord widgets, guest upsell banner

## CrackWeb findings (mechanics only)

**Structure:** content-type nav pills (New Topics/Messages, VIP, Account, Combolist, Config, Proxy, Tools, IPTV, Question, Trade) + pinned system threads: Rank System, Staff Recruitment, VIP memberships, **Hidden Content Guide**, competitions. Trend Topics + Latest VIP widgets, TG/Discord, PWA.

**Adopted:** pinned system-thread pattern, rank system, staff recruitment, VIP-as-status, hidden-content guide, competitions, trend widgets, TG/Discord, PWA.
**NOT adopted (ever):** combolists, USER:PASS sections, checkers, stolen "VIP accounts", BINs/fraud methods. That's crime infrastructure — it gets forums seized and hosts terminated. Our VIP is *earned by contributing*, never bought or stolen.

## Adoption map (site feature → YoriForum)

| # | They have it | We built it | Where |
|---|---|---|---|
| 1 | Per-carrier sections | Per-carrier Mobile Networks (Jio/Airtel/Vi/BSNL) | `content/sections.md` |
| 2 | Freenet/Tunneling + configs | VPN & Configs + hide-content for servers | `sections.md` + `unlock-guide.md` |
| 3 | Freemium Access (3.2M posts!) | Share Zone + Freebies (legit free only) + unlock system | `sections.md`, `unlock-guide.md` |
| 4 | Contest section | Events + full contest kit (5 templates, $0 prizes) | `sections.md`, `content/contest-kit.md` |
| 5 | Earn/Referrals + strict rules | Earn & Referrals with scam rules | `sections.md`, `rules.md` §4 |
| 6 | Marketplace + rules | Trading Post with strict rules | `sections.md`, `rules.md` |
| 7 | Thread prefixes | Prefix system per section | `sections.md` |
| 8 | Per-group help sections | Best-Answer help sections everywhere | `sections.md` |
| 9 | Featured content | FrontPage extension | `docs/03` |
| 10 | Trending 7-day | Gamification hotness sort | `docs/03` |
| 11 | Top Contributors monthly | User directory + Top Monthly contest | `docs/03`, `contest-kit.md` |
| 12 | Forum statistics | Official Statistics page | `docs/03` |
| 13 | Dark style variation | Night mode (per-user) | `docs/03` |
| 14 | PWA install | PWA + push notifications ext | `composer.json`, `docs/03` |
| 15 | TG/Discord widgets | Community channels guide | `docs/05` |
| 16 | Rank system thread | Ranks + YoriCoins + badges | `ranks.md` |
| 17 | VIP status | VIP = earned contributor tier | `ranks.md`, `sections.md` (Lounge) |
| 18 | Hidden Content Guide | Unlock Guide + demo thread | `unlock-guide.md`, seeds #8 |
| 19 | Staff Recruitment | Staff system + application thread | `content/staff-recruitment.md` |
| 20 | Requests culture | Requests section + guide + rewards | `sections.md`, `content/requests-guide.md` |

## Deliberately skipped (with reasons)
- **Realtime chat/shoutbox extension** — only verified option needs Pusher keys or a self-hosted socket server (impossible on no-SSH shared hosting). Live layer = Chitchat section + Telegram/Discord. Revisit on VPS.
- **Online-now widget** — no verified Flarum-2.x extension found. Optional later via Extension Manager search.
- **Paid VIP / premium accounts** — $0 project + stolen-account trading is illegal. VIP is earned.
- **Combolists, checkers, credential dumps, fraud methods** — crime infrastructure. Never. Red lines: `rules.md` §3.
