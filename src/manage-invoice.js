module.exports = async function manageInvoice({
  technicalUser,
  softwareData,
  axios,
  invoiceOperations,
}) {
  const request = createBaseRequest({
    requestType: 'ManageInvoiceRequest',
    technicalUser,
    softwareData,
  });

  request.exchangeToken = await getExchangeToken({
    axios,
    technicalUser,
    softwareData,
  });


};
