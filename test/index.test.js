const { chain, camelCase } = require('lodash');
const { assert } = require('chai');

require('dotenv').config();

const { NavConnector } = require('../src/index.js');

const technicalUser = chain(process.env)
  .pickBy((value, key) => key.startsWith('NAV_CONNECTOR_'))
  .mapKeys((value, key) => key.replace('NAV_CONNECTOR_', ''))
  .mapKeys((value, key) => camelCase(key))
  .value();

describe('NavConnector', () => {
  it('should inherit from event emitter', done => {
    const navConnector = new NavConnector(technicalUser);

    navConnector.on('foo', done);

    navConnector.emit('foo');
  });

  it('should have property technicalUser', () => {
    const navConnector = new NavConnector(technicalUser);

    assert.property(navConnector, 'technicalUser');
  });

  /*
  it('should throw if technicalUser argument is not valid', () => {
    assert.throws(() => {
      // eslint-disable-next-line no-new
      new NavConnector();
    });
  });
  */
});
