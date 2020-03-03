const { assert } = require('chai');

const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');
const createInvoiceModifyOperation = require('./lib/create-invoice-modify-operation.js');
const waitInvoiceProcessing = require('./lib/wait-invoice-processing.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceDigest = require('../src/query-invoice-digest.js');

describe('queryInvoiceDigest()', () => {
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
      compressedContent: false,
      invoiceOperation: invoiceCreateOperation,
    };

    [existingInvoiceNumber, modifiedInvoiceNumber] = invoiceCreateOperation.map(
      operation =>
        Buffer.from(operation.invoiceData, 'base64')
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

  it('should normalize queryParams object key order', async () => {
    const queryParams = {
      invoiceOperation: 'CREATE',
      index: 1,
      transactionId: '33DD1A7QAI55',
      dateTo: '2019-05-15',
      dateFrom: '2019-05-15',
    };

    await queryInvoiceDigest({
      page: 1,
      queryParams,
      invoiceDirection: 'OUTBOUND',
      technicalUser,
      softwareData,
      axios,
    });
  });

  it('should resolve without "invoiceDigestResult" property when queryParams query has no result', async () => {
    const queryParams = {
      dateFrom: '2018-01-01',
      dateTo: '2018-01-01',
    };

    const response = await queryInvoiceDigest({
      page: 1,
      queryParams,
      invoiceDirection: 'OUTBOUND',
      technicalUser,
      softwareData,
      axios,
    });

    assert.notProperty(response, 'invoiceDigestResult');
  });

  it('should resolve with "invoiceDigest" "availablePage" "currentPage" property when queryParams query has result', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      dateFrom: today,
      dateTo: today,
    };

    const invoiceDigestResult = await queryInvoiceDigest({
      page: 1,
      queryParams,
      invoiceDirection: 'OUTBOUND',
      technicalUser,
      softwareData,
      axios,
    });

    assert.hasAllKeys(invoiceDigestResult, [
      'availablePage',
      'currentPage',
      'invoiceDigest',
    ]);
    assert.isAbove(invoiceDigestResult.invoiceDigest.length, 2);
  });

  it('should normalize invoiceDigest to Array', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      dateFrom: today,
      dateTo: today,
      transactionParams: {
        transactionId,
        index: 1,
        operation: 'CREATE',
      },
    };

    await queryInvoiceDigest({
      page: 1,
      queryParams,
      invoiceDirection: 'OUTBOUND',
      technicalUser,
      softwareData,
      axios,
    });
  });

  it('should convert types in queryParams resolve value', async () => {
    const today = new Date().toISOString().split('T')[0];
    const queryParams = {
      dateFrom: today,
      dateTo: today,
    };

    const {
      currentPage,
      availablePage,
      invoiceDigest,
    } = await queryInvoiceDigest({
      page: 1,
      queryParams,
      invoiceDirection: 'OUTBOUND',
      technicalUser,
      softwareData,
      axios,
    });

    const digest = invoiceDigest[1];

    assert.isNumber(currentPage);
    assert.isNumber(availablePage);
    assert.isNumber(digest.invoiceNetAmount);
    assert.isNumber(digest.invoiceVatAmountHUF);
  });
});
