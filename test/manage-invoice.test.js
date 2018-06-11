const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');

const manageInvoice = require('../src/manage-invoice.js');

describe('manageInvoice()', () => {
  it('should resolve to transactionId with single invoice', async () => {
    const invoiceOperation = createInvoiceOperations({
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
  });

  it('should resolve to transactionId with multiple invoices', async () => {
    const invoiceOperation = createInvoiceOperations({
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
  });

  it('should normalize invoiceOperation key order', async () => {
    const invoiceOperation = createInvoiceOperations({
      taxNumber: technicalUser.taxNumber,
    }).map(({ invoice, operation, index }) => ({
      invoice,
      operation,
      index,
    }));

    const invoiceOperations = {
      invoiceOperation,
      compressedContent: false,
      technicalAnnulment: false,
    };

    await manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });
  });

  it('should resolve to transactionId with compressed content', async () => {
    const invoiceOperation = createInvoiceOperations({
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
  });
});
