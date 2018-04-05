const xml2js = require('xml2js');
const { promisify } = require('util');

const xmlParser = new xml2js.Parser({ explicitArray: false });
const parseXml = promisify(xmlParser.parseString).bind(xmlParser);

const createRequestXml = require('./create-request-xml.js');

/**
 * Convert request to xml and send to the given NAV service resource.
 * @async
 * @param {Object} params Function params.
 * @param {Object} params.request Request object for xml conversion and send.
 * @param {Object} params.axios Axios instance.
 * @param {string} params.path NAV service resource path.
 * @returns {Promise<Object>} Axios response data value.
 * @throws {Object} Normalised NAV service error response or network error.
 */
module.exports = async function sendRequest({ request, axios, path }) {
  try {
    const requestXml = createRequestXml(request);

    const response = await axios.post(path, requestXml);

    response.data = await parseXml(response.data);

    return response.data;
  } catch (error) {
    const { response } = error;

    if (response) {
      /* Sometimes the service responses with an xml error sometimes with a string */
      try {
        const data = await parseXml(response.data);

        response.data = data.GeneralErrorResponse.result;
      } catch (xmlParseError) {
        response.data = {
          message: response.data,
        };
      }
    }

    throw error;
  }
};
