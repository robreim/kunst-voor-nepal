# Kunst voor Nepal

Een kleine website voor een kunstveiling ten bate van de slachtoffers van de overstromingen in Nepal.

- **Stack:** Astro 5 (static) + Decap CMS + Netlify
- **Taal:** Nederlands
- **Design:** zie `DESIGN.md`

## Lokaal draaien

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Content bewerken

- Via de CMS: `http://localhost:4321/admin` (lokaal, met `local_backend: true` en de Decap CLI) of `/admin` in productie.
- Kunstwerken: `src/content/artworks/*.md` — één bestand per werk (titel, kunstenaar, nummer ≥ 101, foto, `sold`-toggle).
- Verhaal: `src/content/story.md`.
- Instellingen (site-brede Tikkie-link, e-mail, voettekst): `src/content/settings/global.json`.

> **QR-code:** de site gebruikt **geen** gegenereerde QR — de eigenaar levert de QR-afbeelding (uit Tikkie geëxporteerd) aan. Vervang `public/img/tikkie-qr.svg` door de echte QR (zelfde bestandsnaam, PNG) en zet de echte `tikkieUrl` in `global.json`. Zie `DESIGN.md` §7.

## Productie (Netlify)

1. Push deze repo naar GitHub.
2. Op Netlify: *New site from Git* → kies de repo → build `npm run build`, publish `dist/` (al ingevuld via `netlify.toml`).
3. Decap-auth: Netlify Dashboard → **Identity** inschakelen, dan **Settings → Identity → Services** → **Git Gateway** inschakelen.
4. Nodig kunstenaars uit onder **Identity → Invite users** (rol: *Editor*).
5. Klaar: `https://kunstvoornepal.nl/admin` inloggen → kunstwerk toevoegen → Publish → site herbouwt automatisch.
6. Optioneel: zet de Netlify-subdomein (`kunstvoornepal.netlify.app`) om naar het eigen domein via **Domain settings → Add custom domain** (`kunstvoornepal.nl`, met de DNS-instellingen die Netlify toont).

## Nog invullen voor lancering

- Echte Tikkie-QR-afbeelding + echte `tikkieUrl` (zie hierboven).
- Echte verhaaltekst + contact-e-mailadres (via CMS).
- Voorbeeldkunstwerken (`src/content/artworks/`) verwijderen zodra er echte kunst is.
