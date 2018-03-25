const ObjectId = require('bson-objectid');
const crypto = require('crypto');

const createRequestSignature = require('./create-request-signature.js');

/**
 * Create a base request object.
 * @param {Object} params Function params.
 * @param {string} params.requestType Operation type of the request is used for.
 * @param {string} [params.requestId=ObjectId().toString()] Unique string.
 * @param {Date} [params.date=new Date()] Request creation date.
 * @param {Object} params.technicalUser Technical user data.
 * @param {Object} params.softwareData Software data.
 * @param {Array} [params.invoices=[]] Invoice xmls in base64 encoding.
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
        xmlns: 'http://schemas.nav.gov.hu/OSA/1.0/api',
      },
      header: {
        requestId,
        timestamp: `${date.toISOString().split('.')[0]}Z`,
        requestVersion: '1.0',
        headerVersion: '1.0',
      },
      user: {
        login,
        passwordHash,
        taxNumber,
        requestSignature,
      },
      software: softwareData,
    },
  };

  return baseRequest;
};
