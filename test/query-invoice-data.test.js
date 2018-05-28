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

  it('should normalize invoiceQuery object key order', async () => {
    const invoiceQuery = {
      requestAllModification: true,
      invoiceNumber: 'invoiceNumber',
    };

    await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });
  }).timeout(6000);

  it('should normalize queryParams object key order', async () => {
    const queryParams = {
      transactionParams: {
        operation: 'CREATE',
        index: 1,
        transactionId: '33DD1A7QAI55',
      },
      invoiceVatAmountHUFLessThan: 1,
      invoiceVatAmountHUFGreaterThan: 2,
      invoiceNetAmountLessThan: 1,
      invoiceNetAmountGreaterThan: 2,
      currency: 'HUF',
      invoiceDeliveryLessThan: '2019-05-15',
      invoiceDeliveryGreaterThan: '2019-05-15',
      source: 'WEB',
      invoiceAppearance: 'PAPER',
      paymentMethod: 'TRANSFER',
      invoiceCategory: 'NORMAL',
      customerTaxNumber: '11111111',
      invoiceIssueDateTo: '2019-05-15',
      invoiceIssueDateFrom: '2019-05-15',
    };

    await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });
  }).timeout(6000);
});
