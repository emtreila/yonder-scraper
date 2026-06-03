import { searchCompany, getCompanyFromANAF } from '../../src/anaf.js';

describe("ANAF API Integration", () => {
  test("should search for Yonder", async () => {
    const results = await searchCompany("Yonder");
    expect(Array.isArray(results)).toBe(true);
  });

  test("should fetch company by CIF", async () => {
    const data = await getCompanyFromANAF("4906881");
    expect(data).toBeDefined();
    if (data) {
      expect(data.name).toBeDefined();
    }
  });
});
