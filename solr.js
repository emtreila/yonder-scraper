/**
 * SOLR Module - Job/Company Storage via Apache Solr
 */

import fetch from "node-fetch";
import fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const SOLR_BASE = process.env.SOLR_BASE || "https://peviitor.solr.host/";
const SOLR_CORE_FEED = process.env.SOLR_CORE_FEED || "jobs";
const SOLR_CORE_COMPANY = process.env.SOLR_CORE_COMPANY || "companies";
const SOLR_AUTH = process.env.SOLR_AUTH || "";
const REQUEST_TIMEOUT = 30000;

function buildHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "solr-update-yonder/1.0"
  };
  if (SOLR_AUTH) {
    headers["Authorization"] = `Basic ${SOLR_AUTH}`;
  }
  return headers;
}

function buildUrl(core, path = "") {
  return `${SOLR_BASE.replace(/\/+$/, "")}/solr/${core}/${path}`;
}

async function solrRequest(url, method = "GET", body = null) {
  const options = {
    method,
    headers: buildHeaders(),
    signal: AbortSignal.timeout ? AbortSignal.timeout(REQUEST_TIMEOUT) : undefined
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SOLR ${method} ${url} returned ${res.status}: ${text.slice(0, 300)}`);
  }
  return await res.json();
}

export async function querySOLR(cif, rows = 0) {
  const query = `cif:${cif}`;
  const url = buildUrl(SOLR_CORE_FEED, `select?q=${encodeURIComponent(query)}&rows=${rows}&wt=json`);
  return await solrRequest(url);
}

export async function deleteJobByUrl(url) {
  const deleteUrl = buildUrl(SOLR_CORE_FEED, "update?commit=true");
  const body = { delete: { query: `url:"${url}"` } };
  return await solrRequest(deleteUrl, "POST", body);
}

export async function deleteJobsByCIF(cif) {
  const deleteUrl = buildUrl(SOLR_CORE_FEED, "update?commit=true");
  const body = { delete: { query: `cif:${cif}` } };
  return await solrRequest(deleteUrl, "POST", body);
}

export async function upsertJobs(jobs, commit = true) {
  if (!jobs || jobs.length === 0) {
    console.log("No jobs to upsert");
    return;
  }
  const url = buildUrl(SOLR_CORE_FEED, `update${commit ? "?commit=true" : ""}`);
  return await solrRequest(url, "POST", jobs);
}

export async function upsertCompany(companyData) {
  const url = buildUrl(SOLR_CORE_COMPANY, "update?commit=true");
  return await solrRequest(url, "POST", [companyData]);
}

export async function getCompanyByCIF(cif) {
  const query = `id:${cif}`;
  const url = buildUrl(SOLR_CORE_COMPANY, `select?q=${encodeURIComponent(query)}&rows=1&wt=json`);
  const result = await solrRequest(url);
  return result.response?.docs?.[0] || null;
}

export async function deleteCompanyByCIF(cif) {
  const url = buildUrl(SOLR_CORE_COMPANY, "update?commit=true");
  return await solrRequest(url, "POST", { delete: { query: `id:${cif}` } });
}
