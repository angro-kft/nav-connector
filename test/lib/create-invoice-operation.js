const { readFileSync } = require('fs');
const ObjectId = require('bson-objectid');
const { gzipSync } = require('zlib');

const baseInvoiceXml = readFileSync('./test/lib/invoice-create.xml');
const corruptInvoiceXml = readFileSync('./test/lib/invoice-create-corrupt.xml');

/**
 * Creates 3 valid and unique invoices and returns them as an invoiceOperation Array.
 * @param {string} taxNumber Tax number of the taxpayer using the interface service,
 * to whom the technical user is assigned.
 * @param {boolean} [compress=false] Flag to compress invoice xmls.
 * @param {boolean} [corrupt=false] Flag to set data corruptions in the invoices.
 * The first xml has 0, the second has 1 the third has 2 technicalValidationMessages
 * and businessValidationMessages errors.
 * @returns {Array} invoiceOperation
 */
module.exports = function createInvoiceOperation({
  taxNumber,
  compress = false,
  corrupt = false,
}) {
  const invoiceOperation = [];
  const today = new Date().toISOString().split('T')[0];
  let existingInvoiceNumber;

  for (let index = 0; index < 6; index += 1) {
    let invoiceXml = corrupt ? corruptInvoiceXml : baseInvoiceXml;
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

    if (corrupt) {
      switch (index) {
        case 1:
          invoiceXml = invoiceXml.replace(
            '<lineNumber>2</lineNumber>',
            '<lineNumber>2</lineNumber><productCodes><productCode><productCodeCategory>VTSZ</productCodeCategory><productCodeValue>16010091</productCodeValue></productCode></productCodes>'
          );
          break;

        case 2:
          invoiceXml = invoiceXml
            .replace(
              '<taxpayerId>15789934</taxpayerId>',
              '<taxpayerId>33333333</taxpayerId>'
            )
            .replace(
              '<lineNumber>2</lineNumber>',
              '<lineNumber>2</lineNumber><productCodes><productCode><productCodeCategory>VTSZ</productCodeCategory><productCodeValue>16010091</productCodeValue></productCode></productCodes>'
            );

          break;

        case 3:
          existingInvoiceNumber = invoiceNumber;
          break;

        case 4:
          invoiceXml = invoiceXml.replace('<lineNumber>2</lineNumber>', '');
          break;

        case 5:
          invoiceXml = invoiceXml.replace(
            `<invoiceNumber>${invoiceNumber}</invoiceNumber>`,
            `<invoiceNumber>${existingInvoiceNumber}</invoiceNumber>`
          );
          break;

        default:
          break;
      }
    }

    if (compress) {
      invoiceXml = gzipSync(invoiceXml);
    }

    const invoice = Buffer.from(invoiceXml).toString('base64');

    invoiceOperation.push({ index: index + 1, operation: 'CREATE', invoice });
  }

  return invoiceOperation;
};
