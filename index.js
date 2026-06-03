import "dotenv/config";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import { pathToFileURL } from "url";
import * as company from "./company.js";
import * as solr from "./solr.js";

const COMPANY_BRAND = "Yonder";
const COMPANY_CIF = "4906881";
const COMPANY_NAME = "YONDER SRL";
const CAREERS_URL = "https://tss-yonder.com/job";
const JOB_BASE = "https://tss-yonder.com";
const TIMEOUT = 10000;

const SENIORITY_WORDS = ["internship", "intern", "junior", "mid", "senior", "tech lead", "architect"];
const SENIORITY_PATTERN = new RegExp(`^(${SENIORITY_WORDS.join("|")})\\b`, "i");
const LOCATIONS = ["cluj-napoca", "iasi", "bucuresti", "timisoara", "brasov", "constanta", "craiova", "romania (remote)", "remote", "romania"];
const LOCATION_LABELS = {
  "cluj-napoca": "Cluj-Napoca",
  "iasi": "Iași",
  "bucuresti": "București",
  "timisoara": "Timișoara",
  "brasov": "Brașov",
  "constanta": "Constanța",
  "craiova": "Craiova",
  "romania (remote)": "Romania (Remote)",
  "remote": "Remote",
  "romania": "România"
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchCareersPage(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(CAREERS_URL, {
        headers: {
          "User-Agent": "job_seeker_ro_spider",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        },
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (!response.ok) throw new Error(`Careers page error: ${response.status}`);
      return response.text();
    } catch (err) {
      if (attempt < retries) {
        console.warn(`[${COMPANY_BRAND} Scraper] Fetch attempt ${attempt}/${retries} failed: ${err.message}, retrying...`);
        await sleep(2000 * attempt);
      } else {
        throw err;
      }
    }
  }
}

function parseJobsFromHtml(html) {
  const $ = cheerio.load(html);
  const jobs = [];

  $("li a[href*='/job/']").each((i, el) => {
    const link = $(el);
    const url = link.attr("href") || "";
    const text = link.text().trim().replace(/\s+/g, " ");
    if (!url || !text) return;

    const lower = text.toLowerCase();

    const seniorityMatch = text.match(SENIORITY_PATTERN);
    const seniority = seniorityMatch ? seniorityMatch[0] : "";

    let location = "";
    const trimmed = text.replace(/\s+/g, " ").trim().toLowerCase();
    for (const loc of LOCATIONS) {
      const normalized = trimmed.replace(/[^a-z0-9\s()-]/g, "");
      if (normalized.endsWith(loc) || normalized === loc) {
        location = loc;
        break;
      }
    }

    const titleStart = seniority ? text.indexOf(seniority) + seniority.length : 0;
    const titleEnd = location ? text.length - location.length : text.length;
    const title = text.slice(titleStart, titleEnd).trim();

    let workmode = "on-site";
    if (location.includes("remote")) workmode = "remote";
    else if (location.includes("hybrid")) workmode = "hybrid";

    const fullUrl = url.startsWith("http") ? url : `${JOB_BASE}${url}`;

    jobs.push({
      url: fullUrl,
      title: seniority ? `${seniority.charAt(0).toUpperCase() + seniority.slice(1)} ${title}` : title,
      workmode,
      location: location ? [LOCATION_LABELS[location] || location] : ["România"]
    });
  });

  return jobs;
}

function mapToJobModel(rawJob, cif, companyName) {
  return {
    url: rawJob.url,
    title: rawJob.title,
    company: companyName,
    cif,
    location: rawJob.location,
    workmode: rawJob.workmode,
    date: new Date().toISOString(),
    status: 'scraped',
  };
}

function transformJobsForSOLR(payload) {
  return {
    ...payload,
    company: COMPANY_NAME,
    jobs: payload.jobs.map(job => ({
      ...job,
      company: COMPANY_NAME,
      location: (job.location || []).length > 0 ? job.location : ['România'],
    }))
  };
}

async function main() {
  console.log(`[${COMPANY_BRAND} Scraper] Starting...`);

  try {
    try {
      const existingResult = await solr.querySOLR(COMPANY_CIF);
      const existingCount = existingResult?.response?.numFound || 0;
      console.log(`[${COMPANY_BRAND} Scraper] Existing jobs in SOLR: ${existingCount}`);
    } catch (e) {
      console.warn(`[${COMPANY_BRAND} Scraper] SOLR unavailable (${e.message}), continuing`);
    }

    try {
      const companyData = await company.validateAndGetCompany();
      if (companyData && companyData.status === 'active') {
        console.log(`[${COMPANY_BRAND} Scraper] Company validated: ${companyData.company} (CIF: ${companyData.cif})`);
        try {
          await solr.upsertCompany({
            id: COMPANY_CIF,
            company: COMPANY_NAME,
            brand: COMPANY_BRAND,
            status: 'activ',
            location: ['Cluj-Napoca'],
            website: ['https://tss-yonder.com'],
            career: ['https://tss-yonder.com/job'],
            lastScraped: new Date().toISOString().split('T')[0],
            scraperFile: 'https://raw.githubusercontent.com/emtreila/yonder-scraper/master/.github/workflows/scrape.yml'
          });
        } catch (err) {
          console.log(`[${COMPANY_BRAND} Scraper] Note: Could not upsert company to SOLR core: ${err.message}`);
        }
      } else {
        console.warn(`[${COMPANY_BRAND} Scraper] Company validation: ${companyData?.status || 'unknown'}`);
      }
    } catch (e) {
      console.warn(`[${COMPANY_BRAND} Scraper] Company validation skipped (${e.message})`);
    }

    console.log(`[${COMPANY_BRAND} Scraper] Fetching careers page: ${CAREERS_URL}`);
    const html = await fetchCareersPage();
    const rawJobs = parseJobsFromHtml(html);
    console.log(`[${COMPANY_BRAND} Scraper] Scraped ${rawJobs.length} raw jobs`);

    rawJobs.forEach((job, i) => {
      console.log(`  ${i+1}. ${job.title} - ${job.location.join(", ") || "N/A"} (${job.workmode})`);
    });

    const mappedJobs = rawJobs.map(job => mapToJobModel(job, COMPANY_CIF, COMPANY_NAME));
    console.log(`[${COMPANY_BRAND} Scraper] Mapped ${mappedJobs.length} jobs`);

    const solrReadyJobs = transformJobsForSOLR({ source: "tss-yonder.com", company: COMPANY_NAME, cif: COMPANY_CIF, jobs: mappedJobs });
    console.log(`[${COMPANY_BRAND} Scraper] Transformed ${solrReadyJobs.jobs.length} jobs for SOLR`);

    if (solrReadyJobs.jobs.length > 0) {
      try {
        console.log(`[${COMPANY_BRAND} Scraper] Upserting ${solrReadyJobs.jobs.length} jobs to SOLR...`);
        const result = await solr.upsertJobs(solrReadyJobs.jobs);
        console.log(`[${COMPANY_BRAND} Scraper] Upsert result:`, result);
      } catch (e) {
        console.warn(`[${COMPANY_BRAND} Scraper] SOLR upsert failed (${e.message}), saving locally only`);
      }
    }

    writeFileSync('jobs.json', JSON.stringify(solrReadyJobs.jobs, null, 2));
    console.log(`[${COMPANY_BRAND} Scraper] Jobs saved to jobs.json`);

    console.log(`[${COMPANY_BRAND} Scraper] Done! ${solrReadyJobs.jobs.length} jobs processed.`);
  } catch (err) {
    console.error(`[${COMPANY_BRAND} Scraper] Error:`, err.message);
    process.exit(1);
  }
}

export { parseJobsFromHtml, mapToJobModel, transformJobsForSOLR };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
