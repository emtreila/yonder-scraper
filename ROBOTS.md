# Robots.txt Analysis — YONDER Careers

Sursa: https://tss-yonder.com/robots.txt

## Reguli

Yonder Careers nu are un robots.txt restrictiv. Site-ul permite accesul tuturor crawler-elor.

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/` | ✅ Da | Pagina principală cu lista de job-uri |
| `/job/*` | ✅ Da | Paginile individuale de job |
| `/api/*` | ✅ Da (dacă există) | API-uri interne |

## Recomandare

robots.txt NU este legal binding, dar reprezintă intenția proprietarului site-ului.

- Pagina `/job` e accesibilă și permisă — scraper-ul parsează HTML-ul direct.
- Paginile individuale de job (`/job/*`) sunt și ele accesibile.
- Scraperul curent face o singură cerere per pagină — comportament rezonabil, nu agresiv.

**Concluzie**: Risc minim. Site-ul e public, răspunde fără autentificare, iar scraperul e politicos (rate limiting, User-Agent standard, o singură cerere simultană).
