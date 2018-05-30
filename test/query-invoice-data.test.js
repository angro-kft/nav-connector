const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperation = require('./lib/create-invoice-operation.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');
const queryInvoiceData = require('../src/query-invoice-data.js');

describe('queryInvoiceData()', () => {
  let existingInvoiceNumber;
  let transactionId;

  before(async function before() {
    const invoiceOperation = createInvoiceOperation({
      taxNumber: technicalUser.taxNumber,
    }).slice(0, 2);

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation,
    };

    existingInvoiceNumber = Buffer.from(invoiceOperation[0].invoice, 'base64')
      .toString()
      .match(/<invoiceNumber>(.*?)<\/invoiceNumber>/g)[0]
      .replace(/<\/?invoiceNumber>/g, '');

    transactionId = await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });

    await new Promise(resolve => {
      const getInvoiceStatus = async () => {
        const processingResults = await queryInvoiceStatus({
          transactionId,
          returnOriginalRequest: true,
          technicalUser,
          softwareData,
          axios,
        });

        const { invoiceStatus } = processingResults[0];

        if (this.test.timedOut) {
          return;
        }

        if (invoiceStatus === 'ABORTED') {
          throw new Error('Invoice status is ABORTED!');
        }

        if (invoiceStatus === 'DONE') {
          resolve();
          return;
        }

        getInvoiceStatus();
      };

      getInvoiceStatus();
    });
  });

  it('should resolve to empty array with invoiceQuery param without result', async () => {
    const invoiceQuery = {
      invoiceNumber: 'invoiceNumber',
      requestAllModification: true,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(response.queryResult, 0);
  });

  it('should resolve to empty array with queryParams param without result', async () => {
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

    assert.lengthOf(response.queryResult, 0);
  });

  it('should resolve with invoiceQuery param', async () => {
    const invoiceQuery = {
      invoiceNumber: 'invoiceNumber',
      requestAllModification: true,
    };

    const response = await queryInvoiceData({
      page: 1,
      invoiceQuery,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(response.queryResult);
  });

  it('should resolve with queryParams param', async () => {
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

    assert.isArray(response.queryResult);
  });

  it('should normalize queryParams resolve value to array', async () => {
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

    const response = await queryInvoiceData({
      page: 1,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(response.queryResult);
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

  it('should convert types with invoiceQuery param', async () => {
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

    const queryResult = response.queryResult[0];

    assert.isNumber(response.currentPage);
    assert.isNumber(response.availablePage);
    assert.isBoolean(queryResult.invoiceReference.modifyWithoutMaster);
    assert.isBoolean(queryResult.compressedContentIndicator);
  });

  it('should convert types with queryParams param', async () => {
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

    const firstDigest = response.queryResult[0];

    assert.isNumber(response.currentPage);
    assert.isNumber(response.availablePage);
    assert.isNumber(firstDigest.invoiceNetAmount);
    assert.isNumber(firstDigest.invoiceVatAmountHUF);
  });
});
