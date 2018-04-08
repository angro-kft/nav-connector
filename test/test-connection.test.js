const { assert } = require('chai');
const { axios, technicalUser, softwareData } = require('./lib/globals.js');
const { cloneDeep } = require('lodash');

const testConnection = require('../src/test-connection.js');

describe('testConnection()', () => {
  it('should not throw if exchange key operation is successful', async () => {
    await testConnection({
      technicalUser,
      softwareData,
      axios,
    });
  }).timeout(2000);

  it('should throw if exchange key is invalid', async () => {
    const invalidTechnicalUser = cloneDeep(technicalUser);

    invalidTechnicalUser.exchangeKey = '123456789asdfghj';

    try {
      await testConnection({
        technicalUser: invalidTechnicalUser,
        softwareData,
        axios,
      });

      throw new Error('should throw if exchange key is invalid');
    } catch (error) {
      assert.ok(error);
    }
  }).timeout(2000);
});
