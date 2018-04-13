const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');

const invoiceOperation = require('./lib/invoices-base64.js').map(
  (invoice, index) => ({ index: index + 1, operation: 'CREATE', invoice })
);

describe('queryInvoiceStatus()', () => {
  it('should resolve to processingResults with single invoice', async () => {
    const invoiceOperations = {
      technicalAnnulment: false,
      invoiceOperation: invoiceOperation.slice(0, 1),
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
  }).timeout(4000);

  it('should resolve to processingResults with multiple invoice', async () => {
    const invoiceOperations = {
      technicalAnnulment: false,
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
  }).timeout(4000);

  it('should resolve to an empty array if transactionId is invalid', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: 'invalid',
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  }).timeout(4000);

  /*
  it('should handle originalRequest param', async () => {
    const invoiceOperations = {
      technicalAnnulment: false,
      invoiceOperation: invoiceOperation.slice(0, 1),
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

    assert.property(processingResults[0], 'originalRequest');
  }).timeout(4000);
  */
});
