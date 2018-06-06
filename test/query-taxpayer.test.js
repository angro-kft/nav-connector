const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const queryTaxpayer = require('../src/query-taxpayer.js');

describe('queryTaxpayer()', () => {
  it('should resolve to taxpayer information if taxpayer is valid', async () => {
    const taxpayerInfo = await queryTaxpayer({
      taxNumber: '15789934',
      technicalUser,
      softwareData,
      axios,
    });

    assert.hasAllKeys(taxpayerInfo, ['taxpayerValidity', 'taxpayerData']);
  });

  it('should resolve to empty object if taxpayer does not exists', async () => {
    const taxpayerInfo = await queryTaxpayer({
      taxNumber: '00000000',
      technicalUser,
      softwareData,
      axios,
    });

    assert.hasAllKeys(taxpayerInfo, ['taxpayerValidity']);
  });
});
