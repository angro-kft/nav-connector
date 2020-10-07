const { promisify } = require('util');
const async = require('async');

const retry = promisify(async.retry).bind(async);

const queryTransactionStatus = require('../../src/query-transaction-status.js');

/**
 * Resolves when the operations with the given transactionId get processed.
 * @async
 * @param {Object} params Function params.
 * @param {string} params.transactionId Wait for processing this transactionId.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @param {Object} params.test Mocha this.test.
 * @param {Array} params.ignoreAbortedIndexes List of indexes to ignore when they have aborted statuses.
 * @returns {Promise<undefined>}
 */
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
      times: 50,
      interval: 5000,
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
      const processingResults = await queryTransactionStatus({
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
    }
  );
};
