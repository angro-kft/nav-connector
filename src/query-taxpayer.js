const createBaseRequest = require('./create-base-request.js');
const sendRequest = require('./send-request.js');

const { pick } = require('lodash');

/**
 * Get taxpayer information by tax number.
 * @async
 * @param {Object} params Function params.
 * @param {string} params.taxNumber Taxpayer tax number to get information for.
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

  const response = await sendRequest({
    request,
    axios,
    path: '/queryTaxpayer',
  });

  const taxpayerInfo = pick(response.QueryTaxpayerResponse, [
    'taxpayerValidity',
    'taxpayerData',
  ]);

  taxpayerInfo.taxpayerValidity = taxpayerInfo.taxpayerValidity === 'true';

  return taxpayerInfo;
};
