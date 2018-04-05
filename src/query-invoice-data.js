const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.invoiceQuery Query single invoice with invoice number.
 * @param {Object} params.queryParams Query multiple invoices with params.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Array>} queryResults
 */
module.exports = async function queryInvoiceData({
  invoiceQuery,
  queryParams,
  technicalUser,
  softwareData,
  axios,
}) {
  const request = createBaseRequest({
    requestType: 'QueryInvoiceDataRequest',
    technicalUser,
    softwareData,
  });

  if (invoiceQuery) {
    Object.assign(request.QueryInvoiceDataRequest, {
      invoiceQuery,
    });
  } else {
    Object.assign(request.QueryInvoiceDataRequest, {
      queryParams,
    });
  }

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryInvoiceData',
  });

  const { queryResults } = responseData.QueryInvoiceDataResponse;

  /* Normalize queryResult to Array. */
  const { queryResult } = queryResults;

  if (!Array.isArray(queryResult)) {
    return [queryResult];
  }

  return queryResult;
};
