const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const queryTaxpayer = require('../src/query-taxpayer.js');

describe('queryTaxpayer()', () => {
  it('should resolve to taxpayer information if taxpayer is valid', async () => {
    const taxpayerInfo = await queryTaxpayer({
      taxNumber: '24291763',
      technicalUser,
      softwareData,
      axios,
    });

    assert.hasAllKeys(taxpayerInfo, ['taxpayerValidity', 'taxpayerData']);
  }).timeout(2000);

  it('should resolve to empty object if taxpayer does not exists', async () => {
    const isValid = await queryTaxpayer({
      taxNumber: '12345678',
      technicalUser,
      softwareData,
      axios,
    });

    assert.isEmpty(isValid, undefined);
  }).timeout(2000);
});
