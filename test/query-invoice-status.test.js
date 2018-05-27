const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperation = require('./lib/create-invoice-operation.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');

describe('queryInvoiceStatus()', () => {
  it('should resolve to processingResults with single invoice', async () => {
    const invoiceOperation = createInvoiceOperation({
      taxNumber: technicalUser.taxNumber,
    }).slice(0, 1);

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation,
    };

    const transactionId = await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });

    const processingResults = await queryInvoiceStatus({
      transactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  }).timeout(6000);

  it('should resolve to processingResults with multiple invoice', async () => {
    const invoiceOperation = createInvoiceOperation({
      taxNumber: technicalUser.taxNumber,
    });

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation,
    };

    const transactionId = await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });

    const processingResults = await queryInvoiceStatus({
      transactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  }).timeout(6000);

  it('should resolve to an empty array if transactionId is invalid', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: 'invalid',
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  }).timeout(6000);

  it('should handle originalRequest param', async () => {
    const invoiceOperation = createInvoiceOperation({
      taxNumber: technicalUser.taxNumber,
    }).slice(0, 1);

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: false,
      invoiceOperation,
    };

    const transactionId = await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });

    const processingResults = await queryInvoiceStatus({
      transactionId,
      returnOriginalRequest: true,
      technicalUser,
      softwareData,
      axios,
    });

    const { invoice } = invoiceOperations.invoiceOperation[0];
    const { invoiceStatus, originalRequest } = processingResults[0];

    if (invoiceStatus === 'RECEIVED') {
      assert.isUndefined(originalRequest);
    } else {
      assert.equal(invoice, originalRequest);
    }
  }).timeout(6000);
});
