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

  async manageInvoice(invoiceOperations) {
    const { technicalUser, softwareData, axios } = this;

    return manageInvoice({
      invoiceOperations,
      technicalUser,
      softwareData,
      axios,
    });
  }

  async queryInvoiceStatus({ transactionId, returnOriginalRequest }) {
    const { technicalUser, softwareData, axios } = this;

    return queryInvoiceStatus({
      transactionId,
      returnOriginalRequest,
      technicalUser,
      softwareData,
      axios,
    });
  }

  async testConnection() {
    const { technicalUser, softwareData, axios } = this;

    return testConnection({
      technicalUser,
      softwareData,
      axios,
    });
  }
};
