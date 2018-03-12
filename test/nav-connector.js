const { assert } = require('chai');

const NavConnector = require('../src/nav-connector.js');

const technicalUser = {
  login: 'login123',
  password: 'password',
  taxNumber: '12345678-2-04',
  signatureKey: 'signatureKey',
  exchangeKey: 'exchangeKey',
};

describe('NavConnector', () => {
  it('should inherit from event emitter', done => {
    const navConnector = new NavConnector(technicalUser);

    navConnector.on('foo', done);

    navConnector.emit('foo');
  });

  it('should have property technicalUser after instantiation', () => {
    const navConnector = new NavConnector(technicalUser);

    assert.property(navConnector, 'technicalUser');
  });
});
