import { parseJobsFromHtml } from "../../index.js";
import fetch from "node-fetch";

describe("Yonder Careers E2E", () => {
  test("should fetch and parse real careers page", async () => {
    const res = await fetch("https://tss-yonder.com/job", {
      headers: { "User-Agent": "job_seeker_ro_spider" },
      signal: AbortSignal.timeout(30000),
    });
    expect(res.ok).toBe(true);

    const html = await res.text();
    const jobs = parseJobsFromHtml(html);

    expect(Array.isArray(jobs)).toBe(true);

    if (jobs.length > 0) {
      expect(jobs[0].title).toBeDefined();
      expect(jobs[0].url).toBeDefined();
      expect(jobs[0].url).toContain("tss-yonder.com");
      expect(jobs[0].location).toBeDefined();
      expect(jobs[0].workmode).toBeDefined();
    }
  }, 30000);

  test("should extract work mode correctly", async () => {
    const res = await fetch("https://tss-yonder.com/job", {
      headers: { "User-Agent": "job_seeker_ro_spider" },
      signal: AbortSignal.timeout(30000),
    });
    const html = await res.text();
    const jobs = parseJobsFromHtml(html);

    const validModes = ['remote', 'on-site', 'hybrid'];
    for (const job of jobs) {
      expect(validModes).toContain(job.workmode);
    }
  }, 30000);
});
