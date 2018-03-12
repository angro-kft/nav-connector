const { assert } = require('chai');

const index = require('../src/index.js');

describe('index.js', () => {
  it('should expose NavConnector', () => {
    assert.property(index, 'NavConnector');
  });

  it('should expose validateTechnicalUser', () => {
    assert.property(index, 'validateTechnicalUser');
  });
});
