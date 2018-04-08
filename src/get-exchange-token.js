const crypto = require('crypto');

const createBaseRequest = require('../src/create-base-request.js');
const sendRequest = require('./send-request.js');

/**
 * Get and decipher new exchangeToken from the NAV service.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.axios Axios instance.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @returns {Promise<string>} Deciphered exchangeToken.
 */
module.exports = async function getExchangeToken({
  axios,
  technicalUser,
  softwareData,
}) {
  const request = createBaseRequest({
    requestType: 'TokenExchangeRequest',
    technicalUser,
    softwareData,
  });

  const responseData = await sendRequest({
    request,
    axios,
    path: '/tokenExchange',
  });

  const { encodedExchangeToken } = responseData.TokenExchangeResponse;

  const decipher = crypto.createDecipheriv(
    'aes-128-ecb',
    technicalUser.exchangeKey,
    ''
  );

  let exchangeToken = decipher.update(encodedExchangeToken, 'base64', 'utf8');
  exchangeToken += decipher.final('utf8');

  return exchangeToken;
};
