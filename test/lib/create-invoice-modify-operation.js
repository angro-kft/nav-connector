const { readFileSync } = require('fs');
const ObjectId = require('bson-objectid');

const baseInvoiceModifyXml = readFileSync('./test/lib/invoice-modify.xml');

/**
 * Create a invoice operation which modifies and already sent invoice.
 * @param {Object} params Function params.
 * @param {string} params.taxNumber Tax number of the taxpayer using the interface service,
 * to whom the technical user is assigned.
 * @param {string} params.originalInvoiceNumber An already sent invoice's number.
 * @returns {Array} invoiceOperation
 */
module.exports = function createInvoiceModifyOperations({
  taxNumber,
  originalInvoiceNumber,
}) {
  const invoiceOperation = [];
  const today = new Date().toISOString().split('T')[0];

  const invoiceModifyNumber = ObjectId().toString();
  const invoiceModifyXml = baseInvoiceModifyXml
    .toString()
    .replace(
      '<taxpayerId>11111111</taxpayerId>',
      `<taxpayerId>${taxNumber}</taxpayerId>`
    )
    .replace(
      '<invoiceNumber>ZZZ000009</invoiceNumber>',
      `<invoiceNumber>${invoiceModifyNumber}</invoiceNumber>`
    )
    .replace(
      '<originalInvoiceNumber>ZZZ000001</originalInvoiceNumber>',
      `<originalInvoiceNumber>${originalInvoiceNumber}</originalInvoiceNumber>`
    )
    .replace(
      '<invoiceIssueDate>2020-05-20</invoiceIssueDate>',
      `<invoiceIssueDate>${today}</invoiceIssueDate>`
    );

  invoiceOperation.push({
    index: 1,
    invoiceOperation: 'MODIFY',
    invoiceData: Buffer.from(invoiceModifyXml).toString('base64'),
  });

  return invoiceOperation;
};
