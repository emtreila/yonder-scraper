/**
 * ANAF Module - Romanian Company Registry Integration
 *
 * Provides ANAF (Agenția Națională de Administrare Fiscală) integration
 * for Romanian company validation via the demoanaf.ro API.
 */

import fetch from "node-fetch";

const ANAF_API_TIMEOUT = 15000;
const SEARCH_URL = "https://demoanaf.ro/demo/search.js";
const COMPANY_URL = "https://api.anaf.ro";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function searchCompany(query) {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&_=${Date.now()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "job_seeker_ro_spider",
      "Accept": "application/json"
    },
    signal: AbortSignal.timeout(ANAF_API_TIMEOUT)
  });
  if (!res.ok) throw new Error(`ANAF search failed: ${res.status}`);
  return await res.json();
}

export async function getCompanyFromANAF(cui) {
  const timestamp = Date.now();
  const url = `${COMPANY_URL}/anaf/ws/echilibru/${cui}?_=${timestamp}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "job_seeker_ro_spider",
      "Accept": "application/json"
    },
    signal: AbortSignal.timeout(ANAF_API_TIMEOUT)
  });
  if (!res.ok) throw new Error(`ANAF data fetch failed: ${res.status}`);
  const data = await res.json();
  return parseANAFResponse(data);
}

export async function getCompanyFromANAFWithFallback(cui, fallbackData = null) {
  try {
    const data = await getCompanyFromANAF(cui);
    if (data && data.name) return data;
  } catch (err) {
    console.log(`ANAF query failed: ${err.message}`);
  }
  return fallbackData;
}

function parseANAFResponse(data) {
  const found = data?.found?.[0] || data;
  return {
    cui: found?.cui || null,
    name: found?.name || found?.denumire || null,
    address: found?.address || found?.adresa || found?.adresaSediu || null,
    registrationNumber: found?.registrationNumber || found?.nrRegCom || null,
    caenCode: found?.caenCode || found?.codCAEN || null,
    registrationDate: found?.registrationDate || found?.dataInfiintare || null,
    inactive: found?.inactive || found?.stareInactiv || false
  };
}
