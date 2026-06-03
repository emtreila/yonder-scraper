# job_seeker_ro_spider

**job_seeker_ro_spider** — scraper pentru job-urile Yonder din România.

Extrage anunțurile de pe [Yonder Careers](https://tss-yonder.com/job) și le publică în [peviitor.ro](https://peviitor.ro) prin API-ul SOLR.

## Identificare

Toate request-urile HTTP folosesc User-Agent-ul:

```
job_seeker_ro_spider
```

## Ce face

1. **Validează compania** — interoghează API-ul public ANAF ([demoanaf.ro](https://demoanaf.ro)) după CIF-ul Yonder (4906881) și verifică:
   - Denumirea oficială: YONDER SRL
   - Status: activ/inactiv/radiat
   - Adresa completă din registrul comerțului
2. **Cross-validează cu Peviitor** — verifică existența companiei în API-ul Peviitor
3. **Scrape-uiește job-urile** — extrage lista de job-uri din pagina HTML Yonder Careers cu cheerio
4. **Transformă datele** — normalizează locațiile, titlurile, workmode-ul (remote/on-site/hybrid)
5. **Stochează în SOLR** — upsert în `job` core (job-urile) și `company` core (datele companiei cu adresa completă)

## Structură proiect

```
├── index.js           # Orchestrator principal
├── company.js         # Validare companie (ANAF + Peviitor + SOLR)
├── demoanaf.js        # CLI wrapper pentru src/anaf.js
├── src/anaf.js        # Modul ANAF API (search + company details)
├── solr.js            # Operații SOLR (query, upsert, delete, company)
├── company.json       # Cache companie (fallback când ANAF e down)
├── validate-jobs.js   # Validator URL-uri job-uri
├── tests/
│   ├── unit/          # Teste unitare
│   ├── integration/   # Teste de integrare (ANAF + SOLR live)
│   └── e2e/           # Teste end-to-end (pipeline complet)
└── .github/workflows/
    ├── scrape.yml     # Rulează zilnic la 6 AM UTC
    ├── test.yml       # Teste automate la fiecare push/PR
    └── deploy.yml     # Deploy docs la GitHub Pages
```

## API-uri folosite

| API | URL | Autentificare |
|---|---|---|
| Yonder Careers | `https://tss-yonder.com/job` | Public (HTML) |
| ANAF (demoanaf) | `https://demoanaf.ro/api/...` | Public |
| Peviitor | `https://api.peviitor.ro/v1/company/` | Public |
| SOLR (job core) | `https://solr.peviitor.ro/solr/job` | `SOLR_AUTH` |
| SOLR (company core) | `https://solr.peviitor.ro/solr/company` | `SOLR_AUTH` |

## Testare

```bash
# Toate testele
npm test

# Doar unitare
npm run test:unit

# Doar integrare (necesită ANAF live, SOLR conditional)
npm run test:integration

# Doar E2E (API real Yonder + ANAF + SOLR)
npm run test:e2e
```
