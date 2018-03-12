const { assert } = require('chai');

const validateTechnicalUser = require('../src/validate-technical-user.js');

const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678-2-04',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

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
