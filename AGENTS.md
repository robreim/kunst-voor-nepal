# AGENTS.md — Kunst voor Nepal

## Werken met git (belangrijk!)

- **NOOIT pushen of mergen naar `main` zonder uitdrukkelijke toestemming van de gebruiker.**
  Elke push naar `main` triggert een Netlify productie-deploy = 15 credits. Credits zijn schaars.
- Werkwijze:
  1. **Test lokaal eerst**: `npm run dev` (live-reload) of `npm run build && npm run preview`.
  2. Maak een **feature branch** (`git checkout -b …`), commit daarop.
  3. **Pushen naar de branch mag** — dat is een Deploy Preview (gratis, 0 credits), geen productie-deploy.
  4. Laat de gebruiker de Deploy Preview controleren en **zelf** de merge naar `main` doen (of zeg expliciet: "merge").
- Dus: *commit lokaal zo vaak je wilt, push naar branches, maar `main` alleen als de gebruiker het zegt.*

## Tips

- Credits tellen vooral via **productie-deploys (15/stuk)** en compute. Batch CMS-wijzigingen samen om deploys te beperken.
- Lokaal draaien kost niets.
