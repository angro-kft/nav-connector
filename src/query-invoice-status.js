const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Get the result of a previously sent manage invoice request.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.transactionId Manage invoice operation transaction id.
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

  const { processingResult } = processingResults;

  if (!Array.isArray(processingResult)) {
    return [processingResult];
  }

  return processingResult;
};
