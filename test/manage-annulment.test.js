const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');

const manageAnnulment = require('../src/manage-annulment.js');

describe('manageAnnulment()', () => {
  it('should resolve to transactionId with single invoice', async () => {
    const annulmentOperation = createInvoiceOperations({
      taxNumber: technicalUser.taxNumber,
    })
      .slice(0, 1)
      .map(({ invoiceData, invoiceOperation, index }) => ({
        index,
        annulmentOperation: 'ANNUL',
        invoiceAnnulment: invoiceData,
      }));

    const annulmentOperations = {
      annulmentOperation,
    };

    const transactionId = await manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });
    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  });

  it('should resolve to transactionId with multiple invoices', async () => {
    const annulmentOperation = createInvoiceOperations({
      taxNumber: technicalUser.taxNumber,
    }).map(({ invoiceData, invoiceOperation, index }) => ({
      index,
      annulmentOperation: 'ANNUL',
      invoiceAnnulment: invoiceData,
    }));

    const annulmentOperations = {
      annulmentOperation,
    };

    const transactionId = await manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });

    assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
  });

  it('should normalize annulmentOperation key order', async () => {
    const annulmentOperation = createInvoiceOperations({
      taxNumber: technicalUser.taxNumber,
    }).map(({ invoiceData, invoiceOperation, index }) => ({
      invoiceAnnulment: invoiceData,
      annulmentOperation: 'ANNUL',
      index,
    }));

    const annulmentOperations = {
      annulmentOperation,
      compressedContent: false,
    };

    await manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });
  });
});
