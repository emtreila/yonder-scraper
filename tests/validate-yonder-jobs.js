import { querySOLR, deleteJobByUrl } from "../solr.js";
import fetch from "node-fetch";

const COMPANY_CIF = "4906881";
const TIMEOUT = 10000;

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "User-Agent": "job_seeker_ro_spider" }
    });
    return { url, status: res.status, valid: res.ok };
  } catch (err) {
    return { url, status: 0, valid: false, error: err.message };
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const doDelete = process.argv.includes("--delete");

  console.log(`=== Validate Yonder Jobs (${dryRun ? "DRY RUN" : "LIVE"}) ===\n`);

  const result = await querySOLR(COMPANY_CIF);
  const numFound = result?.response?.numFound || 0;
  console.log(`Total jobs in SOLR: ${numFound}\n`);

  if (numFound === 0) {
    console.log("No jobs to validate.");
    return;
  }

  const jobs = result.response.docs;
  const invalidUrls = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const res = await checkUrl(job.url);
    const status = res.status > 0 ? res.status : "ERR";
    const icon = res.valid ? "[OK]" : "[X]";
    console.log(`${icon} [${i+1}/${jobs.length}] ${status} - ${job.title} (${job.url})`);
    if (!res.valid) invalidUrls.push(job.url);
  }

  if (invalidUrls.length > 0) {
    console.log(`\n${invalidUrls.length} invalid URLs found`);

    if (doDelete) {
      console.log("Deleting invalid jobs from SOLR...");
      for (const url of invalidUrls) {
        await deleteJobByUrl(url);
      }
      console.log(`Deleted ${invalidUrls.length} invalid jobs`);
    } else {
      console.log("Dry run - no deletions performed.");
      console.log("Run with --delete flag to remove invalid jobs.");
    }
  } else {
    console.log("\nAll jobs valid!");
  }
}

if (process.argv[1]?.includes('validate-yonder-jobs')) {
  main().catch(err => {
    console.error("Validation failed:", err);
    process.exit(1);
  });
}

export { checkUrl };
