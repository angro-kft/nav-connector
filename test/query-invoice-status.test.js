const { assert } = require('chai');

const { promisify } = require('util');
const async = require('async');

const retry = promisify(async.retry).bind(async);

const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperation = require('./lib/create-invoice-operation.js');

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');

describe('queryInvoiceStatus()', () => {
  let singleTransactionId;
  let multiTransactionId;

  /* Send and wait for a single and multiple invoices to be processed. */
  before(async function before() {
    const invoiceOperationList = [];

    invoiceOperationList.push(
      createInvoiceOperation({
        taxNumber: technicalUser.taxNumber,
      }).slice(0, 1)
    );

    invoiceOperationList.push(
      createInvoiceOperation({
        taxNumber: technicalUser.taxNumber,
      })
    );

    /* Send invoices. */
    [singleTransactionId, multiTransactionId] = await Promise.all(
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
    await Promise.all(
      [singleTransactionId, multiTransactionId].map(transactionId =>
        retry(
          {
            times: 20,
            interval: 500,
            errorFilter: error => {
              const { message, response, request } = error;
              if (this.test.timedOut) {
                return false;
              }

              if (message === 'An invoice is still under processing!') {
                return true;
              }

              if (response) {
                return response.data.result.errorCode === 'OPERATION_FAILED';
              }

              if (request) {
                return true;
              }

              return false;
            },
          },
          async () => {
            const processingResults = await queryInvoiceStatus({
              transactionId,
              technicalUser,
              softwareData,
              axios,
            });

            const hasAborted = processingResults.find(
              processingResult => processingResult.invoiceStatus === 'ABORTED'
            );

            if (hasAborted) {
              throw new Error('Invoice status is ABORTED!');
            }

            const hasPending = processingResults.find(processingResult =>
              ['RECEIVED', 'PROCESSING'].includes(
                processingResult.invoiceStatus
              )
            );

            if (hasPending) {
              throw new Error('An invoice is still under processing!');
            }
          }
        )
      )
    );
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
});
