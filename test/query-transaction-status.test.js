const { assert } = require('chai');

const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperations = require('./lib/create-invoice-operations.js');
const createInvoiceCorruptOperations = require('./lib/create-invoice-corrupt-operations.js');
const createAnnulmentOperations = require('./lib/create-annulment-operations');
const createAnnulmentCorruptOperations = require('./lib/create-annulment-corrupt-operations');
const waitInvoiceProcessing = require('./lib/wait-invoice-processing.js');

const manageInvoice = require('../src/manage-invoice.js');
const manageAnnulment = require('../src/manage-annulment.js');
const queryTransactionStatus = require('../src/query-transaction-status.js');

describe('queryTransactionStatus()', () => {
  let singleTransactionId;
  let multiTransactionId;
  let corruptTransactionId;
  let toAnnulTransactionId;

  let annulmentTransactionId;
  let corruptAnnulmentTransactionId;

  /* Send and wait for a single and multiple invoices to be processed. */
  before(async function before() {
    const invoiceOperationList = [];
    const annulmentOperationList = [];

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

    /* Create invoice operations for annulment */
    invoiceOperationList.push(
      createInvoiceOperations({
        taxNumber: technicalUser.taxNumber,
        size: 1,
        invoiceNumber: 'INV-1212-K',
      })
    );

    /* Create an annulment operation */
    annulmentOperationList.push(
      createAnnulmentOperations([{ annulmentReference: 'INV-1212-K' }])
    );

    /* Create an annulment corrupt operation */
    annulmentOperationList.push(createAnnulmentCorruptOperations({ size: 1 }));

    /* Send invoices. */
    [
      singleTransactionId,
      multiTransactionId,
      corruptTransactionId,
      toAnnulTransactionId,
    ] = await Promise.all(
      invoiceOperationList.map(invoiceOperation =>
        manageInvoice({
          invoiceOperations: {
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
      toAnnulTransactionId,
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

    /*  send annulments  */

    [annulmentTransactionId, corruptAnnulmentTransactionId] = await Promise.all(
      annulmentOperationList.map(annulmentOperation =>
        manageAnnulment({
          annulmentOperations: {
            annulmentOperation,
          },
          technicalUser,
          softwareData,
          axios,
        })
      )
    );

    /* Wait for annulments to be processes. */
    const getAnnulmentStatusPromises = [
      annulmentTransactionId,
      corruptAnnulmentTransactionId,
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

    await Promise.all(getStatusPromises.concat(getAnnulmentStatusPromises));
  });

  it('should resolve to array with single invoice', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: singleTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  });
  it('should resolve to array with multiple invoice', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: multiTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  });

  it('should resolve to an empty array if transactionId is invalid', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: 'invalid',
      technicalUser,
      softwareData,
      axios,
    });

    assert.isArray(processingResults);
  });

  it('should handle originalRequest param', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: singleTransactionId,
      returnOriginalRequest: true,
      technicalUser,
      softwareData,
      axios,
    });

    assert.property(processingResults[0], 'originalRequest');
  });

  it('should convert types', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: corruptTransactionId,
      technicalUser,
      softwareData,
      axios,
    });

    const processingResult = processingResults[1];

    assert.isNumber(processingResult.index);
    assert.isBoolean(processingResult.compressedContentIndicator);
  });

  it('should normalize validation messages to arrays', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: corruptTransactionId,
      technicalUser,
      softwareData,
      axios,
    });
    assert.lengthOf(processingResults[4].technicalValidationMessages, 1);
  });
  it('should resolve to array with single annulment', async () => {
    const processingResults = await queryTransactionStatus({
      transactionId: annulmentTransactionId,
      technicalUser,
      softwareData,
      axios,
    });
    assert.isArray(processingResults);
  });
});
