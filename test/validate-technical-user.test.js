const { assert } = require('chai');

const validateTechnicalUser = require('../src/validate-technical-user.js');

const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

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
