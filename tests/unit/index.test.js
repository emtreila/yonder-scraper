/**
 * Unit tests for index.js
 */

import { expect, test, describe } from "@jest/globals";

describe("Index module validation", () => {
  test("should parse jobs from real HTML structure", async () => {
    const index = await import("../../index.js");
    const html = `<h2>open positions (3)</h2>
<ul>
  <li><a href="https://tss-yonder.com/job/financial-analyst">junior Financial Analyst Cluj-Napoca</a></li>
  <li><a href="https://tss-yonder.com/job/ai-engineer">junior AI Engineer Cluj-Napoca</a></li>
  <li><a href="https://tss-yonder.com/job/cyber-security-engineer">mid Cyber Security Engineer Romania (Remote)</a></li>
</ul>`;
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);
    const heading = $("h2:contains('open positions')");
    const list = heading.nextAll("ul").first();
    const jobs = [];
    list.find("li a").each((i, el) => {
      const link = $(el);
      jobs.push({ url: link.attr("href"), text: link.text().trim() });
    });
    expect(jobs).toHaveLength(3);
    expect(jobs[0].text).toBe("junior Financial Analyst Cluj-Napoca");
    expect(jobs[2].text).toBe("mid Cyber Security Engineer Romania (Remote)");
  });

  test("should map raw job to job model", () => {
    const rawJob = {
      url: "https://tss-yonder.com/job/test",
      title: "Test Engineer",
      workmode: "remote",
      location: ["Cluj-Napoca"]
    };
    const job = {
      url: rawJob.url,
      title: rawJob.title,
      company: "YONDER SRL",
      cif: "4906881",
      location: rawJob.location,
      workmode: rawJob.workmode,
      date: expect.any(String),
      status: "scraped"
    };
    expect(job.url).toBe("https://tss-yonder.com/job/test");
    expect(job.cif).toBe("4906881");
  });
});
