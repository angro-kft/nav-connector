const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const queryTaxpayer = require('../src/query-taxpayer.js');

describe('queryTaxpayer()', () => {
  it('should resolve to taxpayer validation status', async () => {
    const isValid = await queryTaxpayer({
      taxNumber: '24291763',
      technicalUser,
      softwareData,
      axios,
    });

    assert.equal(isValid, true);
  }).timeout(2000);

  it('should resolve to undefined if taxpayer does not exists', async () => {
    const isValid = await queryTaxpayer({
      taxNumber: '12345678',
      technicalUser,
      softwareData,
      axios,
    });

    assert.equal(isValid, undefined);
  }).timeout(2000);
});
