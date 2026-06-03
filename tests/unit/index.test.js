import { parseJobsFromHtml, mapToJobModel, transformJobsForSOLR } from "../../index.js";

describe("parseJobsFromHtml", () => {
  test("should extract jobs from real HTML structure", () => {
    const html = `
      <h2>open positions (3)</h2>
      <ul>
        <li><a href="https://tss-yonder.com/job/financial-analyst">junior Financial Analyst Cluj-Napoca</a></li>
        <li><a href="https://tss-yonder.com/job/ai-engineer">junior AI Engineer Cluj-Napoca</a></li>
        <li><a href="https://tss-yonder.com/job/cyber-security-engineer">mid Cyber Security Engineer Romania (Remote)</a></li>
      </ul>
    `;

    const jobs = parseJobsFromHtml(html);
    expect(jobs.length).toBe(3);
    expect(jobs[0].title).toContain("Financial Analyst");
    expect(jobs[0].location).toContain("Cluj-Napoca");
    expect(jobs[1].title).toContain("AI Engineer");
    expect(jobs[2].title).toContain("Cyber Security Engineer");
    expect(jobs[2].workmode).toBe("remote");
  });

  test("should return empty array for no job list", () => {
    const jobs = parseJobsFromHtml("<html><body></body></html>");
    expect(jobs).toEqual([]);
  });
});

describe("mapToJobModel", () => {
  test("should map raw job to Solr model", () => {
    const rawJob = {
      url: "https://tss-yonder.com/job/test",
      title: "Junior Test Engineer",
      location: ["Cluj-Napoca"],
      workmode: "on-site"
    };

    const result = mapToJobModel(rawJob, "4906881", "YONDER SRL");
    expect(result.url).toBe("https://tss-yonder.com/job/test");
    expect(result.title).toBe("Junior Test Engineer");
    expect(result.company).toBe("YONDER SRL");
    expect(result.cif).toBe("4906881");
    expect(result.location).toEqual(["Cluj-Napoca"]);
    expect(result.status).toBe("scraped");
  });
});

describe("transformJobsForSOLR", () => {
  test("should transform and validate jobs", () => {
    const payload = {
      source: "tss-yonder.com",
      company: "yonder srl",
      cif: "4906881",
      jobs: [
        {
          url: "https://tss-yonder.com/job/test",
          title: "Test Engineer",
          company: "yonder srl",
          cif: "4906881",
          location: ["Cluj-Napoca"],
          workmode: "hybrid",
          date: "2026-01-01T00:00:00Z",
          status: "scraped"
        }
      ]
    };

    const result = transformJobsForSOLR(payload);
    expect(result.company).toBe("YONDER SRL");
    expect(result.jobs[0].location).toContain("Cluj-Napoca");
  });
});
