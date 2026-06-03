# Job Data Model

Used by `index.js` and stored in Solr `jobs` core.

| Field | Type | Required | Description |
|---|---|---|---|
| url | string | yes | Job posting URL |
| title | string | yes | Job title |
| company | string | yes | Company name |
| cif | string | yes | Romanian tax ID |
| location | array | no | Job locations |
| workmode | string | no | on-site, remote, hybrid |
| date | string | no | ISO timestamp |
| status | string | no | scraped |
