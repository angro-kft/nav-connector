const { assert } = require('chai');

const createRequestSignature = require('../src/create-request-signature.js');

describe('createRequestSignature()', () => {
  it('should be a function', () => {
    assert.isFunction(createRequestSignature);
  });

  it('should return valid request signature', () => {
    const requestSignature = createRequestSignature({
      requestId: 'TSTKFT1222564',
      date: new Date('2017-12-30T18:25:45Z'),
      signatureKey: 'XqywhcD1o4JZXsSL',
      invoices: [],
    });
    const expected =
      '0726C94424174913464010FAEB7B33E070EE619E6A3A869EB8A66FFCA26AE58002E4CC6CBF8A683E636441D11B3ACA4E04969FFEAAB9971A63C191918709EE52';

    assert.equal(requestSignature, expected);
  });
});
