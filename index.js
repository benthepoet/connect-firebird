const Firebird = require('node-firebird');

module.exports = function (session) {
  const Store = session.Store;
  
  class FirebirdStore extends Store {
    constructor(options) {
      super(options);
      
      this.db = Firebird.attach(options, (err, db) => {
        if (err) {
          this.emit('error', err)
          return;
        };
        
        this.db = db;
        this.emit('connect');
      });
    }
  }
};