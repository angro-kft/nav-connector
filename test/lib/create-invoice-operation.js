const { readFileSync } = require('fs');

const baseInvoiceXml = readFileSync('./test/lib/invoice-create.xml');

/**
 * Creates 3 valid and unique invoices and returns them as an invoiceOperation array.
 * @param {string} taxNumber Tax number of the taxpayer using the interface service,
 * to whom the technical user is assigned
 * @returns {Array} invoiceOperation
 */
module.exports = function createInvoiceOperation(taxNumber) {
  const invoiceOperation = [];

  for (let index = 0; index < 3; index += 1) {
    const invoiceXml = baseInvoiceXml
      .toString()
      .replace(
        '<taxpayerId>11111111</taxpayerId>',
        `<taxpayerId>${taxNumber}</taxpayerId>`
      )
      .replace(
        '<invoiceNumber>2019/000123</invoiceNumber>',
        `<invoiceNumber>${Date.now()}</invoiceNumber>`
      );

    const invoice = Buffer.from(invoiceXml).toString('base64');

    invoiceOperation.push({ index: index + 1, operation: 'CREATE', invoice });
  }

  return invoiceOperation;
};
