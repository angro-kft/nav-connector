const { chain, camelCase, cloneDeep } = require('lodash');
const { assert } = require('chai');
const axios = require('axios');

const createBaseRequest = require('../src/create-base-request.js');
const sendRequest = require('../src/send-request.js');

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

describe('sendRequest()', () => {
  it('should resolve to axios respose.data value', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    const responseData = await sendRequest({
      request,
      axios: navAxios,
      path: '/tokenExchange',
    });

    assert.hasAllKeys(responseData, 'TokenExchangeResponse');
  }).timeout(1000);

  it('should handle string error response if request is invalid', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest2',
      technicalUser,
      softwareData,
    });

    try {
      await sendRequest({
        request,
        axios: navAxios,
        path: '/tokenExchange',
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.isString(error.response.data.message);
    }
  }).timeout(1000);

  it('should handle xml error response if request is invalid', async () => {
    const invalidTechnicalUser = cloneDeep(technicalUser);

    invalidTechnicalUser.login = 'invalidUser';

    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser: invalidTechnicalUser,
      softwareData,
    });

    try {
      await sendRequest({
        request,
        axios: navAxios,
        path: '/tokenExchange',
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.isString(error.response.data.funcCode);
    }
  }).timeout(1000);

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
      await sendRequest({
        request,
        axios: invalidAxios,
        path: '/tokenExchange',
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.equal(error.code, 'ENOTFOUND');
    }
  }).timeout(1000);
});
