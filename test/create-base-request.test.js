const { assert } = require('chai');
const { softwareData } = require('./lib/globals.js');

const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

const createBaseRequest = require('../src/create-base-request.js');

describe('createBaseRequest()', () => {
  it('should return new base request', () => {
    const baseRequest = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      technicalUser,
      softwareData,
    });

    assert.isObject(baseRequest);
  });

  it('should return valid baseRequest', () => {
    const expected = {
      TokenExchangeRequest: {
        $: { xmlns: 'http://schemas.nav.gov.hu/OSA/1.0/api' },
        header: {
          requestId: '5aa8fb82b058db2438eaab4d',
          timestamp: '2018-03-14T10:37:54.000Z',
          requestVersion: '1.0',
          headerVersion: '1.0',
        },
        user: {
          login: 'login123',
          passwordHash:
            'B109F3BBBC244EB82441917ED06D618B9008DD09B3BEFD1B5E07394C706A8BB980B1D7785E5976EC049B46DF5F1326AF5A2EA6D103FD07C95385FFAB0CACBC86',
          taxNumber: '12345678',
          requestSignature:
            '91A5E8D2AF76A3C11AC223942D97114E1C878B4D44E98269E18650DE0FE75BD7C86D7B08EA17A703C86BEE3B58860F452BA4F6CE830D49B1581E72C779662042',
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

    const baseRequest = createBaseRequest({
      requestType: 'TokenExchangeRequest',
      requestId: '5aa8fb82b058db2438eaab4d',
      date: new Date('2018-03-14T10:37:54Z'),
      technicalUser,
      softwareData,
    });

    assert.deepEqual(baseRequest, expected);
  });
});
