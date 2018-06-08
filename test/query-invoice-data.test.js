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
  let modifierInvoiceNumber;
  let transactionId;

  before(async function before() {
    const invoiceCreateOperation = createInvoiceOperations({
      taxNumber: technicalUser.taxNumber,
    }).slice(0, 2);

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation: invoiceCreateOperation,
    };

    existingInvoiceNumber = Buffer.from(
      invoiceCreateOperation[0].invoice,
      'base64'
    )
      .toString()
      .match(/<invoiceNumber>(.*?)<\/invoiceNumber>/g)[0]
      .replace(/<\/?invoiceNumber>/g, '');

    modifiedInvoiceNumber = Buffer.from(
      invoiceCreateOperation[1].invoice,
      'base64'
    )
      .toString()
      .match(/<invoiceNumber>(.*?)<\/invoiceNumber>/g)[0]
      .replace(/<\/?invoiceNumber>/g, '');

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

    const invoiceModifyOperation = createInvoiceModifyOperation({
      taxNumber: technicalUser.taxNumber,
      originalInvoiceNumber: modifiedInvoiceNumber,
    });

    modifierInvoiceNumber = Buffer.from(
      invoiceModifyOperation[0].invoice,
      'base64'
    )
      .toString()
      .match(/<invoiceNumber>(.*?)<\/invoiceNumber>/g)[0]
      .replace(/<\/?invoiceNumber>/g, '');

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

  it('should resolve without "queryResult" property when invoiceQuery has no result', async () => {
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

  it('should resolve without "queryResult" property when queryParams has no result', async () => {
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

  it('should resolve with "invoiceResult" property when invoiceQuery has result', async () => {
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

    assert.hasAllKeys(queryResult, ['invoiceResult']);
  });

  it('should resolve with "invoiceDigestList" property when queryParams has result', async () => {
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

  it('should normalize invoiceDigestList to Array with single digest result', async () => {
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

  /*
  it('should resolve with invoiceQuery param when requestAllModification is true', async () => {
    const invoiceQuery = {
      invoiceNumber: existingInvoiceNumber,
      requestAllModification: false,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(response.queryResult, 2);
  });

  it('', async () => {
    const invoiceQuery = {
      invoiceNumber: modifiedInvoiceNumber,
      requestAllModification: false,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(response.queryResult, 2);
  });

  it('', async () => {
    const invoiceQuery = {
      invoiceNumber: modifierInvoiceNumber,
      requestAllModification: false,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(response.queryResult, 2);
  });
  */

  it('should convert types in invoiceQuery resolve value', async () => {
    const invoiceQuery = {
      invoiceNumber: existingInvoiceNumber,
      requestAllModification: true,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    const { invoiceResult } = response.queryResult;
    const firstDigest = response.queryResult.invoiceDigestList[0];

    assert.isNumber(response.currentPage);
    assert.isNumber(response.availablePage);
    assert.isBoolean(invoiceResult.invoiceReference.modifyWithoutMaster);
    assert.isBoolean(invoiceResult.compressedContentIndicator);
    assert.isNumber(firstDigest.invoiceNetAmount);
    assert.isNumber(firstDigest.invoiceVatAmountHUF);
  });

  it('should convert types in queryParams resolve value', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      invoiceIssueDateFrom: today,
      invoiceIssueDateTo: today,
    };

    const response = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    const firstDigest = response.queryResult.invoiceDigestList[0];

    assert.isNumber(response.currentPage);
    assert.isNumber(response.availablePage);
    assert.isNumber(firstDigest.invoiceNetAmount);
    assert.isNumber(firstDigest.invoiceVatAmountHUF);
  });
});
