const crypto = require('crypto');
const xml2js = require('xml2js');
const { promisify } = require('util');

const xmlParser = new xml2js.Parser({ explicitArray: false });
const parseXml = promisify(xmlParser.parseString).bind(xmlParser);

const createRequestXml = require('./create-request-xml.js');

/**
 * Get and decipher new exchangeToken from the NAV service.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.axios Axios instance.
 * @param {Object} params.request Request object for xml conversion and send.
 * @param {Object} params.technicalUser Technical user data.
 * @returns {Promise<string>} Deciphered exchangeToken.
 */
module.exports = async function getExchangeToken({
  axios,
  request,
  technicalUser,
}) {
  try {
    const requestXml = createRequestXml(request);
    const response = await axios.post('/tokenExchange', requestXml);
    const { exchangeKey } = technicalUser;

    const { encodedExchangeToken } = (await parseXml(
      response.data
    )).TokenExchangeResponse;

    const decipher = crypto.createDecipheriv('aes-128-ecb', exchangeKey, '');

    let exchangeToken = decipher.update(encodedExchangeToken, 'base64', 'utf8');
    exchangeToken += decipher.final('utf8');

    return exchangeToken;
  } catch (error) {
    const { response } = error;

    if (response) {
      /* Sometimes the service responses with an xml error sometimes with a string */
      try {
        const data = await parseXml(response.data);

        response.data = data.GeneralErrorResponse.result;
      } catch (e) {
        response.data = {
          message: response.data,
        };
      }
    }

    throw error;
  }
};
