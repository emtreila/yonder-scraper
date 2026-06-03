/**
 * Unit tests for company.js
 */

import { expect, test, describe } from "@jest/globals";
import fs from "fs";
import path from "path";

describe("Company module", () => {
  test("company.json should exist and have valid CIF", () => {
    const compPath = path.resolve("company.json");
    expect(fs.existsSync(compPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(compPath, "utf-8"));
    expect(data.summary.cif).toBe("4906881");
    expect(data.summary.company).toBe("YONDER SRL");
    expect(data.summary.active).toBe(true);
  });
});
