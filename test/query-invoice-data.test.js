const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const queryInvoiceData = require('../src/query-invoice-data.js');

describe('queryInvoiceData()', () => {
  it('should resolve to queryResults with invoiceQuery param', async () => {
    const invoiceQuery = {
      invoiceNumber: '1526972700136',
      requestAllModification: true,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isNumber(response.currentPage);
    assert.isNumber(response.availablePage);
    assert.isObject(response.queryResult);
  }).timeout(6000);

  it('should resolve to queryResults with queryParams param', async () => {
    const queryParams = {
      invoiceIssueDateFrom: '2019-05-15',
      invoiceIssueDateTo: '2019-05-15',
    };

    const response = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isNumber(response.currentPage);
    assert.isNumber(response.availablePage);
    assert.isArray(response.queryResult);
  }).timeout(6000);
});
