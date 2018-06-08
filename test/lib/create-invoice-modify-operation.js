const { readFileSync } = require('fs');
const ObjectId = require('bson-objectid');

const baseInvoiceModifyXml = readFileSync('./test/lib/invoice-modify.xml');

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
      '<invoiceNumber>2019/000129</invoiceNumber>',
      `<invoiceNumber>${invoiceModifyNumber}</invoiceNumber>`
    )
    .replace(
      '<originalInvoiceNumber>2019/000123</originalInvoiceNumber>',
      `<originalInvoiceNumber>${originalInvoiceNumber}</originalInvoiceNumber>`
    )
    .replace(
      '<modificationIssueDate>2019-05-15</modificationIssueDate>',
      `<modificationIssueDate>${today}</modificationIssueDate>`
    )
    .replace(
      '<modificationTimestamp>2019-05-15T17:12:20.000Z</modificationTimestamp>',
      `<modificationTimestamp>${new Date().toISOString()}</modificationTimestamp>`
    );

  invoiceOperation.push({
    index: 1,
    operation: 'MODIFY',
    invoice: Buffer.from(invoiceModifyXml).toString('base64'),
  });

  return invoiceOperation;
};
