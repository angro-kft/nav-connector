const { pick, mapKeys } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

const xml2js = require('xml2js');
const { promisify } = require('util');
const xmlParser = new xml2js.Parser({ explicitArray: false });
const parseXml = promisify(xmlParser.parseString).bind(xmlParser);

/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.invoiceQuery Query single invoice.
 * @param {string} params.invoiceQuery.invoiceNumber Query invoices based on the invoiceNumber.
 * @param {"INBOUND" | "OUTBOUND"} params.invoiceQuery.invoiceDirection Query invoices based on the invoice direction INBOUND | OUTBOUND.
 * @param {number} params.invoiceQuery.batchIndex Batch index.
 * @param {string} params.invoiceQuery.supplierTaxNumber Query invoices based on the supplier tax number.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Object>} queryResults
 */
module.exports = async function queryInvoiceData({
  invoiceQuery,
  technicalUser,
  softwareData,
  axios,
}) {
  const request = createBaseRequest({
    requestType: 'QueryInvoiceDataRequest',
    technicalUser,
    softwareData,
  });

  /* Normalize invoiceQuery key order. */
  Object.assign(request.QueryInvoiceDataRequest, {
    invoiceNumberQuery: pick(invoiceQuery, [
      'invoiceNumber',
      'invoiceDirection',
      'batchIndex', //This might be optional
      'supplierTaxNumber' //This might be optional
    ]),
  });

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryInvoiceData',
  });

  const { invoiceDataResult } = responseData.QueryInvoiceDataResponse;

  if (!invoiceDataResult) {
    return responseData.QueryInvoiceDataResponse;
  }

  invoiceDataResult.invoiceData = await parseXml(
    Buffer.from(invoiceDataResult.invoiceData, 'base64')
  );

  return invoiceDataResult;
};
