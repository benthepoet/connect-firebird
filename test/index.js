const assert = require('assert');
const EventEmitter = require('events');
const createStore = require('../');

describe('FirebirdStore', () => {
  
  let sessionStore;
  
  before(() => {
    const session = {
      Store: function A() {}
    };
    const FirebirdStore = createStore(session);
    
    const options = {
      database: '/var/lib/firebird/data/session.fdb',
      user: 'sysdba',
      password: 'masterkey'
    };
    sessionStore = new FirebirdStore(options);
  });
  
  after(() => {
    sessionStore.pool.destroy();
  });
  
  describe('get', () => {
    it('should return null when session is not found', done => {
      sessionStore.get('abc', (err, session) => {
        assert.ok(!err, err);
        assert.equal(session, null);
        done();
      });
    });
  });
  
});