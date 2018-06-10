const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Get the result of a previously sent manage invoice request.
 * @async
 * @param {Object} params Function params.
 * @param {string} params.transactionId Manage invoice operation transaction id.
 * @param {boolean} [params.returnOriginalRequest=false] Flag for api response to contain the original invoice.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Array>} processingResults
 */
module.exports = async function queryInvoiceStatus({
  transactionId,
  returnOriginalRequest = false,
  technicalUser,
  softwareData,
  axios,
}) {
  const request = createBaseRequest({
    requestType: 'QueryInvoiceStatusRequest',
    technicalUser,
    softwareData,
  });

  Object.assign(request.QueryInvoiceStatusRequest, {
    transactionId,
    returnOriginalRequest,
  });

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryInvoiceStatus',
  });

  const { processingResults } = responseData.QueryInvoiceStatusResponse;

  /* Normalize processingResults to Array. */
  if (!processingResults) {
    return [];
  }

  let { processingResult } = processingResults;

  if (!Array.isArray(processingResult)) {
    processingResult = [processingResult];
  }

  processingResult.forEach(result => {
    const {
      index,
      compressedContentIndicator,
      technicalValidationMessages,
      businessValidationMessages,
    } = result;
    /* eslint-disable no-param-reassign */

    /* Type conversion. */
    result.index = Number(index);
    result.compressedContentIndicator = compressedContentIndicator === 'true';

    /* Normalize technicalValidationMessages to Array. */
    if (!technicalValidationMessages) {
      result.technicalValidationMessages = [];
    } else if (!Array.isArray(technicalValidationMessages)) {
      result.technicalValidationMessages = [technicalValidationMessages];
    }

    /* Normalize businessValidationMessages to Array. */
    if (!businessValidationMessages) {
      result.businessValidationMessages = [];
    } else if (!Array.isArray(businessValidationMessages)) {
      result.businessValidationMessages = [businessValidationMessages];
    }

    /* Type conversion. */
    result.businessValidationMessages.forEach(validationResult => {
      const { pointer } = validationResult;

      if (pointer && pointer.line) {
        pointer.line = Number(pointer.line);
      }
    });

    /* eslint-enable no-param-reassign */
  });

  return processingResult;
};
