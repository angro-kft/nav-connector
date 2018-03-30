const { chain, camelCase } = require('lodash');
const { assert } = require('chai');
const axios = require('axios');

const getExchangeToken = require('../src/get-exchange-token.js');

require('dotenv').config();

const technicalUser = chain(process.env)
  .pickBy((value, key) => key.includes('NAV_CONNECTOR_TECHNICAL_USER_'))
  .mapKeys((value, key) =>
    camelCase(key.replace('NAV_CONNECTOR_TECHNICAL_USER_', ''))
  )
  .value();

const softwareData = {
  softwareId: '123456789123456789',
  softwareName: 'string',
  softwareOperation: 'LOCAL_SOFTWARE',
  softwareMainVersion: 'string',
  softwareDevName: 'string',
  softwareDevContact: 'string',
  softwareDevCountryCode: 'HU',
  softwareDevTaxNumber: 'string',
};

const navAxios = axios.create({
  baseURL: 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/',
  headers: {
    'content-type': 'application/xml',
    accept: 'application/xml',
    encoding: 'UTF-8',
  },
});

describe('getExchangeToken()', () => {
  it('should resolve to exchange token', async () => {
    const exchangeToken = await getExchangeToken({
      axios: navAxios,
      technicalUser,
      softwareData,
    });

    assert.match(
      exchangeToken,
      /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{24}$/i
    );
  }).timeout(1000);
});
