import fetch from 'node-fetch';
import { readFileSync, existsSync } from 'fs';

const ANAF_API_URL = 'https://demoanaf.ro/api/company/';
const ANAF_SEARCH_URL = 'https://demoanaf.ro/api/search';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getCompanyFromANAF(cif) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${ANAF_API_URL}${cif}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'job_seeker_ro_spider'
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`ANAF API error: ${response.status}`);
      }

      const json = await response.json();
      if (json.success && json.data) {
        return json.data;
      }
      if (json.success === false) {
        throw new Error(json.error?.message || 'ANAF returned error');
      }
      throw new Error('Invalid ANAF response format');
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.log(`  ANAF attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}, retrying...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        throw err;
      }
    }
  }
}

export async function getCompanyFromANAFWithFallback(cif, cachedData) {
  try {
    return await getCompanyFromANAF(cif);
  } catch (err) {
    if (cachedData) {
      return cachedData;
    }

    if (existsSync('company.json')) {
      try {
        const cached = JSON.parse(readFileSync('company.json', 'utf-8'));
        if (cached.anaf) {
          return cached.anaf;
        }
      } catch (e) {}
    }

    return null;
  }
}

export async function searchCompany(brandName) {
  try {
    const response = await fetch(`${ANAF_SEARCH_URL}?q=${encodeURIComponent(brandName)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'job_seeker_ro_spider'
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`ANAF search API error: ${response.status}`);
    }

    const json = await response.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}
