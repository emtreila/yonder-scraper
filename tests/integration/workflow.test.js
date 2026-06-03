/**
 * Integration tests for scraper workflow
 */

import { expect, test, describe } from "@jest/globals";
import fs from "fs";

describe("Workflow integration", () => {
  test("should have valid package.json", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    expect(pkg.type).toBe("module");
    expect(pkg.dependencies).toHaveProperty("node-fetch");
    expect(pkg.dependencies).toHaveProperty("cheerio");
    expect(pkg.devDependencies).toHaveProperty("jest");
  });

  test("should have valid scraper entry point", () => {
    expect(fs.existsSync("index.js")).toBe(true);
    const content = fs.readFileSync("index.js", "utf-8");
    expect(content).toContain("tss-yonder.com");
  });
});
