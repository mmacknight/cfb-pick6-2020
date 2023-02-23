const mysql = require('mysql');
const connection = require('../config/databaseConnection.js').createConnection();
const shuffle = require('shuffle-array');

module.exports = function (router) {

  /**
   * Get the draft and list of users in a league.
   *
   * @route GET /get-draft
   * @group Draft
   *
   * @param {number} league_id.required - The ID of the league to retrieve the draft and list of users for.
   *
   * @returns {object} 200 - The draft and list of users were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the draft and list of users.
   */
  router.get('/get-draft', function (req, res) {
    var league_id = req.query.league_id;
    if (!league_id) {
      res.status(405).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      query =
        `
      SELECT * FROM draft, leagues WHERE draft.league_id = ? AND draft.league_id = leagues.id;
      SELECT users.username, users.first, users.last, users.id FROM users, teams WHERE teams.user_id = users.id AND teams.league_id = ?;
      `;
      connection.query(query, [league_id, league_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, draft: results[0], users: results[1] });
        }
      });
    }
  });

  /**
   * Get a list of draft picks for a specific league and the number of teams in the league.
   *
   * @route GET /get-picks
   * @group Draft
   *
   * @param {number} league_id.query.required - The ID of the league to get draft picks for.
   *
   * @returns {object} 200 - The draft picks were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the draft picks.
   */
  router.get('/get-picks', function (req, res) {
    var league_id = req.query.league_id;

    if (!league_id) {
      res.status(405).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      query = `
        SELECT dp.*, s.school, u.last 
        FROM draft_picks dp, schools s, users u 
        WHERE dp.league_id = ? AND dp.school_id = s.id AND dp.user_id = u.id 
        ORDER BY dp.pick;
        SELECT COUNT(*) as teams FROM teams WHERE league_id = ?;
      `;

      connection.query(query, [league_id, league_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, picks: results[0], teams: results[1][0]['teams'] });
        }
      });
    }
  });

  /**
   * Load the draft for a specific league.
   *
   * @route POST /load-draft
   * @group Draft
   *
   * @param {number} league_id.body - The ID of the league to load the draft for.
   *
   * @returns {object} 200 - The draft was successfully loaded.
   * @returns {object} 405 - The server encountered an error while loading the draft.
   */
  router.post('/load-draft', function (req, res) {
    const league_id = req.body.league_id;

    if (!league_id) {
      res.status(405).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      const delete_query = `DELETE FROM assignments WHERE league_id = ?;`;
      connection.query(delete_query, [league_id], function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        } else {
          const select_query = `SELECT * FROM draft_picks WHERE league_id = ?;`;
          connection.query(select_query, [league_id], function (error, results_picks) {
            if (error) {
              res.status(407).send({ success: false, message: error || "Error" });
            } else {
              let insert_query = `INSERT INTO assignments (user_id, league_id, school_id, pick) VALUES `;
              const values = [];
              for (const pick of results_picks) {
                values.push([pick.user_id, pick.league_id, pick.school_id, pick.pick]);
              }
              insert_query += mysql.format("(?, ?, ?, ?)", values);
              connection.query(insert_query, function (error, results) {
                if (error) {
                  res.status(408).send({ success: false, message: error || "Error" });
                } else {
                  res.send({ success: true });
                }
              });
            }
          });
        }
      });
    }
  });

  /**
   * Create a new draft for a league.
   *
   * @route POST /create-draft
   * @group Draft
   *
   * @param {number} league_id.body.required - The ID of the league.
   *
   * @returns {object} 200 - The draft was created successfully.
   * @returns {object} 405 - The server encountered an error while creating the draft.
   */
  router.post('/create-draft', function (req, res) {
    const league_id = parseInt(req.body.league_id);
    const teams = [];

    if (!league_id) {
      res.status(405).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      const delete_query = `DELETE FROM draft WHERE league_id = ?;`;
      connection.query(delete_query, [league_id], function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        } else {
          const teams_query = `SELECT user_id FROM teams WHERE league_id = ?;`;
          connection.query(teams_query, [league_id], function (error, results) {
            if (error) {
              res.status(407).send({ success: false, message: error || "Error" });
            } else {
              for (var i in results) {
                teams.push(results[i]['user_id']);
              }
              shuffle(teams);
              const insert_query = `INSERT INTO draft (league_id, current_pick, draft_order) VALUES (?, 1, ?);`;
              connection.query(insert_query, [league_id, teams.join('-')], function (error, results) {
                if (error) {
                  res.status(408).send({ success: false, message: error || "Error" });
                } else {
                  res.send({ success: true, message: 'Draft created successfully!' });
                }
              });
            }
          });
        }
      });
    }
  });

  /**
   * Delete a draft for a given league.
   *
   * @route POST /delete-draft
   * @group Draft
   *
   * @param {integer} league_id.body.required - The ID of the league to delete the draft for.
   *
   * @returns {object} 200 - The draft was successfully deleted.
   * @returns {object} 405 - The server encountered an error while deleting the draft.
   */
  router.post('/delete-draft', function (req, res) {
    const league_id = parseInt(req.body.league_id);

    if (!league_id) {
      res.status(405).send({ success: false, message: 'Ensure league_id was provided' });
    } else {

      const delete_query = `DELETE FROM draft WHERE league_id = ?;`;
      connection.query(delete_query, [league_id], function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, message: 'Draft created successfully!' });
        }
      });
    }
  });

  /**
   * Insert two supplemental picks for a league.
   *
   * @route POST /insert-supplemental
   * @group Supplemental
   *
   * @param {number} league_id - The ID of the league.
   * @param {number} school_id[0] - The ID of the first school.
   * @param {number} school_id[1] - The ID of the second school.
   *
   * @returns {object} 200 - The supplemental picks were successfully added.
   * @returns {object} 405 - The server encountered an error while adding the supplemental picks.
   */
  router.post('/insert-supplemental', function (req, res) {
    const league_id = parseInt(req.body.league_id);
    const school_id_0 = parseInt(req.body.school_id[0]);
    const school_id_1 = parseInt(req.body.school_id[1]);

    if (!league_id || !school_id_0 || !school_id_1) {
      res.status(405).send({ success: false, message: 'Ensure league_id, school_id[0], and school_id[1] were provided' });
    } else {
      query =
        `
      INSERT INTO supplemental_reassignments VALUES (${league_id}, ${school_id_0}, NULL);
      INSERT INTO supplemental_reassignments VALUES (${league_id}, ${school_id_1}, NULL);
      `;
      connection.query(query, function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true });
        }
      });
    }
  });

  /**
   * Get the supplemental draft picks for a given league.
   *
   * @route GET /get-supplemental-picks
   * @group Draft
   *
   * @param {number} req.query.league_id - The ID of the league.
   *
   * @returns {object} 200 - The supplemental draft picks were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the supplemental draft picks.
   */
  router.get('/get-supplemental-picks', function (req, res) {
    const league_id = req.query.league_id;
    if (!league_id) {
      res.status(405).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      query =
        `
      SELECT * FROM supplemental_reassignments s, draft_picks d, schools sc WHERE sc.id = s.school_id AND s.school_id = d.school_id AND s.league_id = d.league_id AND s.league_id = ? ORDER BY d.pick;
      `;
      connection.query(query, [league_id], function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, picks: results });
        }
      });
    }
  });

  /**
   * Get all picks for a specific user in a league.
   *
   * @route GET /get-squad-picks
   * @group Draft
   *
   * @param {number} req.query.user_id.required - The ID of the user to retrieve picks for.
   * @param {number} req.query.league_id.required - The ID of the league to retrieve picks for.
   *
   * @returns {object} 200 - The picks for the user were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the picks.
   */
  router.get('/get-squad-picks', function (req, res) {
    var user_id = req.query.user_id;
    var league_id = req.query.league_id;

    if (!user_id || !league_id) {
      res.status(405).send({ success: false, message: 'Ensure user_id AND league_id were provided' });
    } else {
      query = `
      SELECT p.*, s.school, s.primary_color, s.secondary_color, s.wins, s.text_color 
      FROM draft_picks p, schools s 
      WHERE p.league_id = ? AND p.user_id = ? AND p.school_id = s.id 
      ORDER BY pick;
    `;

      connection.query(query, [league_id, user_id], function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, picks: results });
        }
      });
    }
  });

  return router
}
