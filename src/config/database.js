const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost', // Replace with your database host
  user: 'root', // Replace with your database username
  password: 'n3u3da!', // Replace with your database password
  database: 'neueda', // Replace with your database name
 
});

module.exports = pool.promise();