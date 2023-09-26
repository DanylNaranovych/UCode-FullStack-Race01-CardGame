class User {
  constructor(login, password, full_name, email_address, db) {
    this.login = login;
    this.password = password;
    this.full_name = full_name;
    this.email_address = email_address;
    this.db = db;
  }

  saveToDatabase(callback) {
    const sql = 'INSERT INTO users (login, password, full_name, email_address) VALUES (?, ?, ?, ?)';
    const url = 'avatars/baza.png';
    const values = [this.login, this.password, this.full_name, this.email_address, url];

    this.db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Database error: ' + err);
        callback(err, null);
        return;
      }

      console.log('User registered successfully');
      callback(null, 'User registered successfully');
    });
  }

  findUser(callback) {
    const sql = 'SELECT * FROM users WHERE login = ? AND password = ?';
    const values = [this.login, this.password];
  
    this.db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Database error: ' + err);
        callback(err, null);
        return;
      }
  
      if (results.length === 0) {
        callback(null, null);
      } else {
        const user = results[0];
        callback(null, user);
      }
    });
  }

  findUserByEmail(email, db, callback) {
    const sql = 'SELECT * FROM users WHERE email_address = ?';
    const values = [email];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error('Database error: ' + err);
        callback(err, null);
        return;
      }

      if (results.length === 0) {
        callback(null, null);
      } else {
        const user = results[0];
        callback(null, user);
      }
    });
  }
  
}

module.exports = User;
