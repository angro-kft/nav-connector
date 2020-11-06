const { readFileSync } = require('fs');

const baseAnnulmentXml = readFileSync('./test/lib/invoice-annulment.xml');

/**
 * Create the given number of annulment CORRUPT operations.
 * @param {Object} params Function params.
 * @param {number} [params.size=1] The integer of invoice operations to create.
 * @returns {Array} annulmentOperation
 */
module.exports = function createAnnulmentCorruptOperations({ size = 1 }) {
  const annulmentOperation = [];

  for (let index = 0; index < size; index += 1) {
    let annulmentXml = baseAnnulmentXml;

    annulmentXml = annulmentXml
      .toString()
      .replace(
        '<annulmentReference>22222222</annulmentReference>',
        `<annulmentReference>onetwo</annulmentReference>`
      )
      .replace(
        '<annulmentTimestamp>2018-06-18T09:10:45.309Z</annulmentTimestamp>',
        `<annulmentTimestamp>aaaaaa</annulmentTimestamp>`
      )
      .replace(
        '<annulmentCode>ERRATIC_DATA</annulmentCode>',
        `<annulmentCode>WRONG_CODE</annulmentCode>`
      )
      .replace(
        '<annulmentReason>create szamla annul</annulmentReason>',
        `<annulmentReason>error</annulmentReason>`
      );

    const invoiceAnnulment = Buffer.from(annulmentXml).toString('base64');

    annulmentOperation.push({
      index: index + 1,
      annulmentOperation: 'ANNUL',
      invoiceAnnulment,
    });
  }

  return annulmentOperation;
};
