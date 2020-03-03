const { pick, mapKeys, omitBy, isEmpty } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {number} params.page Integer page to query.
 * @param {string} params.invoiceDirection outbound or inbound request type.
 * @param {Object} params.queryParams Query multiple invoices with params.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Object>} queryResults
 */
module.exports = async function queryInvoiceDigest({
  page,
  invoiceDirection,
  queryParams,
  technicalUser,
  softwareData,
  axios,
}) {
  const request = createBaseRequest({
    requestType: 'QueryInvoiceDigestRequest',
    technicalUser,
    softwareData,
  });

  /* Normalize queryParams key order. */
  Object.assign(request.QueryInvoiceDigestRequest, {
    page,
    invoiceDirection,
    invoiceQueryParams: {
      mandatoryQueryParams: {
        invoiceIssueDate: pick(queryParams, ['dateFrom', 'dateTo']),
      },
      additionalQueryParams: pick(queryParams, [
        'taxNumber',
        'groupMemberTaxNumber',
        'name',
        'invoiceCategory',
        'paymentMethod',
        'invoiceAppearance',
        'source',
        'currency',
      ]),
      transactionQueryParams: pick(queryParams, [
        'transactionId',
        'index',
        'invoiceOperation',
      ]),
    },
  });

  request.QueryInvoiceDigestRequest.invoiceQueryParams = omitBy(
    request.QueryInvoiceDigestRequest.invoiceQueryParams,
    isEmpty
  );

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryInvoiceDigest',
  });

  const { invoiceDigestResult } = responseData.QueryInvoiceDigestResponse;

  /* Type conversions. */
  invoiceDigestResult.currentPage = Number(invoiceDigestResult.currentPage);
  invoiceDigestResult.availablePage = Number(invoiceDigestResult.availablePage);

  if (!invoiceDigestResult) {
    return responseData.QueryInvoiceDigestResponse;
  }

  const { invoiceDigest } = invoiceDigestResult;

  if (invoiceDigest) {
    /* Normalize to Array. */
    invoiceDigestResult.invoiceDigest = Array.isArray(invoiceDigest)
      ? invoiceDigest
      : [invoiceDigest];

    /* Type conversions. */
    invoiceDigestResult.invoiceDigest.forEach(digest => {
      /* eslint-disable no-param-reassign */
      digest.invoiceNetAmount = Number(digest.invoiceNetAmount);
      digest.invoiceVatAmountHUF = Number(digest.invoiceVatAmountHUF);
      /* eslint-enable no-param-reassign */
    });
  }

  return invoiceDigestResult;
};
