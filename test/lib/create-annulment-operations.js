const { readFileSync } = require('fs');

const baseAnnulmentXml = readFileSync('./test/lib/invoice-annulment.xml');

/**
 * Create the given number of annulment operations.
 * @param {Array<Object>} operations Array of annulment operations to create
 * @param {string} operations.annulmentReference Reference number of the invoice or modification document subject to technical annulment
 * @param {boolean} [operations.annulmentTimestamp=DATE] UTC timestamp of the technical annulment in the source system [OPTIONAL]
 * @param {number} [operations.annulmentCode=ERRATIC_DATA] Technical annulment code. one of ERRATIC_DATA, ERRATIC_INVOICE_NUMBER, ERRATIC_INVOICE_ISSUE_DATE [OPTIONAL]
 * @param {number} [operations.annulmentReason=create szamla annul] Reason for the technical annulment [OPTIONAL]
 * @returns {Array} annulmentOperation
 */
module.exports = function createAnnulmentOperations(operations) {
  const annulmentOperation = [];

  const defaultData = {
    annulmentTimestamp: new Date().toISOString(),
    annulmentCode: 'ERRATIC_DATA',
    annulmentReason: 'create szamla annul',
  };

  operations.forEach((operation, index) => {
    let annulmentXml = baseAnnulmentXml;

    annulmentXml = annulmentXml
      .toString()
      .replace(
        '<annulmentReference>22222222</annulmentReference>',
        `<annulmentReference>${operation.annulmentReference}</annulmentReference>`
      )
      .replace(
        '<annulmentTimestamp>2018-06-18T09:10:45.309Z</annulmentTimestamp>',
        `<annulmentTimestamp>${operation.annulmentTimestamp ||
          defaultData.annulmentTimestamp}</annulmentTimestamp>`
      )
      .replace(
        '<annulmentCode>ERRATIC_DATA</annulmentCode>',
        `<annulmentCode>${operation.annulmentCode ||
          defaultData.annulmentCode}</annulmentCode>`
      )
      .replace(
        '<annulmentReason>create szamla annul</annulmentReason>',
        `<annulmentReason>${operation.annulmentReason ||
          defaultData.annulmentReason}</annulmentReason>`
      );

    const invoiceAnnulment = Buffer.from(annulmentXml).toString('base64');

    annulmentOperation.push({
      index: index + 1,
      annulmentOperation: 'ANNUL',
      invoiceAnnulment,
    });
  });

  return annulmentOperation;
};
