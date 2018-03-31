const { assert } = require('chai');
const { technicalUser } = require('./lib/globals.js');

const validateTechnicalUser = require('../src/validate-technical-user.js');

describe('validateTechnicalUser()', () => {
  it('should return an empty string when technicalUser is valid', () => {
    const validationErrors = validateTechnicalUser(technicalUser);

    assert.equal(validationErrors, '');
  });

  it('should return a string containst validation errors when technicalUser is invalid', () => {
    const validationErrors = validateTechnicalUser();

    assert.equal(validationErrors, 'data should be object');
  });
});
