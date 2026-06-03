# YONDER SRL - Node.js Scraper

[![Scrape Yonder Jobs](https://github.com/emtreila/yonder-scraper/actions/workflows/scrape.yml/badge.svg)](https://github.com/emtreila/yonder-scraper/actions/workflows/scrape.yml)
[![Automation Tests](https://github.com/emtreila/yonder-scraper/actions/workflows/test.yml/badge.svg)](https://github.com/emtreila/yonder-scraper/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ESM-F7DF1E?logo=javascript&logoColor=black)](https://ecma-international.org/)
[![Node.js](https://img.shields.io/badge/node-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

Web scraper pentru a aduce locurile de munca de la Yonder in platforma [peviitor.ro](https://peviitor.ro).

## Company Details

- **Brand**: Yonder
- **Legal Name**: YONDER SRL
- **CUI/CIF**: 4906881
- **Registration Number**: J1993003604122
- **Source**: Yonder Careers (HTML scraping)

## Project Structure

```
├── index.js           # Main scraper orchestrator
├── company.js         # Company validation via ANAF
├── demoanaf.js        # ANAF CLI wrapper
├── solr.js            # Solr database operations
├── validate-jobs.js   # Job URL validator
├── src/
│   └── anaf.js        # Core ANAF library
├── company.json       # Cached company data
├── tests/             # Test suite
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       ├── scrape.yml     # Daily scraping workflow
│       ├── test.yml      # Test automation
│       └── deploy.yml    # GitHub Pages deploy
├── AGENTS.md           # AI agent rules
├── ISSUES.md           # Issue process
├── ROBOTS.md           # API terms analysis
├── CONTRIBUTING.md     # Contribution guide
├── SECURITY.md         # Security policy
├── CHANGELOG.md        # Version history
├── instructions.md     # Workflow documentation
├── files.md            # File roles
├── company-model.md    # Company schema
└── job-model.md        # Job schema
```

## Usage

```bash
npm install
npm run scrape
```

## Scraping Flow

1. Query Solr for existing jobs by CIF
2. Validate company via ANAF API
3. Scrape job listings from Yonder Careers (HTML parsing)
4. Map jobs to the standard job model
5. Transform jobs for Solr (normalize fields)
6. Upsert jobs to Solr
7. Save backup to `jobs.json`

## Robots.txt Policy

Acest scraper foloseste HTML scraping pe pagina publica de cariere Yonder. Pentru analiza completa, vezi [ROBOTS.md](ROBOTS.md).

- Scraper-ul este politicos: o singura cerere pe sesiune, User-Agent identificabil (`job_seeker_ro_spider`)

## Workflows

### Daily Scraping

The `scrape.yml` workflow runs daily at 6 AM UTC via GitHub Actions.

### Test Automation

The `test.yml` workflow runs on every push and pull request, plus a daily validation of existing jobs.

## License

Copyright (c) 2026 BADEA MELANIA

Licensed under the [MIT License](LICENSE).

## Managed By

This project is managed by [ASOCIATIA OPORTUNITATI SI CARIERE](https://oportunitatisicariere.ro) and used as a web scraper for the [peviitor.ro](https://peviitor.ro) job board project.
