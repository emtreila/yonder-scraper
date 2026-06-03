import { getCompanyFromANAF, searchCompany } from "./src/anaf.js";

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.log("Usage: node demoanaf.js <company_name_or_cui>");
    process.exit(1);
  }

  if (/^\d+$/.test(query)) {
    console.log(`Searching by CUI: ${query}`);
    try {
      const data = await getCompanyFromANAF(query);
      console.log(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error:", err.message);
    }
  } else {
    console.log(`Searching by name: ${query}`);
    try {
      const results = await searchCompany(query);
      console.log(JSON.stringify(results, null, 2));
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

main().catch(console.error);
