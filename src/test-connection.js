const getExchangeToken = require('./get-exchange-token.js');

/**
 * Test connection, user auth data and keys validity with a tokenExchnageRequest.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.technicalUser Technical user’s data.
 * @param {Object} params.softwareData Invoice software data.
 * @param {Object} params.axios Axios instance.
 * @throws {Object} Will throw an error if there was a network expectation
 * or any user given auth data or key is invalid.
 */
module.exports = async function testConnection({
  technicalUser,
  softwareData,
  axios,
}) {
  await getExchangeToken({
    axios,
    technicalUser,
    softwareData,
  });
};
