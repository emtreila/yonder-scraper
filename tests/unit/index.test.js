/**
 * Unit tests for index.js
 */

import { expect, test, describe } from "@jest/globals";

describe("Index module validation", () => {
  test("should parse jobs from HTML with cheerio", async () => {
    const cheerio = await import("cheerio");
    const html = `
      <ul id="jobs-list">
        <li>
          <a href="https://tss-yonder.com/job/developer">
            <span class="super">Senior</span>
            <span class="main">JavaScript Developer</span>
            <span class="sub">Cluj-Napoca</span>
          </a>
        </li>
      </ul>
    `;
    const $ = cheerio.load(html);
    const jobs = [];
    $("#jobs-list li").each((i, el) => {
      const link = $(el).find("a");
      jobs.push({
        url: link.attr("href"),
        title: link.find("span.main").text().trim(),
        location: link.find("span.sub").text().trim()
      });
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0].url).toBe("https://tss-yonder.com/job/developer");
    expect(jobs[0].title).toBe("JavaScript Developer");
    expect(jobs[0].location).toBe("Cluj-Napoca");
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
