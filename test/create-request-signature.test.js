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
      '0379FD6E5609F15585AAB258F291FCD3AB03565BE067B76A00066E109DB91C5637F8E33F91C4D1F8E0CA54A48484F957BD53A6C2639CCBDE1DD0FC040B6298D9';

    assert.equal(requestSignature, expected);
  });

  it('should return valid request signature without invoices', () => {
    const requestSignature = createRequestSignature({
      requestId: 'RID253015243342',
      date: new Date('2018-01-19T15:12:55Z'),
      signatureKey: 'mnlFCfiGkwjIDe59',
    });
    const expected =
      'F37A8AF883E2E31BAF0087A484BF22EBCEA122D8790C1C86BB407EC590972CFEBFCC447E995DCD7014B4ACC64A9171D361E96F4A4F4EB5372D16C30D70E9BEC3';

    assert.equal(requestSignature, expected);
  });
});
