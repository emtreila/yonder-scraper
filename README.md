# Yonder Job Scraper

Automated job scraper for Yonder (tss-yonder.com) Romania.
Fetches jobs, validates company via ANAF, and stores in Solr for peviitor.ro.

## Setup

```bash
npm install
```

## Usage

```bash
# Run scraper
npm run scrape

# Run tests
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Environment

Set `SOLR_AUTH` (base64-encoded credentials) and optionally `SOLR_BASE` for Solr access.
