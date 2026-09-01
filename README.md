# Kunst voor Nepal

Een kleine website voor een kunstveiling ten bate van de slachtoffers van de overstromingen in Nepal. Kunstenaars uploaden hun werk via de CMS; kopers bekijken de galerij en betalen met Tikkie.

- **Stack:** Astro 5 (static) + Decap CMS 3 + Netlify (Git Gateway / Identity)
- **Taal:** Nederlands (ook de CMS-interface)
- **Design:** zie `DESIGN.md`
- **Werkwijze git:** zie `AGENTS.md` (belangrijk: **nooit naar `main` pushen zonder toestemming**)

---

## Architecture in één oogopslag

```
main (productie, kunstvoornepal.nl)          accept (staging, accept--magical-haupia-491c3b.netlify.app)
        ▲                                            ▲
        │ merge accept→main, daarna                 │ kunstenaars uploaden hier via /admin
        │ handmatig "Publish deploy" (15 cr)        │ (gratis branch-deploy, 0 credits)
        └───────────────┬───────────────────────────┘
                        │
              GitHub-repo (git-gateway backend)
```

- **Kunstenaars** werken op de **`accept`-branch** via `https://accept--magical-haupia-491c3b.netlify.app/admin` — gratis branch-deploys, productie blijft onaangeraakt.
- **De eigenaar** publiceert pas naar productie wanneer hij wil: `accept` → `main` mergen, dan handmatig **Publish deploy** in Netlify (15 credits per keer — batch dus zoveel mogelijk).
- **Auto-deploy is uit** — een push naar `main` triggert géén productie-deploy vanzelf.

---

## Lokaal draaien

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output in dist/ (draait eerst gen:sold)
npm run preview  # preview van de build
```

## Content bewerken

### Via de CMS (voor kunstenaars)

- **Accept (staging):** `https://accept--magical-haupia-491c3b.netlify.app/admin`
- **Productie:** `https://kunstvoornepal.nl/admin`
- **Lokaal:** `http://localhost:4321/admin` (met `local_backend: true`; de lokale CMS-backend is een bekende Decap-3-quirk — de site-preview werkt, de CMS-editor lokaal kan een "Login/Go back"-scherm tonen)

**Inloggen:** e-mail + wachtwoord via Netlify Identity. De CMS is volledig Nederlandstalig; bij een nieuw kunstwerk heet de knop **"Opslaan"** (geen verwarrende publicatie-opties).

### Kunstwerk-velden (per werk, `src/content/artworks/*.md`)

| Veld | Widget | Verplicht? | Toelichting |
|---|---|---|---|
| Titel | string | ja | |
| Kunstenaar | string | ja | |
| Nummer | hidden (`artcode`) | auto | Automatisch gegenereerd (bijv. `X548`), onzichtbaar, uniek. Wordt bij `preSave` toegekend. |
| Foto | image | ja | |
| Breedte (cm) | number int | **ja** | |
| Hoogte (cm) | number int | **ja** | |
| Minimumprijs (€) | number float | **ja** | Toont "vanaf €…" op de kaart |
| Materiaal | string | nee | Vrij tekstveld, toont op de kaart |
| Verkocht? | boolean | nee | Zet de "Verkocht"-stempel + grijs, verbergt Betaal |
| Omschrijving | markdown | nee | Toont in de detail-popup |

### Site-teksten

- **Verhaal** (homepage): `src/content/story/story.md`
- **Instellingen** (site-titel, Tikkie-QR, betaallink, e-mail, voettekst): `src/content/settings/global.json`

---

## De accept-workflow (dagelijks gebruik)

1. Kunstenaar gaat naar `https://accept--magical-haupia-491c3b.netlify.app/admin`, logt in, kiest "Kunstwerk toevoegen", vult titel/kunstenaar/foto/afmetingen/prijs in, klikt **Opslaan**.
2. De upload (tekst + foto) wordt gecommit naar de **`accept`-branch** → Netlify bouwt gratis → direct zichtbaar op de accept-site.
3. De eigenaar controleert. Is de oogst klaar? **Merge `accept` → `main`**, dan in Netlify **Deploys → Publish deploy** (één productie-deploy = 15 credits voor de hele batch).
4. Wil je *alleen* iets als "verkocht" markeren zonder productie-deploy? Vink in de accept-CMS "Verkocht?" aan → gratis accept-deploy → productie pikt het op via de **sold-state-overlay** (zie hieronder).

---

## Sold-state overlay (sold flippen zonder credits)

Productie laadt een klein script van de accept-site:

```html
<script src="https://accept--magical-haupia-491c3b.netlify.app/sold-state.js" onerror="window.SOLD_STATE=null"></script>
```

- `sold-state.js` wordt **bij elke build gegenereerd** door `scripts/gen-sold-state.mjs` (via `npm run gen:sold`, gekoppeld aan `npm run build`).
- Het bevat `window.SOLD_STATE = { "X548": true, ... }` voor alle verkochte werken.
- Productie verbergt daarmee de Betaal-knop + toont "Verkocht" op werken die in `SOLD_STATE` staan — zonder productie-deploy.
- **Fallback:** als de accept-site onbereikbaar is, blijft productie de statische toestand tonen (geen crash).

> Let op: de overlay heeft **éénmalig** een productie-deploy nodig om actief te worden (de `<script>`-tag moet in de productie-HTML staan). Daarna werken sold-flips met 0 credits.

---

## Productie (Netlify) — eenmalige setup

1. Push de repo naar GitHub.
2. Netlify: *New site from Git* → kies de repo → build `npm run build`, publish `dist/` (staat in `netlify.toml`).
3. **Identity** inschakelen (Dashboard → Identity) en **Settings → Identity → Services → Git Gateway**.
4. Kunstenaars toevoegen: **Identity → Invite users** (rol *Editor*). Alleen uitgenodigde e-mails kunnen inloggen (`disable_signup: true`).
5. **Branch-deploys aanzetten** voor `accept` (Site configuration → Build & deploy → Deploy contexts) → accept-site wordt live.
6. **Auto-deploy uitzetten** (Build & deploy → Deploy contexts → production) zodat je zelf bepaalt wanneer er 15 credits worden uitgegeven.

> **E-mails:** uitnodigings-/recovery-mails van Netlify (free plan) komen soms niet aan (bekend Netlify-probleem). Werkwijze: nodig uit via de Netlify-console, of gebruik de gewone e-mail+wachtwoord-login (rollen staan in Identity).

### Inloggen

- Kunstenaars loggen in met **e-mail + wachtwoord** (gekozen bij de uitnodiging).
- `robreimert@pm.me` is de eigenaar-account (beheer).

---

## Credits (Netlify free plan)

| Actie | Credits |
|---|---|
| Productie-deploy (Publish) | 15 |
| Branch-deploy / Deploy Preview (`accept`) | 0 |
| Web-verzoeken | 2 / 10k |
| Bandbreedte | 20 / GB |
| Gratis per maand | 300 |

**Gevolg:** alle kunstenaars-uploads (accept) zijn gratis; alleen de bewuste, gebatchte productie-publicaties kosten 15 credits per stuk.

---

## Verificatie / testen

- **Build:** `npm run build` (valideert de content-schema's — verplichte velden, nummer-formaat).
- **Bestaande testwerken** in de galerij: `101-vergezichten` / `104-hallo` (testuploads van de eigenaar) — verwijderen via de CMS of de bestanden voordat je een batch publiceert, als ze niet mee moeten.

---

## Projectstructuur

```
public/
  admin/            Decap CMS (index.html, config.yml, nl-locale.js)
  art/              Geüploade kunstwerk-foto's (via CMS/media)
  styles/global.css Alle site-styling
scripts/
  gen-sold-state.mjs   Genereert public/sold-state.js bij elke build
  identity-email-wizard.sh  (optioneel hulpscript, niet nodig voor gebruik)
src/
  components/       ArtGrid, ArtworkModal, PayModal, PayModalContent
  content/          artworks/*.md, story/story.md, settings/global.json
  pages/            index, galerij, doneer (+ admin shim op index)
netlify.toml        Build-command + publish-dir
AGENTS.md           Git-werkwijze (lees vóór je iets pusht)
DESIGN.md           Design-spec
```
