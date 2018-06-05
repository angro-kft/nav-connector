const { assert } = require('chai');
const ObjectId = require('bson-objectid');

const createRequestSignature = require('../src/create-request-signature.js');

const invoicesBase64 = require('./lib/invoices-base64.js');

describe('createRequestSignature()', () => {
  it('should return new request signature', () => {
    const requestSignature = createRequestSignature({
      requestId: ObjectId().toString(),
      date: new Date(),
      signatureKey: 'mnlFCfiGkwjIDe59',
      invoices: invoicesBase64,
    });

    assert.isString(requestSignature);
  });

  it('should return valid request signature', () => {
    const requestSignature = createRequestSignature({
      requestId: 'RID332893718672',
      date: new Date('2018-01-22T20:45:58.000Z'),
      signatureKey: 'ce-8f5e-215119fa7dd621DLMRHRLH2S',
      invoices: invoicesBase64,
    });
    const expected =
      'F1FFC71E7A7C800B86FB7AF10F2FF26AB9FBCB8CD39747FE5987D0318563F2B0E8ECB893B9A34D4BF034575B6AFD067EB8A1D8C9D8E5875D9F42496443F9B84D';

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
