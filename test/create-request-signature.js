const { assert } = require('chai');
const ObjectId = require('bson-objectid');

const createRequestSignature = require('../src/create-request-signature.js');

const invoicesBase64 = require('./invoices-base64.js');

describe('createRequestSignature()', () => {
  it('should be a function', () => {
    assert.isFunction(createRequestSignature);
  });

  it('should return string', () => {
    const requestSignature = createRequestSignature({
      requestId: ObjectId,
      date: new Date(),
      signatureKey: 'mnlFCfiGkwjIDe59',
      invoices: invoicesBase64,
    });

    assert.isString(requestSignature);
  });

  it('should return valid request signature', () => {
    const requestSignature = createRequestSignature({
      requestId: 'RID332893718672',
      date: new Date('2018-01-22T20:45:58Z'),
      signatureKey: 'mnlFCfiGkwjIDe59',
      invoices: invoicesBase64,
    });
    const expected =
      '01C9CAB158C61784CECACE792F67C68C94135654F10F0A36FCA50E3F18D3068E1B14AADBBCBF3BA08446FFAC037D1DC2D2F92D932FA5085C5B69C3615EB08D50';

    assert.equal(requestSignature, expected);
  });

  it('should return valid request signature without invoices', () => {
    const requestSignature = createRequestSignature({
      requestId: 'RID253015243342',
      date: new Date('2018-01-19T15:12:55Z'),
      signatureKey: 'mnlFCfiGkwjIDe59',
    });
    const expected =
      '9CF7E97AFE159C71A632D3D6C9F75C8B7012BFE23AAAC425C276DE997B31878FD9394426CCFE99983EDA55B244921399C2B8BB262ABED59DF9AFE3CDD76ED86F';

    assert.equal(requestSignature, expected);
  });
});
