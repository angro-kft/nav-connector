const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

const { pick } = require('lodash');

/**
 * Resolves to taxpayer information.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.taxNumber Taxpayer tax number to validate.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @returns {Promise<Object>} Taxpayer information.
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

  return pick(responseData.QueryTaxpayerResponse, [
    'taxpayerValidity',
    'taxpayerData',
  ]);
};
