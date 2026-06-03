# Yonder Job Scraper

This repository hosts a Python scraping utility that gathers job listings directly from the Yonder (tss-yonder.com) website using BeautifulSoup and requests.

## Features

- Scrapes job titles, links, locations, and seniority levels from Yonder careers page
- Structured output using Item dataclass
- Peviitor.ro API integration for job data submission

## Usage

```bash
pip install -r requirements.txt
python sites/yonder_scraper.py
```

## Structure

```
sites/
  __utils/          # Utility modules (headers, county lookup, etc.)
  yonder_scraper.py # Main scraper for Yonder jobs
```

## License

MIT
