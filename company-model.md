# Company Data Model

Used by `company.js` and stored in Solr `companies` core.

| Field | Type | Required | Description |
|---|---|---|---|
| id | string | yes | CIF (Romanian tax ID) |
| company | string | yes | Legal company name |
| brand | string | no | Brand name (e.g. Yonder) |
| group | string | no | Corporate group |
| status | string | no | activ, suspendat, inactiv, radiat |
| location | array | no | Physical addresses |
| website | array | no | Company website URLs |
| career | array | no | Careers page URLs |
| lastScraped | string | no | Date of last scrape |
| scraperFile | string | no | Scraper workflow URL |
