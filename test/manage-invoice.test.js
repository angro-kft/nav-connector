const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperation = require('./lib/create-invoice-operation.js');

const manageInvoice = require('../src/manage-invoice.js');

describe('manageInvoice()', () => {
  it('should resolve to transactionId with single invoice', async () => {
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
    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  }).timeout(6000);

  it('should resolve to transactionId with multiple invoices', async () => {
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

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  }).timeout(6000);

  /*
  it('should resolve to transactionId with compressed content', async () => {
    const invoiceOperation = createInvoiceOperation({
      taxNumber: technicalUser.taxNumber,
      compress: true,
    }).slice(0, 1);

    const invoiceOperations = {
      technicalAnnulment: false,
      compressedContent: true,
      invoiceOperation,
    };

    const transactionId = await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  }).timeout(6000);
  */
});
