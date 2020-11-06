const { pick } = require('lodash');

const createBaseRequest = require('./create-base-request.js');
const getExchangeToken = require('./get-exchange-token.js');
const sendRequest = require('./send-request.js');

/**
 * Send request to NAV service to manage annulment.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.annulmentOperations Request object for xml conversion and send.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<string>} Manage annulment operation transaction id.
 */
module.exports = async function manageAnnulment({
  annulmentOperations,
  technicalUser,
  softwareData,
  axios,
}) {
  const invoices = annulmentOperations.annulmentOperation.map(
    annulmentOperation => {
      return {
        data: annulmentOperation.invoiceAnnulment,
        operation: 'ANNUL',
      };
    }
  );

  const request = createBaseRequest({
    requestType: 'ManageAnnulmentRequest',
    technicalUser,
    softwareData,
    invoices,
  });

  request.ManageAnnulmentRequest.exchangeToken = await getExchangeToken({
    axios,
    technicalUser,
    softwareData,
  });

  /* Normalize request object key order. */
  const normalizedAnnulmentOperations = pick(annulmentOperations, [
    'annulmentOperation',
  ]);

  const { annulmentOperation } = normalizedAnnulmentOperations;

  normalizedAnnulmentOperations.annulmentOperation = annulmentOperation.map(
    elem => pick(elem, ['index', 'annulmentOperation', 'invoiceAnnulment'])
  );

  request.ManageAnnulmentRequest.annulmentOperations = normalizedAnnulmentOperations;

  const responseData = await sendRequest({
    request,
    axios,
    path: '/manageAnnulment',
  });

  return responseData.ManageAnnulmentResponse.transactionId;
};
