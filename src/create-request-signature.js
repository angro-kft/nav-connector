const { crc32 } = require('crc');
const crypto = require('crypto');

/**
 * Create a request signature for a base request.
 * @param {Object} params Function params.
 * @param {string} params.requestId Unique string.
 * @param {Date} params.date Request creation date.
 * @param {String} params.signatureKey Technical user's signature key.
 * @param {Array} [params.invoices=[]] Invoice xmls in base64 encoding.
 * @returns {string} Request signature.
 */
module.exports = function createRequestSignature({
  requestId,
  date,
  signatureKey,
  invoices = [],
}) {
  const timestamp = `${date.toISOString().split('.')[0]}`.replace(/[-:T]/g, '');
  const invoiceCrcChecksums = invoices
    .map(invoice => {
      const hash = crypto.createHash('sha3-512');
      hash.update(`${invoice.operation}${invoice.data}`);
      return hash.digest('hex').toUpperCase();
    })
    .join('');

  const hash = crypto.createHash('sha3-512');
  hash.update(`${requestId}${timestamp}${signatureKey}${invoiceCrcChecksums}`);
  return hash.digest('hex').toUpperCase();
};
