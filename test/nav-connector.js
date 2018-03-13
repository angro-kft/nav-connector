const { assert } = require('chai');

const NavConnector = require('../src/nav-connector.js');

const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678-2-04',
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

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';
const baseURL = 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/';

describe('NavConnector', () => {
  it('should inherit from event emitter', done => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    navConnector.on('foo', done);

    navConnector.emit('foo');
  });

  it('should assign technicalUser to the new instance', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.deepEqual(navConnector.$technicalUser, technicalUser);
  });

  it('should assign softwareData to the new instance', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.deepEqual(navConnector.$softwareData, softwareData);
  });

  it('should set axios default baseURL', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.equal(navConnector.$axios.defaults.baseURL, baseURL);
  });

  it('should use default axios baseURL when omitted', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
    });

    assert.equal(navConnector.$axios.defaults.baseURL, defaultBaseUrl);
  });

  it('should set propert http headers to axios', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    const expectedHeaders = {
      'content-type': 'application/xml',
      accept: 'application/xml',
      encoding: 'UTF-8',
    };

    assert.deepInclude(navConnector.$axios.defaults.headers, expectedHeaders);
  });
});
