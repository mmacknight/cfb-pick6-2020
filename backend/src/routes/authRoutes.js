const mysql = require('mysql');
const bcrypt = require('bcrypt');
const connection = require('../config/databaseConnection.js').createConnection();

module.exports = function (router) {

  /**
   * Creates a new user with the given username, password, first name, last name, and email.
   *
   * @route POST /register
   * @group Authentication
   *
   * @param {string} req.body.username.required - The desired username for the new user.
   * @param {string} req.body.password.required - The desired password for the new user.
   * @param {string} req.body.first.required - The first name of the new user.
   * @param {string} req.body.last.required - The last name of the new user.
   * @param {string} req.body.email.required - The email address of the new user.
   *
   * @returns {object} 200 - The new user was successfully created.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 500 - The server encountered an error while creating the user.
   */
  router.post('/register', async (req, res) => {
    const { username, password, first, last, email } = req.body;

    if (!username || !password || !email) {
      res.status(400).send({ success: false, message: 'Please provide username, email, and password.' });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password.split('#').join('$'), 10);
      const query = `INSERT INTO users (username, password, first, last, email) VALUES (?, ?, ?, ?, ?)`;
      const params = [username, hashedPassword, first, last, email];
      connection.query(query, params, (error, results) => {
        if (error) {
          res.status(500).send({ success: false, message: 'Unable to create user.' });
        } else {
          res.send({ success: true, message: 'User created successfully!' });
        }
      });
    } catch (error) {
      res.status(500).send({ success: false, message: 'Unable to create user.' });
    }
  });

  /**
 * Logs in a user.
 * 
 * @route POST /login
 * 
 * @group User - Operations to manage user authentication and data
 * 
 * @param {string} req.body.username.required - The username of the user (required)
 * @param {string} req.body.password.required - The password of the user (required)
 * 
 * @returns {Object} Returns an object with a success property indicating whether the operation was successful, and a user property containing the user data (with the password field removed).
 */
  router.post('/login', function (req, res) {
    const username = req.body.username;
    const password = req.body.password.split('#').join('$');

    if (!username || !password) {
      res.status(405).send({ success: false, message: 'Ensure username, password were provided' });
    } else {
      query = `SELECT * FROM users WHERE username = ? LIMIT 1;`;
      connection.query(query, [username], function (error, results) {
        if (results && results.length > 0) {
          const user = results[0];
          try {
            if (bcrypt.compareSync(password, user.password)) {
              user.password = '';
              res.send({ success: true, user: user });
            } else {
              res.status(406).send({ success: false, message: "INVALID PASSWORD" });
            }
          } catch (error) {
            res.status(407).send({ success: false, message: "INVALID PASSWORD" });
          }
        } else {
          res.status(408).send({ success: false, message: error || "Error" });
        }
      });
    }
  });

  return router

}
