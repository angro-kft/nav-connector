const { pick, mapKeys } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {number} params.page Integer page to query.
 * @param {Object} params.invoiceQuery Query single invoice with invoice number.
 * @param {Object} params.queryParams Query multiple invoices with params.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Object>} queryResults
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
      invoiceQuery: pick(invoiceQuery, [
        'invoiceNumber',
        'requestAllModification',
      ]),
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

  const { queryResults } = responseData.QueryInvoiceDataResponse;

  /* Type conversions. */
  queryResults.currentPage = Number(queryResults.currentPage);
  queryResults.availablePage = Number(queryResults.availablePage);

  const { queryResult } = queryResults;

  if (!queryResult) {
    return queryResults;
  }

  const { invoiceResult, invoiceDigestList } = queryResult;

  if (invoiceResult) {
    let { invoiceReference } = invoiceResult;
    /* Map object key names to match the documentation. The ns2: prefix must be removed. */
    invoiceResult.invoiceReference = mapKeys(invoiceReference, (value, key) =>
      key.replace('ns2:', '')
    );

    ({ invoiceReference } = invoiceResult);

    /* Type conversions. */
    invoiceReference.modifyWithoutMaster =
      invoiceReference.modifyWithoutMaster === 'true';
    invoiceResult.compressedContentIndicator =
      invoiceResult.compressedContentIndicator === 'true';
  }

  const { invoiceDigest } = invoiceDigestList;

  /* Normalize to Array. */
  queryResult.invoiceDigestList = Array.isArray(invoiceDigest)
    ? invoiceDigest
    : [invoiceDigest];

  /* Type conversions. */
  queryResult.invoiceDigestList.forEach(digest => {
    /* eslint-disable no-param-reassign */
    digest.invoiceNetAmount = Number(digest.invoiceNetAmount);
    digest.invoiceVatAmountHUF = Number(digest.invoiceVatAmountHUF);
    /* eslint-enable no-param-reassign */
  });

  return queryResults;
};
