# Design spec — Kunst voor Nepal

A one-page story site + art gallery, raising money for flood victims in Nepal by selling art. All proceeds go to the victims and their families. The site is in **Dutch**, content is editable by non-technical artists through **Decap CMS** at `/admin`.

---

## 1. Concept

> **"Handmade / textured"** — an art-collective zine feel: warm paper, ink, hand-drawn accents, photos that sit slightly crooked like pinned prints. Serious subject, warm human tone. The site should feel like a small group of artists made it by hand — because they did.

**Differentiator:** every page looks like it was screen-printed. Paper grain, squiggly underlines, sticker-style buttons, slightly rotated cards.

---

## 2. Pages & flows

| Page | URL | Purpose |
|---|---|---|
| Home (story) | `/` | Hero headline, the flood story (editable via CMS), donate CTA, teaser of a few gallery pieces |
| Gallery | `/galerij` | Grid of all art pieces, each with title, artist, "Betaal" button, optional "Verkocht" badge |
| Donate | `/doneer` | Full-page QR payment flow — scan with banking app, pay via iDeal/Wero |
| Admin | `/admin` | Decap CMS login for artists (edit story, upload photos) |

**Payment flow (Tikkie-based, iDeal/Wero):**
- **One site-wide Tikkie link.** No per-piece links.
- **The QR code is an image the owner supplies** (exported from Tikkie), uploaded once in the CMS settings. No QR generation on the site.
- Every artwork gets a **number starting at 101** (entered in the CMS). The "Betaal" button opens a modal showing that number prominently — buyers **type the number into the payment description** so the team knows which piece the money is for.
- **Device split (pure CSS, no JS detection):** on **desktop the modal shows the QR image** (scan with the phone); on **mobile it shows a big "Open betaallink" button** (tap-through, no scanning).
- The site-wide **"Doneer"** button (header + story + gallery footer) goes to `/doneer` — same QR/link logic, no piece number.
- The **"Verkocht" badge** is a plain CMS toggle on each piece (already in the model): greys the photo + stamps the badge, hides the Betaal button. No extra work.
- No prices, no shopping cart, no payment processing on the site. Tikkie does the money.

```
Home ──► Doneer (QR/link, site-wide)
  └─► Galerij ──► [Betaal] ──► modal: QR (desktop) / link button (mobile)
                     + "Vermeld nr. 101" callout
                     └─► [Verkocht badge if toggled]
```

---

## 3. Visual system

### Typography (Google Fonts)
- **Display — Fraunces** (with `SOFT`/`WONK` axes): headline serif with a hand-cut character. Titles like a printed broadsheet.
- **Handwriting — Caveat**: squiggly underlines, sticker labels, small annotations ("alles gaat naar Nepal ✦").
- **Body — Source Serif 4**: warm, readable serif for story text.

### Color (CSS variables)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#F6EFE3` | page background (warm cream) |
| `--ink` | `#241F18` | text, borders |
| `--ember` | `#C34E2A` | primary accent — buttons, underlines, "Betaal" |
| `--teal` | `#23645A` | secondary — links, "Doneer" accents, flood-memory |
| `--sold` | `#8A8378` | "Verkocht" badge, muted |

### Texture & details
- **Paper grain:** fixed SVG `feTurbulence` noise overlay at ~4% opacity — the whole site sits on paper, not a flat screen.
- **Rough corners:** `border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px` on photo cards — the "unevenly cut print" look.
- **Slight rotation:** cards at `-0.8deg` / `+0.6deg` alternating; hover straightens + lifts.
- **Hand-drawn accents:** Caveat scribble underlines under key headings, a sticker-style "Doneer" button in the header.
- **Motion (respects `prefers-reduced-motion`):** card hover lift, modal fade-in. Nothing else.

---

## 4. Components

- `SiteHeader` — hand-drawn site mark, nav (Verhaal / Galerij), sticker "Doneer" button
- `SiteFooter` — placeholder org line, contact email, "met liefde voor Nepal ✦"
- `StorySection` — hero headline + story body from CMS + donate CTA
- `ArtCard` — photo (rough corner), title, artist, "Betaal" button, "Verkocht" badge, no price
- `PayModal` — per-piece modal: QR **image** (desktop) or "Open betaallink" button (mobile) + "Vermeld nr. X" callout. Pure CSS show/hide, zero JS.
- `DonateSection` — site-wide QR/link + steps ("1. Scan met je bankapp · 2. Betaal via iDeal of Wero · 3. Klaar!")

---

## 5. Content model (Decap CMS → Astro)

All content lives in the repo as markdown; Decap edits it, commits, Netlify rebuilds.

**`src/content/artworks/*.md`** — one file per piece (collection "Kunstwerken"):

| Field | Widget | Notes |
|---|---|---|
| `title` | text | e.g. "De blauwe rivier" |
| `artist` | text | artist name |
| `number` | number (int, ≥ 101) | unique piece number — buyers type this in the payment description |
| `image` | image | uploaded photo |
| `sold` | toggle (boolean) | flips card to "Verkocht" + greys photo + hides Betaal |

**`src/content/site/story.md`** — the front-page story (single file, "Verhaal"): title, markdown body, donate button label.

**`src/content/settings/global.json`** — site-wide settings ("Instellingen"): site title, **the one site-wide Tikkie link**, contact email, footer text. (JSON via Decap file collection; the only thing non-artists touch is the Tikkie link.)

---

## 6. Tech & deployment

- **Astro 5** — static output, zero JS on the page except the pay modal.
- **Decap CMS** — single `public/admin/index.html` + `public/admin/config.yml`; artists log in at `/admin`.
- **Netlify** — repo connected, build `npm run build`, publish `dist/`; Decap auth via **Netlify Identity + Git Gateway** (free). Publish → auto rebuild.
- **QR image** — owner-uploaded PNG (from Tikkie) in CMS settings, displayed as-is. No QR library, no server, nothing to break.
- No framework components, no CSS framework, no design library. Plain Astro + one stylesheet with CSS variables.

---

## 7. Placeholders you must replace before launch

1. **Story facts** — I write emotional but generic Dutch placeholder copy; you replace dates/places/names with the real story via the CMS.
2. **Tikkie QR image** — one image in CMS settings. Until a real one exists, a clearly labeled placeholder SVG is used so the layout shows something.
3. **Org name / contact email** — placeholder in footer + CMS settings.
4. **Artwork photos + numbers** — artists upload their own photos and assign numbers (101, 102, …) via `/admin`. Numbers must be unique — the build fails loudly on duplicates.
5. **Placeholder artworks** — 4 demo pieces ship in the repo so the gallery isn't empty; delete them via the CMS once real art arrives.

---

## 8. Dutch copy (placeholder, first draft)

**Hero:** *"Kunst voor Nepal"* / **Headline:** *"Ze verloren alles. Wij verkopen onze kunst."*

**Story (draft):** *"In [maand] 2025 werd Nepal getroffen door een verwoestende overstroming. Dorpen spoelden weg, gezinnen verloren hun huis, hun oogst, hun dierbaren. Wij zijn een groep kunstenaars die niet aan de kant kan staan. Daarom verkopen we hier ons werk — alle opbrengsten gaan rechtstreeks naar de slachtoffers en hun families. Koop een kunstwerk, of doe een donatie. Elke euro telt."*

**Buttons:** *Verhaal · Galerij · Doneer · Betaal · Verkocht · Open betaallink*
**Donate steps:** *"1. Scan de code met je bankapp · 2. Betaal via iDeal of Wero · 3. Klaar — dank je wel ✦"*
**Payment callout (modal):** *"Vermeld nr. 103 in de omschrijving bij je betaling"*
