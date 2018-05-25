const { cloneDeep } = require('lodash');
const { assert } = require('chai');
const newAxios = require('axios');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');

const createBaseRequest = require('../src/create-base-request.js');
const sendRequest = require('../src/send-request.js');

describe('sendRequest()', () => {
  it('should resolve to axios response.data value', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    const responseData = await sendRequest({
      request,
      axios,
      path: '/tokenExchange',
    });

    assert.property(responseData, 'TokenExchangeResponse');
  }).timeout(6000);

  it('should have schemaValidationMessages property in the error response', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest2',
      technicalUser,
      softwareData,
    });

    try {
      await sendRequest({
        request,
        axios,
        path: '/tokenExchange',
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.property(error.response.data, 'schemaValidationMessages');
    }
  }).timeout(6000);

  it('should handle string error response if request is invalid', async () => {
    const request = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    try {
      await sendRequest({
        request,
        axios,
        path: '/tokenExchange2',
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.isString(error.response.data.result.message);
    }
  }).timeout(6000);

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
        axios,
        path: '/tokenExchange',
      });

      throw new Error('should throw if request is invalid');
    } catch (error) {
      assert.isString(error.response.data.result.funcCode);
    }
  }).timeout(6000);

  it('should handle non response errors', async () => {
    const invalidAxios = newAxios.create({
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
  }).timeout(6000);
});
