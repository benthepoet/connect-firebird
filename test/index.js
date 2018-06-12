const assert = require('assert');
const EventEmitter = require('events');
const createStore = require('../');

describe('FirebirdStore', () => {
  
  const sessionId = Date.now();
  const sessionData = { cookie: {} };
  
  let sessionStore;
  
  before(() => {
    const session = { Store: EventEmitter };
    const FirebirdStore = createStore(session);
    
    const options = {
      database: `${process.env.FIREBIRD_DATA}/session.fdb`,
      user: 'sysdba',
      password: 'masterkey'
    };
    sessionStore = new FirebirdStore(options);
  });
  
  after(() => {
    sessionStore.pool.destroy();
  });
  
  it('should return null when session is not found', done => {
    sessionStore.get(sessionId, (err, session) => {
      assert.ok(!err, err);
      assert.equal(session, null);
      done();
    });
  });
  
  it('should set session', done => {
    sessionStore.set(sessionId, sessionData, err => {
      assert.ok(!err, err);
      done();
    });
  });
  
  it('should get session', done => {
    sessionStore.get(sessionId, (err, session) => {
      assert.ok(!err, err);
      assert.deepEqual(session, sessionData);
      done();
    });
  });
  
  it('should touch session', done => {
    sessionStore.touch(sessionId, sessionData, err => {
      assert.ok(!err, err);
      done();
    });
  });
  
  it('should destroy session', done => {
    sessionStore.destroy(sessionId, err => {
      assert.ok(!err, err);
      done();
    });
  })
  
  it('should clear all sessions', done => {
    sessionStore.clear(err => {
      assert.ok(!err, err);
      done();
    });
  });
});