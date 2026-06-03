/**
 * Validate Yonder Jobs
 *
 * Lightweight validation script for job files.
 * Usage: node tests/validate-yonder-jobs.js [path/to/jobs.json]
 */

import { validateJobsFile } from "../validate-jobs.js";

const filePath = process.argv[2] || "jobs.json";
const result = validateJobsFile(filePath);

if (result.valid) {
  console.log(`✓ All ${result.count} jobs valid`);
  process.exit(0);
} else {
  console.error(`✗ ${result.errors.length} error(s) for ${result.count} jobs:`);
  result.errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
