const crypto = require('crypto');
const xml2js = require('xml2js');
const { promisify } = require('util');
const { noop } = require('lodash');

const xmlParser = new xml2js.Parser({ explicitArray: false });

const parseXml = promisify(xmlParser.parseString).bind(xmlParser);

module.exports = async function getExchangeToken({
  axios,
  requestXml,
  technicalUser,
}) {
  try {
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
    /* Not service response error. */
    if (!response) {
      throw error;
    }

    let result = response.data;

    /* Sometimes the service responses with an xml error sometines with a string */
    try {
      ({ result } = (await parseXml(response.data)).GeneralErrorResponse);
    } catch (e) {
      noop(e);
    }

    const { status, statusText } = response;

    const errorResult = {
      status,
      statusText,
      result,
    };

    throw errorResult;
  }
};
