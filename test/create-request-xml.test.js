const { assert } = require('chai');
const createRequestXml = require('../src/create-request-xml.js');
const { readFileSync } = require('fs');

describe('createRequestXml()', () => {
  it('should return a valid request xml', () => {
    const request = {
      TokenExchangeRequest: {
        $: { xmlns: 'http://schemas.nav.gov.hu/OSA/1.0/api' },
        header: {
          requestId: 'RID253015243342',
          timestamp: '2018-01-19T15:12:55Z',
          requestVersion: '1.1',
          headerVersion: '1.0',
        },
        user: {
          login: 'iHXDTq8JHQ33x9O',
          passwordHash:
            'B109F3BBBC244EB82441917ED06D618B9008DD09B3BEFD1B5E07394C706A8BB980B1D7785E5976EC049B46DF5F1326AF5A2EA6D103FD07C95385FFAB0CACBC86',
          taxNumber: '12345678',
          requestSignature:
            '9CF7E97AFE159C71A632D3D6C9F75C8B7012BFE23AAAC425C276DE997B31878FD9394426CCFE99983EDA55B244921399C2B8BB262ABED59DF9AFE3CDD76ED86F',
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
