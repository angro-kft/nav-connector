const { pick } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const getExchangeToken = require('./get-exchange-token.js');
const sendRequest = require('./send-request.js');

/**
 * Send request to NAV service to manage invoices.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.invoiceOperations Request object for xml conversion and send.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<string>} Manage invoice operation transaction id.
 */
module.exports = async function manageInvoice({
  invoiceOperations,
  technicalUser,
  softwareData,
  axios,
}) {
  const invoices = invoiceOperations.invoiceOperation.map(invoiceOperation => {
    return {
      data: invoiceOperation.invoiceData,
      operation: invoiceOperation.invoiceOperation,
    };
  });

  const request = createBaseRequest({
    requestType: 'ManageInvoiceRequest',
    technicalUser,
    softwareData,
    invoices,
  });

  request.ManageInvoiceRequest.exchangeToken = await getExchangeToken({
    axios,
    technicalUser,
    softwareData,
  });

  /* Normalize request object key order. */
  const normalizedInvoiceOperations = pick(invoiceOperations, [
    'compressedContent',
    'invoiceOperation',
  ]);

  const { invoiceOperation } = normalizedInvoiceOperations;

  normalizedInvoiceOperations.invoiceOperation = invoiceOperation.map(elem => ({
    index: elem.index,
    invoiceOperation: elem.invoiceOperation,
    invoiceData: elem.invoiceData,
    electronicInvoiceHash: {
      $: {
        cryptoType: 'SHA3-512',
      },
      _: elem.electronicInvoiceHash,
    },
  }));

  request.ManageInvoiceRequest.invoiceOperations = normalizedInvoiceOperations;

  const responseData = await sendRequest({
    request,
    axios,
    path: '/manageInvoice',
  });

  return responseData.ManageInvoiceResponse.transactionId;
};
