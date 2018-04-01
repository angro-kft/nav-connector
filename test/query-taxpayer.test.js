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

    assert.isBoolean(isValid);
  }).timeout(2000);
});
