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
      '<ns2:taxpayerId>68845007</ns2:taxpayerId>',
      `<ns2:taxpayerId>${taxNumber}</ns2:taxpayerId>`
    )
    .replace(
      '<invoiceNumber>08185237810576020670</invoiceNumber>',
      `<invoiceNumber>${invoiceModifyNumber}</invoiceNumber>`
    )
    .replace(
      '<originalInvoiceNumber>08185237810576020670</originalInvoiceNumber>',
      `<originalInvoiceNumber>${originalInvoiceNumber}</originalInvoiceNumber>`
    )
    .replace(
      '<invoiceIssueDate>2020-09-04</invoiceIssueDate>',
      `<invoiceIssueDate>${today}</invoiceIssueDate>`
    )
    .replace(
      '<invoiceDeliveryDate>2020-05-10</invoiceDeliveryDate>',
      `<invoiceDeliveryDate>${today}</invoiceDeliveryDate>`
    )
    .replace(
      '<paymentDate>2020-05-30</paymentDate>',
      `<paymentDate>${today}</paymentDate>`
    );

  invoiceOperation.push({
    index: 1,
    invoiceOperation: 'MODIFY',
    invoiceData: Buffer.from(invoiceModifyXml).toString('base64'),
  });

  return invoiceOperation;
};
