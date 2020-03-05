const mysql = require('mysql');
require('dotenv').config();
console.log(process.env);
const mysqlConnection = mysql.createConnection({
  host: process.env.hostDB,
  user: process.env.userDB,
  password: process.env.passwordDB,
  database: process.env.nameDB,
  multipleStatements: true
});

mysqlConnection.connect(function (err) {
  if (err) {
    console.error(err);
    return;
  } else {
    console.log('db is connected');
  }
});

module.exports = mysqlConnection;