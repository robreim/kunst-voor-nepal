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
4. Voeg kunstenaars toe onder **Identity → Invite users** (rol: *Editor*) — **alleen e-mailadressen die hier staan** krijgen een loginlink.

### Inloggen (zonder wachtwoorden)

- Ga naar `https://kunstvoornepal.nl/admin` → vul je e-mailadres in → **Ontvang inloglink per e-mail**.
- Klik de link in de e-mail → je bent ingelogd. **Er is nooit een wachtwoord nodig of gevraagd.**
- Onbekende e-mailadressen krijgen stil geen mail (Netlify beantwoordt identiek), dus er valt niets te raden.
- De site herbouwt automatisch na elke publicatie van een kunstwerk.

> **Let op:** alleen bij de allereerste uitnodiging (via *Invite users* in de Netlify-console) vraagt Netlify eenmalig om een wachtwoord te kiezen, omdat de uitnodigingslink dat server-side vereist. Daarna is elk volgend bezoek via de loginlink wachtwoordloos. Wil je ook die eerste stap overslaan, gebruik dan in de console *Resend invitation* of vraag de persoon eerst een recovery-link te gebruiken — beide zijn net zo veilig (het e-mailadres is de sleutel).
