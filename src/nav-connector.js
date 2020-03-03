const axiosCreate = require('axios').create;

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/v2/';

const manageInvoice = require('../src/manage-invoice.js');
const manageAnnulment = require('../src/manage-annulment.js');
const queryTransactionStatus = require('../src/query-transaction-status.js');
const testConnection = require('../src/test-connection.js');
const queryInvoiceData = require('../src/query-invoice-data.js');
const queryInvoiceDigest = require('../src/query-invoice-digest');
const queryTaxpayer = require('../src/query-taxpayer.js');

/** Class representing a NAV online interface.
 */
module.exports = class NavConnector {
  /**
   * Create a navConnector.
   * @param {Object} params Constructor params.
   * @param {Object} params.technicalUser Technical user data.
   * @param {Object} params.softwareData Software data.
   * @param {string} [params.baseURL=https://api.onlineszamla.nav.gov.hu/invoiceService/v2/] Axios baseURL.
   * @param {number} [params.timeout=70000] Axios default timeout integer in milliseconds.
   */
  constructor({
    technicalUser,
    softwareData,
    baseURL = defaultBaseUrl,
    timeout = 70000,
  }) {
    this.technicalUser = technicalUser;
    this.softwareData = softwareData;

    this.axios = axiosCreate({
      baseURL,
      timeout,
      headers: {
        'content-type': 'application/xml',
        accept: 'application/xml',
        encoding: 'UTF-8',
      },
    });
  }

  /**
   * Send request to NAV service to manage invoices.
   * @async
   * @param {Object} invoiceOperations Request object for xml conversion and send.
   * @returns {Promise<string>} Manage invoice operation transaction id.
   */
  async manageInvoice(invoiceOperations) {
    const { technicalUser, softwareData, axios } = this;

    return manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });
  }

  /**
   * Send request to NAV service to manage invoice annulments.
   * @async
   * @param {Object} annulmentOperations Request object for xml conversion and send.
   * @returns {Promise<string>} Manage invoice annulment operation transaction id.
   */
  async manageAnnulment(annulmentOperations) {
    const { technicalUser, softwareData, axios } = this;

    return manageAnnulment({
      annulmentOperations,
      technicalUser,
      softwareData,
      axios,
    });
  }

  /**
   * Get the result of a previously sent manage invoice request.
   * @async
   * @param {Object} params Function params.
   * @param {string} params.transactionId Manage invoice operation transaction id.
   * @param {boolean} [params.returnOriginalRequest=false] Flag for api response to contain the original invoice.
   * @returns {Promise<Array>} processingResults
   */
  async queryTransactionStatus({
    transactionId,
    returnOriginalRequest = false,
  }) {
    const { technicalUser, softwareData, axios } = this;

    return queryTransactionStatus({
      transactionId,
      returnOriginalRequest,
      technicalUser,
      softwareData,
      axios,
    });
  }

  /**
   * Test connection, user auth data and keys validity with a tokenExchangeRequest.
   * @async
   * @throws {Object} Will throw an error if there was a network expectation
   * or any user given auth data or key is invalid.
   */
  async testConnection() {
    const { technicalUser, softwareData, axios } = this;

    return testConnection({
      technicalUser,
      softwareData,
      axios,
    });
  }

  /**
   * Query previously sent invoices with invoice number or query params.
   * @async
   * @param {Object} params Function params.
   * @param {number} params.page Integer page to query.
   * @param {Object} params.invoiceQuery Query single invoice with invoice number.
   * @param {Object} params.queryParams Query multiple invoices with params.
   * @returns {Promise<Object>} response
   */
  async queryInvoiceData({ page, invoiceQuery, queryParams }) {
    const { technicalUser, softwareData, axios } = this;

    return queryInvoiceData({
      page,
      invoiceQuery,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });
  }

  /**
   * Query previously sent invoices with query params.
   * @async
   * @param {Object} params Function params.
   * @param {number} params.page Integer page to query.
   * @param {string} params.invoiceDirection inbound or outbound request type
   * @param {Object} params.queryParams Query multiple invoices with params.
   * @returns {Promise<Object>} response
   */
  async queryInvoiceDigest({ page, invoiceDirection, queryParams }) {
    const { technicalUser, softwareData, axios } = this;

    return queryInvoiceDigest({
      page,
      invoiceDirection,
      queryParams,
      technicalUser,
      softwareData,
      axios,
    });
  }

  /**
   * Get taxpayer information by tax number.
   * @param {string} taxNumber Taxpayer tax number to get information for.
   * @returns {Promise<Object>} Taxpayer information.
   */
  async queryTaxpayer(taxNumber) {
    const { technicalUser, softwareData, axios } = this;

    return queryTaxpayer({
      taxNumber,
      technicalUser,
      softwareData,
      axios,
    });
  }
};
