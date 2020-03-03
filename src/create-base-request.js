const { pick } = require('lodash');
const ObjectId = require('bson-objectid');
const crypto = require('crypto');

const createRequestSignature = require('./create-request-signature.js');

/**
 * Create a base request object for the given operation.
 * @param {Object} params Function params.
 * @param {string} params.requestType Operation type of the request is used for.
 * @param {string} [params.requestId=ObjectId().toString()] Unique string.
 * @param {Date} [params.date=new Date()] Request creation date.
 * @param {Object} params.technicalUser Technical user data.
 * @param {Object} params.softwareData Software data.
 * @param {Array} [params.invoices=[]] Invoice xmls in base64 encoding and invoice operation
 * @returns {Object} Base request.
 */
module.exports = function createBaseRequest({
  requestType,
  requestId = ObjectId().toString(),
  date = new Date(),
  technicalUser,
  softwareData,
  invoices,
}) {
  const { login, password, taxNumber, signatureKey } = technicalUser;

  /* Normalize Object key order. This is necessary because
     of the XML element has sequence property. */
  const software = pick(softwareData, [
    'softwareId',
    'softwareName',
    'softwareOperation',
    'softwareMainVersion',
    'softwareDevName',
    'softwareDevContact',
    'softwareDevCountryCode',
    'softwareDevTaxNumber',
  ]);

  const passwordHash = crypto
    .createHash('sha512')
    .update(password)
    .digest('hex')
    .toUpperCase();

  const requestSignature = createRequestSignature({
    requestId,
    date,
    signatureKey,
    invoices,
  });

  const baseRequest = {
    [requestType]: {
      $: {
        xmlns: 'http://schemas.nav.gov.hu/OSA/2.0/api',
      },
      header: {
        requestId,
        timestamp: date.toISOString(),
        requestVersion: '2.0',
        headerVersion: '1.0',
      },
      user: {
        login,
        passwordHash,
        taxNumber,
        requestSignature,
      },
      software,
    },
  };

  return baseRequest;
};
