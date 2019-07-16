const { assert } = require('chai');

const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');
const createInvoiceCorruptOperations = require('./lib/create-invoice-corrupt-operations.js');
const waitInvoiceProcessing = require('./lib/wait-invoice-processing.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');

describe('queryInvoiceStatus()', () => {
  let singleTransactionId;
  let multiTransactionId;
  let corruptTransactionId;

  /* Send and wait for a single and multiple invoices to be processed. */
  before(async function before() {
    const invoiceOperationList = [];

    /* Create invoice operations with a single invoice. */
    invoiceOperationList.push(
      createInvoiceOperations({
        taxNumber: technicalUser.taxNumber,
        size: 1,
      })
    );

    /* Create invoice operations with a multiple invoices. */
    invoiceOperationList.push(
      createInvoiceOperations({
        taxNumber: technicalUser.taxNumber,
        size: 2,
      })
    );

    /* Create invoice operations with warns and errors. */
    invoiceOperationList.push(
      createInvoiceCorruptOperations({
        taxNumber: technicalUser.taxNumber,
      })
    );

    /* Send invoices. */
    [
      singleTransactionId,
      multiTransactionId,
      corruptTransactionId,
    ] = await Promise.all(
      invoiceOperationList.map(invoiceOperation =>
        manageInvoice({
          invoiceOperations: {
            technicalAnnulment: false,
            compressedContent: false,
            invoiceOperation,
          },
          technicalUser,
          softwareData,
          axios,
        })
      )
    );

    /* Wait for invoices to be processes. */
    const getStatusPromises = [
      singleTransactionId,
      multiTransactionId,
      corruptTransactionId,
    ].map((transactionId, index) =>
      waitInvoiceProcessing({
        transactionId,
        technicalUser,
        softwareData,
        axios,
        test: this.test,
        ignoreAbortedIndexes: index === 2 ? [1, 2, 3, 4, 5] : [],
      })
    );

    await Promise.all(getStatusPromises);
  });

  it('should resolve to array with single invoice', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: singleTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  });

  it('should resolve to array with multiple invoice', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: multiTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  });

  it('should resolve to an empty array if transactionId is invalid', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: 'invalid',
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  });

  it('should handle originalRequest param', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: singleTransactionId,
      returnOriginalRequest: true,
      technicalUser,
      softwareData,
      axios,
    });

    assert.property(processingResults[0], 'originalRequest');
  });

  it('should convert types', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: corruptTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    const processingResult = processingResults[1];

    assert.isNumber(processingResult.index);
    assert.isBoolean(processingResult.compressedContentIndicator);
    assert.isNumber(
      processingResult.businessValidationMessages[0].pointer.line
    );
  });

  it('should normalize validation messages to arrays', async () => {
    const processingResults = await queryInvoiceStatus({
      transactionId: corruptTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.lengthOf(processingResults[0].businessValidationMessages, 0);
    assert.lengthOf(processingResults[1].businessValidationMessages, 1);
    assert.lengthOf(processingResults[2].businessValidationMessages, 1);

    assert.lengthOf(processingResults[0].technicalValidationMessages, 0);
    assert.lengthOf(processingResults[4].technicalValidationMessages, 1);
    assert.lengthOf(processingResults[5].technicalValidationMessages, 0);
  });
});
