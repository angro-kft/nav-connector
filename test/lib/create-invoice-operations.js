const { readFileSync } = require('fs');
const ObjectId = require('bson-objectid');
const { gzipSync } = require('zlib');

const baseInvoiceXml = readFileSync('./test/lib/invoice-create.xml');

/**
 * Create the given number of invoice operations.
 * @param {Object} params Function params.
 * @param {string} params.taxNumber Tax number of the taxpayer using the interface service, to whom the technical user is assigned.
 * @param {boolean} [params.compress=false] Flag to compress invoice xmls.
 * @param {number} [params.size=1] The integer of invoice operations to create.
 * @param {boolean} [params.createInvoiceHash=false] If true electronic invoice hash will be generated
 * @param {string} [params.invoiceNumber=ObjectId] invoice number [OPTIONAL]
 * @returns {Array} invoiceOperation
 */
module.exports = function createInvoiceOperations({
  taxNumber,
  compress = false,
  size = 1,
  createInvoiceHash = false,
  invoiceNumber,
}) {
  const invoiceOperation = [];
  const today = new Date().toISOString().split('T')[0];

  for (let index = 0; index < size; index += 1) {
    let invoiceXml = baseInvoiceXml;
    const invoiceNumberAuto = ObjectId().toString();

    invoiceXml = invoiceXml
      .toString()
      .replace(
        '<ns2:taxpayerId>68845007</ns2:taxpayerId>',
        `<ns2:taxpayerId>${taxNumber}</ns2:taxpayerId>`
      )
      .replace(
        '<invoiceNumber>08185237810576020670</invoiceNumber>',
        `<invoiceNumber>${invoiceNumber || invoiceNumberAuto}</invoiceNumber>`
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

    if (compress) {
      invoiceXml = gzipSync(invoiceXml);
    }

    const invoiceData = Buffer.from(invoiceXml).toString('base64');

    const operation = {
      index: index + 1,
      invoiceOperation: 'CREATE',
      invoiceData,
    };

    if (createInvoiceHash) {
      operation.electronicInvoiceHash =
        '1F1C1E8BDA6C52CA4F2CF805D402997B7ADD6B57705032F7AEA99308B84C5A9D0FCB70BBD52FEA572F4064D19227C2E78D6ADF047DBB058AAD0A4CE4A457888C';
    }

    invoiceOperation.push(operation);
  }

  return invoiceOperation;
};
