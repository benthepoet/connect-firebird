const Firebird = require('node-firebird');

module.exports = function (session) {
  const Store = session.Store;
  
  class FirebirdStore extends Store {
    constructor({ maxAge, tableName, ...options }) {
      super(options);
      
      this.tableName = tableName || 'session';
      this.maxAge = maxAge || (3600 * 1000);
      this.pool = Firebird.pool(null, options);
    }
    
    clear(callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
      
        const sql = `
          DELETE FROM ${this.tableName}
        `;
        
        db.query(sql, callback);
      });
    }

    destroy(sid, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        const sql = `
          DELETE FROM ${this.tableName}
          WHERE sid = ?
        `;
        
        const params = [sid];
        
        db.query(sql, params, callback);
      });
    }
    
    get(sid, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        const sql = `
          SELECT session 
          FROM ${this.tableName} 
          WHERE sid = ? AND expires_at > CURRENT_TIMESTAMP
        `;
        
        const params = [sid];
        
        db.query(sql, params, (err, [row]) => {
          if (err) return callback(err);
          if (!row) return callback(null, null);
          
          return callback(null, JSON.parse(row.session));
        });
      })
    }
    
    getExpireTime(maxAge) {
      return Date.now() + (maxAge = this.maxAge);
    }
    
    set(sid, session, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        const sql = `
          UPDATE OR INSERT INTO ${this.tableName} (sid, session, expires_at) 
          VALUES (?, ?, ?) MATCHING (sid)
        `;
        
        const params = [
          sid,
          JSON.stringify(session),
          this.getExpireTime(session.cookie.maxAge)
        ];
        
        db.query(sql, params, callback);
      });
    }
    
    touch(sid, session, callback) {
      this.pool.get((err, db) => {
        if (err) return callback(err);
        
        const sql = `
          UPDATE session SET expires_at = ?
          WHERE sid = ?
        `;
        
        const params = [
          this.getExpireTime(session.cookie.maxAge),
          sid
        ];
        
        db.query(sql, params, callback);
      });
    }
  }
  
  return FirebirdStore;
};