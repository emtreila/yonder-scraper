# AGENTS.md - AI Agent Instructions

## Overview
This project is a Node.js scraper for Yonder job listings from tss-yonder.com.

## Key Directories
- `src/` - ANAF integration module
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests
- `.github/workflows/` - CI/CD pipelines
- `docs/` - Documentation

## Important Files
- `index.js` - Main scraper entry point
- `company.js` - Company validation
- `solr.js` - Solr storage layer
- `company.json` - Cached company data (CIF 4906881)
- `validate-jobs.js` - Job schema validation

## Tech Stack
- Node.js with ES modules
- cheerio for HTML parsing
- node-fetch for HTTP requests
- Jest for testing
- Solr for data storage

## Testing
- `npm test` runs all tests
- `npm run test:unit` for unit tests
- `npm run test:integration` for integration tests
- `npm run test:e2e` for e2e tests

## Data Flow
1. Fetch HTML from tss-yonder.com/job
2. Parse jobs with cheerio
3. Validate company via ANAF (CUI 4906881)
4. Upsert jobs/company to Solr
5. Save jobs.json locally
