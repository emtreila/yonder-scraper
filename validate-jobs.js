/**
 * Validate Jobs Schema
 *
 * Ensures scraped jobs match the peviitor.ro job model schema.
 */

import fs from "fs";

export function validateJob(job) {
  const errors = [];

  if (!job.url) errors.push("Missing url");
  if (!job.title) errors.push("Missing title");
  if (!job.company) errors.push("Missing company");
  if (!job.cif) errors.push("Missing cif");

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateJobsFile(filePath = "jobs.json") {
  if (!fs.existsSync(filePath)) {
    return { valid: false, errors: [`File not found: ${filePath}`], count: 0 };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const jobs = data.jobs || [];

  if (jobs.length === 0) {
    return { valid: false, errors: ["No jobs found in file"], count: 0 };
  }

  const allErrors = [];
  for (let i = 0; i < jobs.length; i++) {
    const result = validateJob(jobs[i]);
    if (!result.valid) {
      allErrors.push(`Job #${i} (${jobs[i].url || "no-url"}): ${result.errors.join(", ")}`);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    count: jobs.length
  };
}

if (process.argv[1]?.endsWith("validate-jobs.js")) {
  const result = validateJobsFile(process.argv[2]);
  if (result.valid) {
    console.log(`✓ All ${result.count} jobs are valid`);
    process.exit(0);
  } else {
    console.error(`✗ Validation failed for ${result.errors.length} job(s):`);
    result.errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
}
