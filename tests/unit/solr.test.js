/**
 * Unit tests for solr.js
 */

import { expect, test, describe, jest } from "@jest/globals";

describe("Solr module", () => {
  test("should construct correct SOLR URLs", () => {
    process.env.SOLR_AUTH = "dGVzdDp0ZXN0";
    const solr = await import("../../solr.js");
  });
});
