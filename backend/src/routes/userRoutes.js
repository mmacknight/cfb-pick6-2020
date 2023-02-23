const mysql = require('mysql');
const bcrypt = require('bcrypt');
const connection = require('../config/databaseConnection.js').createConnection();

module.exports = function (router) {

  /**
   * Update a user's profile.
   *
   * @route POST /update-profile
   * @group Users
   *
   * @param {number} req.body.id.required - The ID of the user to update.
   * @param {string} req.body.first - The new first name for the user.
   * @param {string} req.body.last - The new last name for the user.
   * @param {string} req.body.username - The new username for the user.
   * @param {string} req.body.email - The new email address for the user.
   *
   * @returns {object} 200 - The user's profile was successfully updated.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while updating the user's profile.
   */
  router.post('/update-profile', (req, res) => {
    const { id, first, last, username, email } = req.body;

    if (!id) {
      res.status(400).send({ success: false, message: 'Please provide the user ID.' });
      return;
    }

    const query = 'UPDATE users SET first = ?, last = ?, username = ?, email = ? WHERE id = ?; SELECT * FROM users WHERE id = ?';
    const values = [first, last, username, email, id, id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: 'Unable to update profile.' });
      } else {
        res.send({ success: true, message: 'Profile updated successfully!', user: results[1][0] || null });
      }
    });
  });

  /**
   * Get the profile for a user by their ID.
   *
   * @route GET /get-profile
   * @group Users
   *
   * @param {string} req.query.user_id.required - The ID of the user to retrieve the profile for.
   *
   * @returns {object} 200 - The user profile was successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the user profile.
   */
  router.get('/get-profile', (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
      res.status(400).send({ success: false, message: 'Please provide a user ID to retrieve the profile for.' });
      return;
    }

    const query = `SELECT * FROM users WHERE teams.user_id = ?;`;
    const values = [user_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: error || 'Error' });
      } else {
        res.send({ success: true, teams: results });
      }
    });
  });

  /**
   * Search for users by username, first name, or last name, excluding those already invited or on a team in a given league.
   *
   * @route GET /search-users
   * @group Users
   *
   * @param {string} req.query.user_id.required - The ID of the current user making the request.
   * @param {string} req.query.league_id.required - The ID of the league to exclude invited and team members from.
   * @param {string} req.query.term.required - The search term to filter users by.
   *
   * @returns {object} 200 - The search was successful and returned up to 5 matching users.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while processing the search.
   */
  router.get('/search-users', function (req, res) {
    const user_id = req.query.user_id;
    const league_id = req.query.league_id;
    const term = req.query.term + '%';

    if (!term || !user_id) {
      res.status(405).send({ success: false, message: 'Ensure term and user_id were provided' });
    } else {
      const query = `SELECT users.username, users.first, users.last FROM users WHERE users.id != ? AND users.email NOT IN (SELECT email FROM invites WHERE league_id = ?) AND users.id NOT IN (SELECT user_id FROM teams WHERE league_id = ?) AND (users.username LIKE ? OR users.first LIKE ? OR users.last LIKE ? OR CONCAT(users.first, " ", users.last) LIKE ?) LIMIT 5;`;
      const values = [user_id, league_id, league_id, term, term, term, term];
      connection.query(query, values, function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send(results);
        }
      });
    }
  });

  return router

}
