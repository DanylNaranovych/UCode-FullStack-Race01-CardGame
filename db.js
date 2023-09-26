const mysql = require('mysql2');
const fs = require('fs');

const configPath = './config.json';

let pool;

async function connectToDatabase() {
  if (pool) return pool;

  try {
    const rawConfig = fs.readFileSync(configPath);
    const config = JSON.parse(rawConfig);

    pool = mysql.createPool(config);

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Database connection error: ' + err.stack);
        throw err;
      }
      console.log('Connected to the database');

      connection.release();
    });

    return pool;
  } catch (err) {
    console.error('Error reading config.json or connecting to the database:', err);
    throw err;
  }
}

module.exports = {
  connectToDatabase
};
