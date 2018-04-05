const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const queryInvoiceData = require('../src/query-invoice-data.js');

describe('queryInvoiceData()', () => {
  it('should resolve to queryResults with invoiceQuery param', async () => {
    const invoiceQuery = {
      invoiceNumber: 'invoiceNumber',
      requestAllModification: true,
    };

    const queryResults = await queryInvoiceData({
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(queryResults);
  }).timeout(2000);

  it('should resolve to queryResults with queryParams param', async () => {
    const queryParams = {
      invoiceIssueDateFrom: `${new Date().toISOString().split('T')[0]}Z`,
      invoiceIssueDateTo: `${new Date().toISOString().split('T')[0]}Z`,
    };

    const queryResults = await queryInvoiceData({
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(queryResults);
  }).timeout(2000);
});
