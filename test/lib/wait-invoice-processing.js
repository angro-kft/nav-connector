const { promisify } = require('util');
const async = require('async');

const retry = promisify(async.retry).bind(async);

const queryInvoiceStatus = require('../../src/query-invoice-status.js');

module.exports = function waitInvoiceProcessing({
  transactionId,
  technicalUser,
  softwareData,
  axios,
  test,
  ignoreAbortedIndexes = [],
}) {
  return retry(
    {
      times: 20,
      interval: 500,
      errorFilter: error => {
        const { message, response, request } = error;
        if (test.timedOut) {
          return false;
        }

        if (message === 'An invoice is still under processing!') {
          return true;
        }

        if (response) {
          if (response.status === 504) {
            return true;
          }

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

      /* Invoices can be willfully corrupted. There can be predefined indexes to ignore. */
      const hasAborted = processingResults.find(
        (processingResult, invoiceIndex) =>
          processingResult.invoiceStatus === 'ABORTED' &&
          !ignoreAbortedIndexes.includes(invoiceIndex)
      );

      if (hasAborted) {
        throw new Error('Invoice status is ABORTED!');
      }

      const hasPending = processingResults.find(processingResult =>
        ['RECEIVED', 'PROCESSING'].includes(processingResult.invoiceStatus)
      );

      if (hasPending) {
        throw new Error('An invoice is still under processing!');
      }
    }
  );
};
