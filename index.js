/**
 * Yonder Job Scraper - Main Entry Point
 *
 * PURPOSE: Scrapes job listings from Yonder (tss-yonder.com) careers page
 * and stores them in Solr for the peviitor.ro platform.
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";
import { fileURLToPath } from "url";
import { validateAndGetCompany } from "./company.js";
import { querySOLR, deleteJobByUrl, upsertJobs, upsertCompany } from "./solr.js";

const COMPANY_CIF = "4906881";
const TIMEOUT = 10000;
const JOBS_URL = "https://tss-yonder.com/job";

let COMPANY_NAME = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJobsPage() {
  const res = await fetch(JOBS_URL, {
    headers: {
      "User-Agent": "job_seeker_ro_spider",
      "Accept": "text/html"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status} fetching Yonder careers page`);
  }

  return await res.text();
}

function parseJobs(html) {
  const $ = cheerio.load(html);
  const jobs = [];

  $("#jobs-list li").each((i, el) => {
    const link = $(el).find("a");
    const url = link.attr("href") || "";
    const seniority = link.find("span.super").text().trim();
    const title = link.find("span.main").text().trim();
    const location = link.find("span.sub").text().trim();

    let workmode = "on-site";
    if (location.toLowerCase().includes("remote")) workmode = "remote";
    else if (location.toLowerCase().includes("hybrid")) workmode = "hybrid";

    jobs.push({
      url,
      title: seniority ? `${seniority} ${title}` : title,
      workmode,
      location: location ? [location] : ["România"]
    });
  });

  return jobs;
}

function mapToJobModel(rawJob, cif, companyName = COMPANY_NAME) {
  const now = new Date().toISOString();
  const job = {
    url: rawJob.url,
    title: rawJob.title,
    company: companyName,
    cif: cif,
    location: rawJob.location?.length ? rawJob.location : undefined,
    workmode: rawJob.workmode || undefined,
    date: now,
    status: "scraped"
  };
  Object.keys(job).forEach((k) => job[k] === undefined && delete job[k]);
  return job;
}

async function main() {
  const testOnlyOnePage = process.argv.includes("--test");

  try {
    const existingResult = await querySOLR(COMPANY_CIF);
    console.log(`Found ${existingResult.numFound} existing jobs in SOLR`);

    console.log("Validating company via ANAF...");
    const { company, cif, address } = await validateAndGetCompany();
    COMPANY_NAME = company;

    try {
      await upsertCompany({
        id: cif,
        company,
        brand: "Yonder",
        status: "activ",
        location: address ? [address] : ["Cluj-Napoca"],
        website: ["https://tss-yonder.com"],
        career: ["https://tss-yonder.com/job"],
        lastScraped: new Date().toISOString().split('T')[0],
        scraperFile: "https://raw.githubusercontent.com/emtreila/yonder-scraper/master/.github/workflows/scrape.yml"
      });
    } catch (err) {
      console.log(`Note: Could not upsert company to SOLR core: ${err.message}`);
    }

    console.log("Fetching jobs from Yonder careers page...");
    const html = await fetchJobsPage();
    const rawJobs = parseJobs(html);
    console.log(`Jobs found: ${rawJobs.length}`);

    const jobs = rawJobs.map(job => mapToJobModel(job, cif));

    const payload = {
      source: "tss-yonder.com",
      scrapedAt: new Date().toISOString(),
      company: COMPANY_NAME,
      cif,
      jobs
    };

    fs.writeFileSync("jobs.json", JSON.stringify(payload, null, 2), "utf-8");
    console.log("Saved jobs.json");

    console.log("Upserting jobs to SOLR...");
    await upsertJobs(payload.jobs);

    const finalResult = await querySOLR(COMPANY_CIF);
    console.log(`\nSUMMARY:`);
    console.log(`Existing before: ${existingResult.numFound}`);
    console.log(`Scraped: ${rawJobs.length}`);
    console.log(`In SOLR after: ${finalResult.numFound}`);

    console.log("\n=== DONE ===");
  } catch (err) {
    console.error("Scraper failed:", err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
