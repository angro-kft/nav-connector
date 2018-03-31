const createBaseRequest = require('./create-base-request.js');
const getExchangeToken = require('./get-exchange-token.js');
const validateInvoiceOperations = require('./validate-invoice-operations.js');
const sendRequest = require('./send-request.js');

module.exports = async function manageInvoice({
  technicalUser,
  softwareData,
  axios,
  invoiceOperations,
}) {
  const invoices = invoiceOperations.invoiceOperation.map(
    invoiceOperation => invoiceOperation.invoice
  );

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

  validateInvoiceOperations(invoiceOperations);

  request.ManageInvoiceRequest.invoiceOperations = invoiceOperations;

  const responseData = await sendRequest({
    request,
    axios,
    path: '/manageInvoice',
  });

  return responseData.ManageInvoiceResponse.transactionId;
};
