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
        $: {
          'xmlns:common': 'http://schemas.nav.gov.hu/NTCA/1.0/common',
          xmlns: 'http://schemas.nav.gov.hu/OSA/3.0/api',
        },
        header: {
          requestId: '5aa8fb82b058db2438eaab4d',
          timestamp: '2018-03-14T10:37:54.000Z',
          requestVersion: '3.0',
          headerVersion: '1.0',
        },
        user: {
          login: 'login123',
          passwordHash:
            'B109F3BBBC244EB82441917ED06D618B9008DD09B3BEFD1B5E07394C706A8BB980B1D7785E5976EC049B46DF5F1326AF5A2EA6D103FD07C95385FFAB0CACBC86',
          taxNumber: '12345678',
          requestSignature:
            '1738823EF4917CCEA987FDAAC599E29AD9880DF6CD7A871A5AA7968C85E305488DDC0CEC7AADF3F16C3AFB20241E7585B0E5ACB5067216012F99367856667FBD',
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
