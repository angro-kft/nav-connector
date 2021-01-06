const { readFileSync } = require('fs');
const ObjectId = require('bson-objectid');

const baseInvoiceXml = readFileSync('./test/lib/invoice-create.xml');

/**
 * Create 5 invoice operations where invoice 1 and 2 has 1 and 2 warning
 * and invoice 4 and 5 has 1 and 2 errors.
 * @param {Object} params Function params.
 * @param {string} params.taxNumber Tax number of the taxpayer using the interface service,
 * to whom the technical user is assigned.
 * @returns {Array} invoiceOperation
 */
module.exports = function createInvoiceCorruptOperations({ taxNumber }) {
  const invoiceOperation = [];
  const today = new Date().toISOString().split('T')[0];
  let existingInvoiceNumber;

  for (let index = 0; index < 6; index += 1) {
    let invoiceXml = baseInvoiceXml;
    const invoiceNumber = ObjectId().toString();

    invoiceXml = invoiceXml
      .toString()
      .replace(
        '<ns2:taxpayerId>68845007</ns2:taxpayerId>',
        `<ns2:taxpayerId>${taxNumber}</ns2:taxpayerId>`
      )
      .replace(
        '<invoiceNumber>08185237810576020670</invoiceNumber>',
        `<invoiceNumber>${invoiceNumber}</invoiceNumber>`
      )
      .replace(
        '<invoiceIssueDate>2020-09-04</invoiceIssueDate>',
        `<invoiceIssueDate>${today}</invoiceIssueDate>`
      )
      .replace(
        '<invoiceDeliveryDate>2020-09-04</invoiceDeliveryDate>',
        `<invoiceDeliveryDate>${today}</invoiceDeliveryDate>`
      )
      .replace(
        '<paymentDate>2020-09-04</paymentDate>',
        `<paymentDate>${today}</paymentDate>`
      );

    switch (index) {
      case 1:
        invoiceXml = invoiceXml.replace(
          '<unitOfMeasure>PIECE</unitOfMeasure>',
          ''
        );
        break;

      case 2:
        invoiceXml = invoiceXml.replace(
          '<unitOfMeasure>PIECE</unitOfMeasure>',
          ''
        );

        break;

      case 3:
        existingInvoiceNumber = invoiceNumber;
        break;

      case 4:
        invoiceXml = invoiceXml.replace(
          `<invoiceNumber>${invoiceNumber}</invoiceNumber>`,
          `<invoiceNumber>${existingInvoiceNumber}</invoiceNumber>`
        );

        break;

      case 5:
        invoiceXml = invoiceXml.replace('<lineNumber>2</lineNumber>', '');
        break;

      default:
        break;
    }

    const invoiceData = Buffer.from(invoiceXml).toString('base64');

    invoiceOperation.push({
      index: index + 1,
      invoiceOperation: 'CREATE',
      invoiceData,
    });
  }

  return invoiceOperation;
};
