const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const connection = require('../config/databaseConnection.js').createConnection();
const { getCurrentWeek } = require('../utilities/timeFrame.js');
const ticker = require('../utilities/ticker');
const upload = require('../utilities/s3Upload.js');
// const singleUpload = upload.single('image');

module.exports = function (router) {

  /**
   * Get the time frame for the application
   *
   * @route GET /get-time-frame
   * @group Time Frame - Operations to manage the time frame for the application
   *
   * @returns {Object} 200 - Returns an object containing the time frame information
   */
  router.get('/get-time-frame', function (req, res) {
    res.send(getCurrentWeek());
  });

  /**
   * Retrieve a list of games for a given season and week.
   * 
   * @route GET /get-games
   * 
   * @group Games - Operations to manage college football games
   * 
   * @param {string} req.query.season.required - The season of the games to retrieve
   * @param {string} req.query.week.required - The week of the games to retrieve
   * 
   * @returns {object} 200 - Returns an object with a success property indicating whether the operation was successful, and a games property containing an array of game objects.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while processing the search.
   */
  router.get('/get-games', function (req, res) {
    const { season, week } = req.query;
    if (!season || !week) {
      res.status(405).send({ success: false, message: 'Ensure season and week were provided' });
    } else {
      const query =
        `
      SELECT games.*, s1.school AS home_school, s1.primary_color AS h_p, s1.secondary_color AS h_s, s1.text_color AS h_t,
      s2.school AS away_school, s2.primary_color AS a_p, s2.secondary_color AS a_s, s2.text_color AS a_t
      FROM games, schools s1, schools s2
      WHERE games.home = s1.id AND games.away = s2.id AND game_week = ? AND season = ? ORDER BY games.shortDetail LIKE "CANC%" OR games.shortDetail LIKE "POST%", games.winner IS NOT NULL, games.game_date;
     `;
      connection.query(query, [week, season], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, games: results });
        }
      });
    }
  });

  /**
   * Uploads an image to an S3 bucket after verifying the user's credentials
   *
   * @route POST /s3-upload
   * @group Upload - Operations for uploading images to S3
   *
   * @param {string} req.query.user_id.required - The ID of the user performing the upload
   * @param {string} req.query.league_id.required - The ID of the league that the user belongs to
   *
   * @returns {object} 200 - Returns an object with a success property indicating whether the operation was successful.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while processing the search.
   */
   router.post('/s3-upload', function (req, res) {
    const { user_id, league_id } = req.query;
  
    if (!user_id || !league_id) {
      res.status(405).send({ success: false, message: 'Ensure user_id, league id were provided' });
    } else {
      const query = 'SELECT users.id, users.password FROM teams, users WHERE teams.league_id = ? AND teams.user_id = users.id AND users.id = ? LIMIT 1;';
      connection.query(query, [league_id, user_id], function (error, results) {
        if (results && results.length == 1) {
          upload.single('image')(req, res, function (err) {
            if (!err) {
              res.send({ success: true, message: "Photo Uploaded!", file: req.file.location || 1 });
            }
          });
        } else {
          res.status(407).send({ success: false, message: error || "INVALID CREDENTIALS" });
        }
      });
    }
  });
  
  /**
   * Get the ticker.
   *
   * @route GET /get-ticker
   * @group Ticker - Operations to manage the ticker
   *
   * @returns {Object} 200 - Returns the ticker object containing information about the latest news, scores, and events.
   */
  router.get('/get-ticker', function (req, res) {
    res.send(ticker);
  });

  /**
   * Get a list of weeks for a specific season
   * 
   * @route GET /get-season-weeks
   * 
   * @group Games - Operations to manage game schedules
   * 
   * @param {string} req.season.required - The season to get weeks for (required)
   * 
   * @returns {object} 200 - Returns an object with a success property indicating whether the operation was successful.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 500 - The server encountered an error while processing the search.
   */
  router.get('/get-season-weeks', function (req, res) {
    const season = req.query.season;

    if (!season) {
      res.status(400).send({ success: false, message: 'Please provide a season' });
    } else {
      const query = `SELECT DISTINCT game_week FROM games WHERE season = ? ORDER BY game_week DESC`;
      connection.query(query, [season], function (error, results) {
        if (error) {
          res.status(500).send({ success: false, message: 'Error retrieving weeks' });
        } else {
          res.status(200).send({ success: true, weeks: results });
        }
      });
    }
  });

  return router
}
