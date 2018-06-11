const Firebird = require('node-firebird');

module.exports = function (session) {
  const Store = session.Store;
  
  class FirebirdStore extends Store {
    constructor(options) {
      super(options);
      
      this.pool = Firebird.pool(2, options);
    }
    
    destroy(sid, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        db.query('DELETE FROM session WHERE sid = ?', [sid], callback);
      });
    }
    
    get(sid, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        db.query('SELECT * FROM session WHERE sid = ?', [sid], (err, rows) => {
          if (err) return callback(err);
          
          const [row] = rows;
          if (!row) return callback(null, null);
          
          return callback(null, JSON.parse(row.session));
        });
      })
    }
    
    set(sid, session, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        const data = JSON.stringify(session);
        db.query('UPDATE session = ? FROM session WHERE sid = ?', [data, sid], callback);
      });
    }
  }
  
  return FirebirdStore;
};