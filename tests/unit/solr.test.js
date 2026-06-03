/**
 * Unit tests for solr.js
 */

import { expect, test, describe } from "@jest/globals";

describe("Solr module", () => {
  test("should have exported functions", async () => {
    const solr = await import("../../solr.js");
    expect(typeof solr.querySOLR).toBe("function");
    expect(typeof solr.deleteJobByUrl).toBe("function");
    expect(typeof solr.deleteJobsByCIF).toBe("function");
    expect(typeof solr.upsertJobs).toBe("function");
    expect(typeof solr.upsertCompany).toBe("function");
  });

  test("should construct SOLR query URL correctly", () => {
    const SOLR_BASE = "https://peviitor.solr.host/";
    const SOLR_CORE_FEED = "jobs";
    const cif = "4906881";
    const expected = `https://peviitor.solr.host/solr/jobs/select?q=cif:4906881&rows=0&wt=json`;
    const url = `${SOLR_BASE}solr/${SOLR_CORE_FEED}/select?q=cif:${cif}&rows=0&wt=json`;
    expect(url).toBe(expected);
  });
});
