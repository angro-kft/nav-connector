const { assert } = require('chai');
const { technicalUser, softwareData } = require('./lib/globals.js');
const createInvoiceOperation = require('./lib/create-invoice-operation.js');

const NavConnector = require('../src/nav-connector.js');

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';
const baseURL = 'https://api-test.onlineszamla.nav.gov.hu/invoiceService/';
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

      const invoiceOperation = createInvoiceOperation(
        technicalUser.taxNumber
      ).slice(0, 1);

      const invoiceOperations = {
        technicalAnnulment: false,
        invoiceOperation,
      };

      const transactionId = await navConnector.manageInvoice(invoiceOperations);

      assert.match(transactionId, /^[+a-zA-Z0-9_]{1,30}$/);
    }).timeout(6000);
  });

  describe('queryInvoiceStatus()', () => {
    it('should resolve to processingResults', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      const invoiceOperation = createInvoiceOperation(
        technicalUser.taxNumber
      ).slice(0, 1);

      const invoiceOperations = {
        technicalAnnulment: false,
        invoiceOperation,
      };

      const transactionId = await navConnector.manageInvoice(invoiceOperations);

      const processingResults = await navConnector.queryInvoiceStatus({
        transactionId,
      });

      assert.isArray(processingResults);
    }).timeout(6000);
  });

  describe('testConnection()', () => {
    it('should not throw if user given auth data and key is valid', async () => {
      const navConnector = new NavConnector({
        technicalUser,
        softwareData,
        baseURL,
      });

      await navConnector.testConnection();
    }).timeout(6000);
  });
});
