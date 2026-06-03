/**
 * Company Module - Company Validation and Data Management
 */

import fetch from "node-fetch";
import fs from "fs";
import { querySOLR, deleteJobsByCIF } from "./solr.js";
import { getCompanyFromANAF, searchCompany, getCompanyFromANAFWithFallback } from "./src/anaf.js";

const Peviitor_API_URL = "https://api.peviitor.ro/v1/company/";
const COMPANY_BRAND = "Yonder";

export function getCompanyBrand() {
  return COMPANY_BRAND;
}

const COMPANY_MODEL_FIELDS = [
  { name: "id", required: true, type: "string" },
  { name: "company", required: true, type: "string" },
  { name: "brand", required: false, type: "string" },
  { name: "group", required: false, type: "string" },
  { name: "status", required: false, type: "string", allowed: ["activ", "suspendat", "inactiv", "radiat"] },
  { name: "location", required: false, type: "array" },
  { name: "website", required: false, type: "array" },
  { name: "career", required: false, type: "array" },
  { name: "lastScraped", required: false, type: "string" },
  { name: "scraperFile", required: false, type: "string" }
];

async function getCompanyFromPeviitor(companyName) {
  const url = `${Peviitor_API_URL}?name=${encodeURIComponent(companyName)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "job_seeker_ro_spider" }
  });
  if (!res.ok) throw new Error(`Peviitor API error: ${res.status}`);
  const data = await res.json();
  return data.companies?.[0] || null;
}

function validateCompanyModel(data) {
  const errors = [];
  for (const field of COMPANY_MODEL_FIELDS) {
    const value = data[field.name];
    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push(`Missing required field: ${field.name}`);
      continue;
    }
    if (value !== undefined && value !== null) {
      if (field.type === "string" && typeof value !== "string") {
        errors.push(`Field ${field.name} should be string, got ${typeof value}`);
      }
      if (field.type === "array" && !Array.isArray(value)) {
        errors.push(`Field ${field.name} should be array, got ${typeof value}`);
      }
      if (field.allowed && !field.allowed.includes(value)) {
        errors.push(`Field ${field.name} has invalid value "${value}". Allowed: ${field.allowed.join(", ")}`);
      }
    }
  }
  return errors.length === 0;
}

function saveCompanyData(anafData, peviitorData) {
  const companyData = {
    validatedAt: new Date().toISOString(),
    source: "ANAF",
    brand: COMPANY_BRAND,
    anaf: anafData,
    peviitor: peviitorData,
    summary: {
      company: anafData?.name || null,
      cif: anafData?.cui?.toString() || null,
      active: !anafData?.inactive,
      inactiveSince: anafData?.inactiveSince || null,
      reactivatedSince: anafData?.reactivatedSince || null,
      address: anafData?.address || null,
      registrationNumber: anafData?.registrationNumber || null,
      caenCode: anafData?.caenCode || null,
      vatRegistered: anafData?.vatRegistered || false,
      eFacturaRegistered: anafData?.eFacturaRegistered || false
    }
  };
  fs.writeFileSync("company.json", JSON.stringify(companyData, null, 2), "utf-8");
  return companyData;
}

function loadCachedCompanyData() {
  if (fs.existsSync("company.json")) {
    try {
      const data = JSON.parse(fs.readFileSync("company.json", "utf-8"));
      if (data?.anaf?.cui && data?.anaf?.name) {
        return data;
      }
    } catch (e) {
      console.log("Warning: Could not load cached company data");
    }
  }
  return null;
}

export async function getCompanyData() {
  const cachedData = loadCachedCompanyData();

  if (!cachedData?.summary?.cif) {
    console.log(`Searching for company with brand: ${COMPANY_BRAND}`);
    const searchResults = await searchCompany(COMPANY_BRAND);

    if (!searchResults || searchResults.length === 0) {
      throw new Error(`No companies found for brand: ${COMPANY_BRAND}`);
    }

    const exactMatch = searchResults.find(c =>
      (c.name.toUpperCase().startsWith(COMPANY_BRAND.toUpperCase() + " ") ||
       c.name.toUpperCase().includes(" " + COMPANY_BRAND.toUpperCase() + " ")) &&
      c.statusLabel === "Funcțiune"
    );

    if (!exactMatch) {
      const activeMatch = searchResults.find(c => c.statusLabel === "Funcțiune");
      if (!activeMatch) throw new Error(`No active company found for brand: ${COMPANY_BRAND}`);
      var selectedCIF = activeMatch.cui;
    } else {
      var selectedCIF = exactMatch.cui;
    }

    const anafData = await getCompanyFromANAFWithFallback(selectedCIF, cachedData?.anaf);
    if (!anafData) throw new Error("No data from ANAF and no cache");
    if (!anafData.name) throw new Error("ANAF returned no company name");
    if (!anafData.cui) throw new Error("ANAF returned no CUI");

    const company = anafData.name.toUpperCase();
    const cif = anafData.cui.toString();
    const active = !anafData.inactive;

    return { company, cif, active, anafData };
  } else {
    const anafData = cachedData.anaf;
    const company = anafData.name.toUpperCase();
    const cif = anafData.cui.toString();
    const active = !anafData.inactive;
    return { company, cif, active, anafData };
  }
}

export async function validateAndGetCompany() {
  const { company, cif, active, anafData } = await getCompanyData();

  const solrResult = await querySOLR(cif);
  console.log(`Jobs found in SOLR for CIF ${cif}: ${solrResult.numFound}`);

  let peviitorData = null;
  try {
    peviitorData = await getCompanyFromPeviitor(COMPANY_BRAND);
  } catch (e) {
    console.log("Peviitor API error:", e.message);
  }

  saveCompanyData(anafData, peviitorData);

  if (!active) {
    if (solrResult.numFound > 0) await deleteJobsByCIF(cif);
    return { status: "inactive", company, cif, existingJobsCount: solrResult.numFound };
  }

  const address = anafData?.address || anafData?.headquartersAddress?.locality || "";
  return { status: "active", company, cif, existingJobsCount: solrResult.numFound, address, anafData };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("company.js")) {
  const { company, cif, active } = await getCompanyData();
  console.log(`Result: company=${company}, cif=${cif}, active=${active}`);
}
