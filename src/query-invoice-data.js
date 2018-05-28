const { pick } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {number} params.page
 * @param {Object} params.invoiceQuery Query single invoice with invoice number.
 * @param {Object} params.queryParams Query multiple invoices with params.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Array>} queryResults
 */
module.exports = async function queryInvoiceData({
  page,
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
    /* Normalize invoiceQuery key order. */
    Object.assign(request.QueryInvoiceDataRequest, {
      page,
      invoiceQuery: pick(invoiceQuery, ['invoiceNumber', 'invoiceNumber']),
    });
  } else {
    /* Normalize queryParams key order. */
    Object.assign(request.QueryInvoiceDataRequest, {
      page,
      queryParams: pick(queryParams, [
        'invoiceIssueDateFrom',
        'invoiceIssueDateTo',
        'customerTaxNumber',
        'invoiceCategory',
        'paymentMethod',
        'invoiceAppearance',
        'source',
        'invoiceDeliveryGreaterThan',
        'invoiceDeliveryLessThan',
        'currency',
        'invoiceNetAmountGreaterThan',
        'invoiceNetAmountLessThan',
        'invoiceVatAmountHUFGreaterThan',
        'invoiceVatAmountHUFLessThan',
        'transactionParams',
      ]),
    });

    const { QueryInvoiceDataRequest } = request;
    const { transactionParams } = QueryInvoiceDataRequest.queryParams;

    if (transactionParams) {
      QueryInvoiceDataRequest.queryParams.transactionParams = pick(
        transactionParams,
        ['transactionId', 'index', 'operation']
      );
    }
  }

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryInvoiceData',
  });

  const response = responseData.QueryInvoiceDataResponse.queryResults;

  /* Normalize queryResult to Array. */
  const { queryResult } = response;

  response.currentPage = Number(response.currentPage);
  response.availablePage = Number(response.availablePage);

  if (!queryResult) {
    response.queryResult = [];
  } else if (invoiceQuery) {
    response.queryResult = response.queryResult.invoiceResult;
  } else {
    const { invoiceDigest } = response.queryResult.invoiceDigestList;

    response.queryResult = invoiceDigest;
  }

  return response;
};
