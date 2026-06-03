import { getCompanyBrand, getCompanyCif } from "../../company.js";

describe("getCompanyBrand", () => {
  test("should return Yonder", () => {
    expect(getCompanyBrand()).toBe("Yonder");
  });
});

describe("getCompanyCif", () => {
  test("should return 4906881", () => {
    expect(getCompanyCif()).toBe("4906881");
  });
});
