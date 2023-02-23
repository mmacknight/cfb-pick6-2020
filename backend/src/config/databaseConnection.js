const mysql = require('mysql');

function createConnection() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    multipleStatements: true
  };

  const connection = mysql.createConnection(config);

  connection.connect(function (err) {
    if (err) {
      console.log('Error connecting:' + err.stack);
    }
  });

  return connection;
}

module.exports = {
  createConnection: createConnection
};
