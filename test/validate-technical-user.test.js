const { chain, camelCase } = require('lodash');
const { assert } = require('chai');

require('dotenv').config();

const { validateTechnicalUser } = require('../src/index.js');

const technicalUser = chain(process.env)
  .pickBy((value, key) => key.startsWith('NAV_CONNECTOR_'))
  .mapKeys((value, key) => key.replace('NAV_CONNECTOR_', ''))
  .mapKeys((value, key) => camelCase(key))
  .value();

describe('validateTechnicalUser()', () => {
  it('should be a function', () => {
    assert.isFunction(validateTechnicalUser);
  });

  it('should return a string', () => {
    const validationErrors = validateTechnicalUser(technicalUser);

    assert.isString(validationErrors);
  });

  it('should return an empty string when technicalUser is valid', () => {
    const validationErrors = validateTechnicalUser(technicalUser);

    assert.isEmpty(validationErrors);
  });

  it('should return a string containst validation errors when technicalUser is invalid', () => {
    const validationErrors = validateTechnicalUser();

    assert.equal(validationErrors, 'data should be object');
  });
});
