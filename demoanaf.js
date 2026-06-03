/**
 * demoanaf.js - CLI tool for ANAF company verification
 *
 * Usage: node demoanaf.js <company_name_or_cui>
 */

import { searchCompany, getCompanyFromANAF } from "./src/anaf.js";

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.log("Usage: node demoanaf.js <company_name_or_cui>");
    process.exit(1);
  }

  if (/^\d+$/.test(query)) {
    console.log(`Searching by CUI: ${query}`);
    const data = await getCompanyFromANAF(query);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`Searching by name: ${query}`);
    const results = await searchCompany(query);
    console.log(JSON.stringify(results, null, 2));
  }
}

main().catch(console.error);
