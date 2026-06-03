import { parseJobsFromHtml, mapToJobModel, transformJobsForSOLR } from '../../index.js';

describe('Scraper Workflow Integration', () => {
  test('should execute full scrape pipeline with mock data', async () => {
    const mockHtml = `
      <h2>open positions (2)</h2>
      <ul>
        <li><a href="https://tss-yonder.com/job/financial-analyst">junior Financial Analyst Cluj-Napoca</a></li>
        <li><a href="https://tss-yonder.com/job/cyber-security-engineer">mid Cyber Security Engineer Romania (Remote)</a></li>
      </ul>
    `;

    const jobs = parseJobsFromHtml(mockHtml);
    expect(jobs.length).toBe(2);
    expect(jobs[0].title).toContain('Financial Analyst');
    expect(jobs[1].title).toContain('Cyber Security Engineer');

    const mappedJobs = jobs.map(job => mapToJobModel(job, '4906881', 'YONDER SRL'));
    expect(mappedJobs[0].cif).toBe('4906881');
    expect(mappedJobs[0].company).toBe('YONDER SRL');

    const payload = {
      source: 'tss-yonder.com',
      scrapedAt: new Date().toISOString(),
      company: 'YONDER SRL',
      cif: '4906881',
      jobs: mappedJobs
    };

    const transformed = transformJobsForSOLR(payload);
    expect(transformed.company).toBe('YONDER SRL');
    expect(transformed.jobs.length).toBe(2);
    expect(transformed.jobs[0].workmode).toBeDefined();
  });
});
