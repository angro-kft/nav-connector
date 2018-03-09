const EventEmitter = require('events');

const validateTechnicalUser = require('./validate-technical-user');

/** Class representing a NAV online interface.
 * @extends EventEmitter
 */
class NavConnector extends EventEmitter {
  /**
   * Create a navConnector.
   * @param {Object} technicalUser Technical user data.
   */
  constructor(technicalUser) {
    super();

    /* Nothing will work in this class if the technicalUser is not valid. */
    /*
    const validationErrors = validateTechnicalUser(technicalUser);
    if (validationErrors) {
      throw new Error(`technicalUser validation errors: ${validationErrors}`);
    }
    */

    this.technicalUser = technicalUser;
  }
}

exports.NavConnector = NavConnector;
exports.validateTechnicalUser = validateTechnicalUser;
