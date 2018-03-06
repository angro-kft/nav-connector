const NavConnector = require('../src/index.js');

describe('NavConnector', () => {
  it('should inherit from event emitter', done => {
    const navConnector = new NavConnector();

    navConnector.on('foo', done);

    navConnector.emit('foo');
  });
});
