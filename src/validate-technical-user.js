const Ajv = require('ajv');

const validator = new Ajv({
  unicode: false,
  allErrors: true,
  format: 'full',
});

const technicalUserSchema = validator.compile({
  type: 'object',
  additionalProperties: false,
  required: ['login', 'password', 'taxNumber', 'signatureKey', 'exchangeKey'],
  properties: {
    login: {
      type: 'string',
      pattern: '[a-zA-Z0-9]{6,15}',
    },
    password: {
      type: 'string',
    },
    taxNumber: {
      type: 'string',
      pattern: '[0-9]{8}',
    },
    signatureKey: {
      type: 'string',
    },
    exchangeKey: {
      type: 'string',
    },
  },
});

/**
 * Validate technical user data to a predefined schema.
 * @param {Object} technicalUser Technical user data to valudate.
 * @param {string} technicalUser.login - Technical user’s login name.
 * @param {string} technicalUser.password - Technical user’s password.
 * @param {string} technicalUser.taxNumber - Tax number of the taxpayer using the interface
 * service, to whom the technical user is assigned.
 * @param {string} technicalUser.signatureKey - Technical user’s signature key.
 * @param {string} technicalUser.exchangeKey - Technical user’s exchange key (replacement key).
 * @returns {string} TechnicalUser validation result.
 * Contains errors or an empty string if the data is valid.
 */
module.exports = function validateTechnicalUser(technicalUser) {
  let validationErrors = '';

  if (!technicalUserSchema(technicalUser)) {
    validationErrors = validator.errorsText(technicalUserSchema.errors);
  }

  return validationErrors;
};
