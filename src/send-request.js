const xml2js = require('xml2js');
const { promisify } = require('util');
const { pick } = require('lodash');

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
 * @throws {Object} Normalized NAV service error response or network error.
 */
module.exports = async function sendRequest({ request, axios, path }) {
  try {
    const requestXml = createRequestXml(request);
    const response = await axios.post(path, requestXml);
    response.data = await parseXml(response.data);
    return response.data;
  } catch (error) {
    const { response } = error;

    /* Normalize errors. */
    if (response) {
      /* istanbul ignore next */
      if (!response.data) {
        response.data = {
          result: {},
          technicalValidationMessages: [],
        };
      } else if (response.data.includes('GeneralExceptionResponse')) {
        const data = await parseXml(response.data);

        response.data = {
          result: pick(data.GeneralExceptionResponse, [
            'ns2:funcCode',
            'ns2:errorCode',
            'ns2:message',
          ]),
          technicalValidationMessages: [],
        };

        // [3.0] normalize namespace changes
        response.data.result = {
          funcCode: response.data.result['ns2:funcCode'],
        };
        if (response.data.result['ns2:errorCode']) {
          response.data.result.errorCode =
            response.data.result['ns2:errorCode'];
        }
        if (response.data.result['ns2:message']) {
          response.data.result.message = response.data.result['ns2:message'];
        }
      } else if (response.data.includes('GeneralErrorResponse')) {
        const data = await parseXml(response.data);
        response.data = pick(data.GeneralErrorResponse, [
          'ns2:result',
          'schemaValidationMessages',
          'technicalValidationMessages',
        ]);

        // [3.0] normalize namespace changes
        response.data.result = {
          funcCode: response.data['ns2:result']['ns2:funcCode'],
        };
        if (response.data['ns2:result']['ns2:errorCode']) {
          response.data.result.errorCode =
            response.data['ns2:result']['ns2:errorCode'];
        }
        if (response.data['ns2:result']['ns2:message']) {
          response.data.result.message =
            response.data['ns2:result']['ns2:message'];
        }

        const { technicalValidationMessages } = response.data;

        /* Normalize technicalValidationMessages to array. */
        if (!response.data.technicalValidationMessages) {
          response.data.technicalValidationMessages = [];
        } else if (!Array.isArray(technicalValidationMessages)) {
          response.data.technicalValidationMessages = [
            technicalValidationMessages,
          ];
        }
      } else {
        response.data = {
          result: {
            message: response.data,
          },
          technicalValidationMessages: [],
        };
      }
    }

    throw error;
  }
};
