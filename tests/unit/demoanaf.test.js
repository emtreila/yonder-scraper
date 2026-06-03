import { searchCompany, getCompanyFromANAFWithFallback } from '../../src/anaf.js';

const CACHED_ANAF_DATA = {
  cui: 4906881,
  name: "YONDER SRL",
  address: "MUNICIPIUL CLUJ-NAPOCA",
  registrationNumber: "J1993003604122",
  caenCode: "6201",
  registrationDate: "1993-10-22",
  inactive: false
};

describe('ANAF Module', () => {
  describe('searchCompany', () => {
    it('should return array of companies for valid brand', async () => {
      const results = await searchCompany('Yonder');
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('cui');
        expect(results[0]).toHaveProperty('name');
      }
    });

    it('should return empty array for non-existent brand', async () => {
      const results = await searchCompany('NonExistentBrandXYZ123');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getCompanyFromANAFWithFallback', () => {
    it('should return cached data for invalid CIF', async () => {
      const data = await getCompanyFromANAFWithFallback('0000000', CACHED_ANAF_DATA);
      expect(data).toBeDefined();
      expect(data.cui).toBe(4906881);
      expect(data.name).toBe('YONDER SRL');
    }, 15000);
  });
});
