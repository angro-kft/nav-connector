const { readFileSync } = require('fs');
const ObjectId = require('bson-objectid');
const { gzipSync } = require('zlib');

const baseInvoiceXml = readFileSync('./test/lib/invoice-create.xml');

/**
 * Create the given number of invoice operations.
 * @param {Object} params Function params.
 * @param {string} params.taxNumber Tax number of the taxpayer using the interface service,
 * to whom the technical user is assigned.
 * @param {boolean} [params.compress=false] Flag to compress invoice xmls.
 * @param {number} [params.size=1] The integer of invoice operations to create.
 * @returns {Array} invoiceOperation
 */
module.exports = function createInvoiceOperations({
  taxNumber,
  compress = false,
  size = 1,
}) {
  const invoiceOperation = [];
  const today = new Date().toISOString().split('T')[0];

  for (let index = 0; index < size; index += 1) {
    let invoiceXml = baseInvoiceXml;
    const invoiceNumber = ObjectId().toString();

    invoiceXml = invoiceXml
      .toString()
      .replace(
        '<taxpayerId>11111111</taxpayerId>',
        `<taxpayerId>${taxNumber}</taxpayerId>`
      )
      .replace(
        '<invoiceNumber>2019/000123</invoiceNumber>',
        `<invoiceNumber>${invoiceNumber}</invoiceNumber>`
      )
      .replace(
        '<invoiceIssueDate>2019-05-15</invoiceIssueDate>',
        `<invoiceIssueDate>${today}</invoiceIssueDate>`
      )
      .replace(
        '<invoiceDeliveryDate>2019-05-10</invoiceDeliveryDate>',
        `<invoiceDeliveryDate>${today}</invoiceDeliveryDate>`
      )
      .replace(
        '<paymentDate>2019-05-30</paymentDate>',
        `<paymentDate>${today}</paymentDate>`
      );

    if (compress) {
      invoiceXml = gzipSync(invoiceXml);
    }

    const invoice = Buffer.from(invoiceXml).toString('base64');

    invoiceOperation.push({ index: index + 1, operation: 'CREATE', invoice });
  }

  return invoiceOperation;
};
