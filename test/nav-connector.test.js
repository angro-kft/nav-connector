const { assert } = require('chai');
const { technicalUser, softwareData } = require('./lib/globals.js');

const NavConnector = require('../src/nav-connector.js');

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';
const baseURL = 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/';

const invoiceOperation = require('./lib/invoices-base64.js').map(
  (invoice, index) => ({ index: index + 1, operation: 'CREATE', invoice })
);

describe('NavConnector', () => {
  it('should assign technicalUser to the new instance', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.deepEqual(navConnector.technicalUser, technicalUser);
  });

  it('should assign softwareData to the new instance', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.deepEqual(navConnector.softwareData, softwareData);
  });

  it('should set axios default baseURL', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
      baseURL,
    });

    assert.equal(navConnector.axios.defaults.baseURL, baseURL);
  });

  it('should use default axios baseURL when omitted', () => {
    const navConnector = new NavConnector({
      technicalUser,
      softwareData,
    });

    assert.equal(navConnector.axios.defaults.baseURL, defaultBaseUrl);
  });

  it('should set proper http headers to axios', () => {
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

    assert.deepInclude(navConnector.axios.defaults.headers, expectedHeaders);
  });

  describe('manageInvoice()', () => {
    it('should resolve to transactionId', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceOperations = {
        technicalAnnulment: false,
        invoiceOperation: invoiceOperation.slice(0, 1),
      };

      const transactionId = await navConnector.manageInvoice(invoiceOperations);

      assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
    }).timeout(4000);
  });

  describe('queryInvoiceStatus()', () => {
    it('should resolve to processingResults', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceOperations = {
        technicalAnnulment: false,
        invoiceOperation: invoiceOperation.slice(0, 1),
      };

      const transactionId = await navConnector.manageInvoice(invoiceOperations);

      const processingResults = await navConnector.queryInvoiceStatus({
        transactionId,
      });

      assert.isArray(processingResults);
    }).timeout(4000);
  });

  describe('testConnection()', () => {
    it('should not throw if user given auth data and key is valid', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      await navConnector.testConnection();
    }).timeout(4000);
  });

  describe('queryInvoiceData()', () => {
    it('should resolve to queryResults with invoiceQuery param', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceQuery = {
        invoiceNumber: 'invoiceNumber',
        requestAllModification: false,
      };

      const queryResults = await navConnector.queryInvoiceData({
        invoiceQuery,
      });

      assert.isArray(queryResults);
    }).timeout(4000);
  });
});
