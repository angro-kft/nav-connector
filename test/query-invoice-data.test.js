const { assert } = require('chai');

const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');
const createInvoiceModifyOperation = require('./lib/create-invoice-modify-operation.js');
const waitInvoiceProcessing = require('./lib/wait-invoice-processing.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceData = require('../src/query-invoice-data.js');

describe('queryInvoiceData()', () => {
  let existingInvoiceNumber;
  let modifiedInvoiceNumber;
  let transactionId;

  before(async function before() {
    /* Create invoice operations. */
    const invoiceCreateOperation = createInvoiceOperations({
      taxNumber: technicalUser.taxNumber,
      size: 2,
    });

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation: invoiceCreateOperation,
    };

    [existingInvoiceNumber, modifiedInvoiceNumber] = invoiceCreateOperation.map(
      operation =>
        Buffer.from(operation.invoice, 'base64')
          .toString()
          .match(/<invoiceNumber>(.*?)<\/invoiceNumber>/g)[0]
          .replace(/<\/?invoiceNumber>/g, '')
    );

    /* Wait for invoice operations to send and be processed. */
    transactionId = await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });

    await waitInvoiceProcessing({
      transactionId,
      technicalUser,
      softwareData,
      axios,
      test: this.test,
    });

    /* After invoices are processed create and send a modifier invoice. */
    const invoiceModifyOperation = createInvoiceModifyOperation({
      taxNumber: technicalUser.taxNumber,
      originalInvoiceNumber: modifiedInvoiceNumber,
    });

    const invoiceModifyOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation: invoiceModifyOperation,
    };

    const invoiceModifyTransactionId = await manageInvoice({
      invoiceOperations: invoiceModifyOperations,
      technicalUser,
      softwareData,
      axios,
    });

    await waitInvoiceProcessing({
      transactionId: invoiceModifyTransactionId,
      technicalUser,
      softwareData,
      axios,
      test: this.test,
    });
  });

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
  });

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
  });

  it('should resolve without "queryResult" property when invoiceQuery query has no result', async () => {
    const invoiceQuery = {
      invoiceNumber: 'invoiceNumber',
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.notProperty(response, 'queryResult');
  });

  it('should resolve without "queryResult" property when queryParams query has no result', async () => {
    const queryParams = {
      invoiceIssueDateFrom: '1900-01-01',
      invoiceIssueDateTo: '1900-01-01',
    };

    const response = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    assert.notProperty(response, 'queryResult');
  });

  it('should resolve with "invoiceResult" and "invoiceDigestList" property when invoiceQuery query has result', async () => {
    const invoiceQuery = {
      invoiceNumber: existingInvoiceNumber,
    };

    const { queryResult } = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.hasAllKeys(queryResult, ['invoiceResult', 'invoiceDigestList']);
  });

  it('should resolve with "invoiceDigestList" property when queryParams query has result', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      invoiceIssueDateFrom: today,
      invoiceIssueDateTo: today,
    };

    const { queryResult } = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    assert.hasAllKeys(queryResult, ['invoiceDigestList']);
    assert.isAbove(queryResult.invoiceDigestList.length, 2);
  });

  it('should normalize invoiceDigestList to Array with single invoiceQuery query digest result', async () => {
    const invoiceQuery = {
      invoiceNumber: existingInvoiceNumber,
    };

    const { queryResult } = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(queryResult.invoiceDigestList, 1);
  });

  it('should normalize invoiceDigestList to Array with single queryParams query digest result', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      invoiceIssueDateFrom: today,
      invoiceIssueDateTo: today,
      transactionParams: {
        transactionId,
        index: 1,
        operation: 'CREATE',
      },
    };

    const { queryResult } = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(queryResult.invoiceDigestList, 1);
  });

  it('should handle query modified invoice response if requestAllModification is true', async () => {
    const invoiceQuery = {
      invoiceNumber: modifiedInvoiceNumber,
      requestAllModification: true,
    };

    const { queryResult } = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(queryResult.invoiceDigestList, 2);
  });

  it('should convert types in invoiceQuery resolve value', async () => {
    const invoiceQuery = {
      invoiceNumber: modifiedInvoiceNumber,
      requestAllModification: true,
    };

    const { queryResult, currentPage, availablePage } = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    const digest = queryResult.invoiceDigestList[0];
    const { invoiceResult } = queryResult;

    assert.isNumber(currentPage);
    assert.isNumber(availablePage);
    assert.isBoolean(invoiceResult.invoiceReference.modifyWithoutMaster);
    assert.isBoolean(invoiceResult.compressedContentIndicator);
    assert.isNumber(digest.invoiceNetAmount);
    assert.isNumber(digest.invoiceVatAmountHUF);
  });

  it('should convert types in queryParams resolve value', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      invoiceIssueDateFrom: today,
      invoiceIssueDateTo: today,
    };

    const { queryResult, currentPage, availablePage } = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    const digest = queryResult.invoiceDigestList[1];

    assert.isNumber(currentPage);
    assert.isNumber(availablePage);
    assert.isNumber(digest.invoiceNetAmount);
    assert.isNumber(digest.invoiceVatAmountHUF);
  });
});
