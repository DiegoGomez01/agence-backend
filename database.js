const mysql = require('mysql2/promise');
const bluebird = require('bluebird');
require('dotenv').config();

async function getConnection() {
  return await mysql.createConnection({
    host: process.env.hostDB,
    user: process.env.userDB,
    password: process.env.passwordDB,
    database: process.env.nameDB,
    multipleStatements: true,
    Promise: bluebird
  });
}

// mysqlConnection.connect(function (err) {
//   if (err) {
//     console.error(err);
//     return;
//   } else {
//     console.log('db is connected');
//   }
// });

module.exports = {
  getConnection: getConnection
};