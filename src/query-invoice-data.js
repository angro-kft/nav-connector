const { pick, mapKeys } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

const xml2js = require('xml2js');
const { promisify } = require('util');
const xmlParser = new xml2js.Parser({ explicitArray: false });
const parseXml = promisify(xmlParser.parseString).bind(xmlParser);
const zlib = require("zlib");
const asyncUnzip = promisify(zlib.unzip);

/**
 * Query previously sent invoices with invoice number or query params.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.invoiceQuery Query single invoice with invoice number.
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
      'supplierTaxNumber'
    ]),
  });

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryInvoiceData',
  });

  const { invoiceDataResult } = responseData.QueryInvoiceDataResponse;

  if (!invoiceDataResult) {
    return responseData;
  }

  if (invoiceDataResult.compressedContentIndicator === "true") {
    const unzippedInvoiceData = await asyncUnzip(Buffer.from(invoiceDataResult.invoiceData, 'base64'))

    const unzippedXmlString = unzippedInvoiceData.toString('utf8')

    invoiceDataResult.invoiceData = await parseXml(unzippedXmlString)
  } else {
    invoiceDataResult.invoiceData = await parseXml(
      Buffer.from(invoiceDataResult.invoiceData, 'base64')
    );
  }

  return invoiceDataResult;
};
