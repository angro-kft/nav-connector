const ObjectId = require('bson-objectid');
const { crc32 } = require('crc');
const crypto = require('crypto');

module.exports = function createRequestSignature({
  requestId = ObjectId().toString(),
  date = new Date(),
  signatureKey,
  invoices = [],
}) {
  const timestamp = `${date.toISOString().split('.')[0]}`
    .replace(/T/g, '')
    .replace(/-/g, '')
    .replace(/:/g, '');
  const invoiceCrcChecksums = invoices.map(invoice => crc32(invoice)).join('');

  const hash = crypto.createHash('sha512');

  hash.update(`${requestId}${timestamp}${signatureKey}${invoiceCrcChecksums}`);

  return hash.digest('hex').toUpperCase();
};
