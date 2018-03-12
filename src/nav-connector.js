const EventEmitter = require('events');
const axios = require('axios');

const defaultBaseUrl = 'https://api.onlineszamla.nav.gov.hu/invoiceService/';

/** Class representing a NAV online interface.
 * @extends EventEmitter
 */
class NavConnector extends EventEmitter {
  /**
   * Create a navConnector.
   * @param {Object} technicalUser Technical user data.
   * @param {string} technicalUser.login - Technical user’s login name.
   * @param {string} technicalUser.password - Technical user’s password.
   * @param {string} technicalUser.taxNumber - Tax number of the taxpayer using the interface
   * service, to whom the technical user is assigned.
   * @param {string} technicalUser.signatureKey - Technical user’s signature key.
   * @param {string} technicalUser.exchangeKey - Technical user’s exchange key (replacement key).
   */
  constructor(technicalUser, baseURL = defaultBaseUrl) {
    super();

    this.technicalUser = technicalUser;

    this.axios = axios.create({
      baseURL,
      headers: {
        'content-type': 'application/xml',
        accept: 'application/xml',
      },
    });
  }
}

module.exports = NavConnector;
