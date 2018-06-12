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
        
        db.execute(sql, err => {
          db.detach();
          
          return err ? callback(err) : callback();
        });
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
        
        db.execute(sql, params, err => {
          db.detach();
          
          return err ? callback(err) : callback();
        });
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
        
        db.execute(sql, params, (err, [row]) => {
          db.detach();
          
          if (err) return callback(err);
          if (!row) return callback(null, null);
          
          const [buffer] = row;
          return callback(null, JSON.parse(buffer.toString()));
        });
      });
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
        
        db.execute(sql, params, err => {
          db.detach();
          
          return err ? callback(err) : callback();
        });
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
        
        db.execute(sql, params, err => {
          db.detach();
          
          return err ? callback(err) : callback();
        });
      });
    }
  }
  
  return FirebirdStore;
};