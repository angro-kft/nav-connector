const { chain, camelCase } = require('lodash');
require('dotenv').config();

const NavConnector = require('../src/index.js');

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
});
