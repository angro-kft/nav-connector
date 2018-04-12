const axiosCreate = require('axios').create;

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';

const manageInvoice = require('../src/manage-invoice.js');
const queryInvoiceStatus = require('../src/query-invoice-status.js');
const testConnection = require('../src/test-connection.js');
const queryTaxpayer = require('../src/query-taxpayer.js');

/** Class representing a NAV online interface.
 */
module.exports = class NavConnector {
  /**
   * Create a navConnector.
   * @param {Object} params Constuctor params.
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
   * @param {Object} params.transactionId Manage invoice operation transaction id.
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
   * Test connection, user auth data and keys validity with a tokenExchnageRequest.
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
