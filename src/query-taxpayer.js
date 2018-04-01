const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Checks if the given tax number is valid.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.taxNumber Taxpayer tax number to validate.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<boolean>} Taxpayer validity.
 */
module.exports = async function queryTaxpayer({
  taxNumber,
  technicalUser,
  softwareData,
  axios,
}) {
  const request = createBaseRequest({
    requestType: 'QueryTaxpayerRequest',
    technicalUser,
    softwareData,
  });

  request.QueryTaxpayerRequest.taxNumber = taxNumber;

  const responseData = await sendRequest({
    request,
    axios,
    path: '/queryTaxpayer',
  });

  return responseData.QueryTaxpayerResponse.validTaxpayer;
};
