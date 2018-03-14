const { assert } = require('chai');
const axios = require('axios');

const getExchangeToken = require('../src/get-exchange-token.js');
const createBaseRequest = require('../src/create-base-request.js');
const createRequestXml = require('../src/create-request-xml.js');

const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

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
    const baseRequest = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    const requestXml = createRequestXml(baseRequest);

    const response = await getExchangeToken({ axios: navAxios, requestXml });
  });
});
