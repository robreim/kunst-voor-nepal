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
| Gallery | `/galerij` | Grid of all art pieces — photo, code, title, artist, dimensions, "vanaf €…" (info) |
| Donate | `/doneer` | Tikkie donatie: één duidelijke knop naar de Tikkie-link |
| Admin | `/admin` | Decap CMS login for artists (edit story, upload photos) |

**Flow (Tikkie-gebaseerd, iDeal/Wero):**
- **Eén Tikkie-link** (site-breed) voor donaties; staat op `/doneer` als één knop.
- De galerij is een **pure kunst-etalage**: geen koopknop per werk. Klikken opent een detail-venster met titel, kunstenaar, afmetingen, materiaal, "vanaf €…" en omschrijving.
- Elk werk heeft een **code** (bijv. `X548`) die automatisch wordt toegekend bij elke build — zodat je een werk kunt aanwijzen.
- Elke kaart heeft een **formaat** (`liggend`/`staand`/`vierkant`) zodat het kader de vorm van het werk volgt (geen afgesneden 4:3-dwang).

```
Home ──► Doneer (Tikkie-knop, site-wide)
  └─► Galerij ──► [klik op werk] ──► detail-venster (info, geen koop)
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
| `--ember` | `#C34E2A` | primary accent — buttons, underlines, "Doneer" |
| `--teal` | `#23645A` | secondary — links, prijzen, "Doneer" accents, flood-memory |

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
- `ArtCard` — photo op ware verhouding (liggend/staand/vierkant), code, titel, kunstenaar, afmetingen, materiaal, "vanaf €…"
- `ArtworkModal` — detail-venster (beeld + alle info); geen koop-knop
- `DonateSection` — kaart met één Tikkie-knop

---

## 5. Content model (Decap CMS → Astro)

All content lives in the repo as markdown; Decap edits it, commits, Netlify rebuilds.

**`src/content/artworks/*.md`** — one file per piece (collection "Kunstwerken"):

| Field | Widget | Notes |
|---|---|---|
| `title` | text | e.g. "De blauwe rivier" |
| `artist` | text | artist name |
| `number` | hidden | automatisch toegekend bij elke build (bijv. `X548`); uniek |
| `image` | image | uploaded photo |
| `breedteCm` / `hoogteCm` | number | afmetingen (cm) |
| `minimumprijs` | number | toont "vanaf €…" |
| `orientatie` | select | `liggend`/`staand`/`vierkant` — vorm van de kaart |
| `materiaal` | text | optioneel |

**`src/content/site/story.md`** — the front-page story (single file, "Verhaal"): title, markdown body, donate button label.

**`src/content/settings/global.json`** — site-wide settings ("Instellingen"): site title, **de Tikkie-link voor donaties**, contact email, footer text.

---

## 6. Tech & deployment

- **Astro 5** — static output, zero JS on the page except het detail-venster (dialog).
- **Decap CMS** — single `public/admin/index.html` + `public/admin/config.yml`; artists log in at `/admin`.
- **Netlify** — repo connected, build `npm run build`, publish `dist/`; Decap auth via **Netlify Identity + Git Gateway** (free). Publish → auto rebuild.
- No framework components, no CSS framework, no design library. Plain Astro + one stylesheet with CSS variables.

---

## 7. Placeholders you must replace before launch

1. **Story facts** — I write emotional but generic Dutch placeholder copy; you replace dates/places/names with the real story via the CMS.
2. **Tikkie-link** — één URL in de CMS-instellingen (`tikkieUrl`). Tot er een echte is, staat er een placeholder.
3. **Org name / contact email** — placeholder in footer + CMS settings.
4. **Artwork photos + orientatie** — kunstenaars uploaden eigen foto's en kiezen het formaat (liggend/staand/vierkant) via `/admin`.
5. **Placeholder artworks** — een paar demo-werken; verwijder via de CMS zodra er echt werk is.

---

## 8. Dutch copy (placeholder, first draft)

**Hero:** *"Kunst voor Nepal"* / **Headline:** *"Ze verloren alles. Wij verkopen onze kunst."*

**Story (draft):** *"In [maand] 2026 werd Nepal getroffen door een verwoestende overstroming. Dorpen spoelden weg, gezinnen verloren hun huis, hun oogst, hun dierbaren. Wij zijn een groep kunstenaars die niet aan de kant kan staan. Daarom verkopen we hier ons werk — alle opbrengsten gaan rechtstreeks naar de slachtoffers en hun families. Koop een kunstwerk, of doe een donatie. Elke euro telt."*

**Buttons:** *Verhaal · Galerij · Doneer · Opslaan*
