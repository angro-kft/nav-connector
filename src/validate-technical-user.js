const Ajv = require('ajv');

const validator = new Ajv({
  unicode: false,
  allErrors: true,
  format: 'full',
});

exports.validator = validator;

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
 * @param {} technicalUser Technical user data to validate.
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
