/**
 * Unit tests for demoanaf.js
 */

import { expect, test, describe } from "@jest/globals";

describe("ANAF module", () => {
  test("should parse ANAF response correctly", async () => {
    const { parseANAFResponse } = await import("../../src/anaf.js");
    const mockResponse = {
      cui: 4906881,
      name: "YONDER SRL",
      address: "Cluj-Napoca",
      registrationNumber: "J1993003604122",
      caenCode: "6201",
      registrationDate: "1993-10-22",
      inactive: false
    };
    const parsed = parseANAFResponse(mockResponse);
    expect(parsed.cui).toBe(4906881);
    expect(parsed.name).toBe("YONDER SRL");
    expect(parsed.inactive).toBe(false);
  });
});
