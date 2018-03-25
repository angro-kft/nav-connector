const { chain, camelCase } = require('lodash');
const { assert } = require('chai');
const axios = require('axios');

const getExchangeToken = require('../src/get-exchange-token.js');
const createBaseRequest = require('../src/create-base-request.js');

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
  it('should be a function', () => {
    assert.isFunction(getExchangeToken);
  });

  it('should return exchange token', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    const exchangeToken = await getExchangeToken({
      axios: navAxios,
      request,
      technicalUser,
    });

    assert.match(
      exchangeToken,
      /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{24}$/i
    );
  }).timeout(20000);

  it('should handle string error response if request is invalid', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest2',
      technicalUser,
      softwareData,
    });

    try {
      await getExchangeToken({
        axios: navAxios,
        request,
        technicalUser,
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.isString(error.response.data.message);
    }
  }).timeout(20000);

  it('should handle xml error response if request is invalid', async () => {
    technicalUser.login = 'invalidUser';

    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    try {
      await getExchangeToken({
        axios: navAxios,
        request,
        technicalUser,
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.isString(error.response.data.funcCode);
    }
  }).timeout(20000);

  it('should handle non response errors', async () => {
    const invalidAxios = axios.create({
      baseURL: 'https://api2-test.onlineszamla.nav.gov.hu/invoiceService/',
      headers: {
        'content-type': 'application/xml',
        accept: 'application/xml',
        encoding: 'UTF-8',
      },
    });

    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    try {
      await getExchangeToken({
        axios: invalidAxios,
        request,
        technicalUser,
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.equal(error.code, 'ENOTFOUND');
    }
  }).timeout(20000);
});
