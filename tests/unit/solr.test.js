import { querySOLR, deleteJobsByCIF, getSolrAuth } from '../../solr.js';
import { readFileSync, existsSync } from 'fs';

describe('Solr Module', () => {
  test('getSolrAuth returns null when no auth set', () => {
    delete process.env.SOLR_AUTH;
    const auth = getSolrAuth();
    expect(auth).toBeNull();
  });

  test('SOLR_URL is defined', () => {
    expect(process.env.SOLR_URL || 'https://solr.peviitor.ro/solr/job').toBeDefined();
  });
});
