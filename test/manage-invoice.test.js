const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const manageInvoice = require('../src/manage-invoice.js');

const invoiceOperation = require('./lib/invoices-base64.js').map(
  (invoice, index) => ({ index: index + 1, operation: 'CREATE', invoice })
);

describe('manageInvoice()', () => {
  it('should resolve to transactionId with single invoice', async () => {
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

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  }).timeout(2000);

  it('should resolve to transactionId with multiple invoices', async () => {
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

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  }).timeout(2000);
});
