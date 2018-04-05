const axios = require('axios');

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';

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
    this.$technicalUser = technicalUser;
    this.$softwareData = softwareData;

    this.$axios = axios.create({
      baseURL,
      headers: {
        'content-type': 'application/xml',
        accept: 'application/xml',
        encoding: 'UTF-8',
      },
    });
  }
};
