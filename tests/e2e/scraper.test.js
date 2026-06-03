/**
 * E2E test: validate scraped jobs
 */

import { expect, test, describe } from "@jest/globals";
import fs from "fs";
import { validateJobsFile } from "../../validate-jobs.js";

describe("E2E scraper validation", () => {
  test("should validate jobs.json if it exists", () => {
    if (fs.existsSync("jobs.json")) {
      const result = validateJobsFile("jobs.json");
      expect(result.valid).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    }
  });
});
