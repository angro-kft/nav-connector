const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const getExchangeToken = require('../src/get-exchange-token.js');

describe('getExchangeToken()', () => {
  it('should resolve to exchange token', async () => {
    const exchangeToken = await getExchangeToken({
      axios,
      technicalUser,
      softwareData,
    });

    assert.match(
      exchangeToken,
      /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{24}$/i
    );
  }).timeout(2000);
});
