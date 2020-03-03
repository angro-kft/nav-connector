const { assert } = require('chai');
const createRequestXml = require('../src/create-request-xml.js');
const { readFileSync } = require('fs');

describe('createRequestXml()', () => {
  it('should return a valid request xml', () => {
    const request = {
      TokenExchangeRequest: {
        $: { xmlns: 'http://schemas.nav.gov.hu/OSA/2.0/api' },
        header: {
          requestId: 'RID896801578348',
          timestamp: '2019-09-11T10:55:31.440Z',
          requestVersion: '2.0',
          headerVersion: '1.0',
        },
        user: {
          login: 'lwilsmn0uqdxe6u',
          passwordHash:
            '2F43840A882CFDB7DB0FEC07D419D030D864B47B6B541DC280EF81B937B7A176E33C052B0D26638CC18A7A2C08D8D311733078A774BF43F6CA57FE8CD74DC28E',
          taxNumber: '11111111',
          requestSignature:
            'B4B5E0F197BFFD3DF69BCC98D3BE775F65FD5445EEF95C9D6B6C59425F2B81C4F6DA1FD563B0C7E7D98AF1E1725E5C63C2803B5D3A93D1C02ED354AC92F2CC94',
        },
        software: {
          softwareId: '123456789123456789',
          softwareName: 'string',
          softwareOperation: 'LOCAL_SOFTWARE',
          softwareMainVersion: 'string',
          softwareDevName: 'string',
          softwareDevContact: 'string',
          softwareDevCountryCode: 'HU',
          softwareDevTaxNumber: 'string',
        },
      },
    };
    const requestXml = createRequestXml(request);

    const expected = readFileSync('./test/lib/tokenExchange.xml').toString();

    assert.equal(requestXml, expected);
  });
});
