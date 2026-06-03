# Yonder Job Scraper - Known Issues

- Yonder's careers page is static WordPress HTML; the scraper uses cheerio to parse `<li>` elements under `#jobs-list`.
- Some job locations may not specify city; default is "România".
- Solr availability depends on peviitor.ro infrastructure.
