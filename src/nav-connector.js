const axiosCreate = require('axios').create;

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');
const testConnection = require('../src/test-connection.js');

/** Class representing a NAV online interface.
 */
module.exports = class NavConnector {
  /**
   * Create a navConnector.
   * @param {Object} params Constructor params.
   * @param {Object} params.technicalUser Technical user data.
   * @param {Object} params.softwareData Software data.
   * @param {String} [params.baseURL=https://api.onlineszamla.nav.gov.hu/invoiceService/] Axios baseURL.
   */
  constructor({ technicalUser, softwareData, baseURL = defaultBaseUrl }) {
    this.technicalUser = technicalUser;
    this.softwareData = softwareData;

    this.axios = axiosCreate({
      baseURL,
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
   * Get the result of a previously sent manage invoice request.
   * @async
   * @param {Object} params Function params.
   * @param {string} params.transactionId Manage invoice operation transaction id.
   * @param {boolean} [params.returnOriginalRequest=false] Flag for api response to contain the original invoice.
   * @returns {Promise<Array>} processingResults
   */
  async queryInvoiceStatus({ transactionId, returnOriginalRequest = false }) {
    const { technicalUser, softwareData, axios } = this;

    return queryInvoiceStatus({
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
};
