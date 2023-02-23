const mysql = require('mysql');
const connection = require('../config/databaseConnection.js').createConnection();
const email = require('../utilities/email.js');
const { getCurrentWeek } = require('../utilities/timeFrame.js');

module.exports = function (router) {

  /**
   * Create a new league with the given name, admin ID, and info.
   *
   * @route POST /create-league
   * @group Leagues
   *
   * @param {string} req.body.name.required - The name of the new league.
   * @param {number} req.body.admin.required - The ID of the user who will be the admin of the new league.
   * @param {string} req.body.info.required - Additional information about the new league.
   *
   * @returns {object} 200 - The new league was successfully created.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while creating the league.
   */
  router.post('/create-league', (req, res) => {
    const { name, admin, info } = req.body;

    if (!name || !admin || !info) {
      res.status(400).send({ success: false, message: 'Please provide the league name, admin ID, and info.' });
      return;
    }

    const leagueQuery = `INSERT INTO leagues (name, league_admin, league_info) VALUES (?, ?, ?)`;
    const leagueValues = [name, admin, info];

    connection.query(leagueQuery, leagueValues, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: 'Unable to create league.' });
      } else {
        const queryAdmin = `INSERT INTO teams (user_id, league_id) VALUES (?, ?)`;
        const league_id = results.insertId
        const teamValues = [admin, league_id];

        connection.query(queryAdmin, teamValues, (error, results) => {
          if (error) {
            res.status(405).send({ success: false, message: 'Unable to create league admin.' });
          } else {
            res.send({ success: true, message: 'League created successfully!', league_id: league_id });
          }
        });
      }
    });
  });

  /**
   * Update a league's name and info.
   *
   * @route POST /update-league
   * @group Leagues
   *
   * @param {number} req.body.league_id.required - The ID of the league to update.
   * @param {string} req.body.name - The new name for the league.
   * @param {string} req.body.info - The new info for the league.
   *
   * @returns {object} 200 - The league was successfully updated.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while updating the league.
   */
  router.post('/update-league', (req, res) => {
    const { name, info, league_id } = req.body;

    if (!name || !league_id) {
      res.status(400).send({ success: false, message: 'Please provide the league name and ID.' });
      return;
    }

    const query = `UPDATE leagues SET name = ?, league_info = ? WHERE id = ?`;
    const values = [name, info, league_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: 'Unable to update league.' });
      } else {
        res.send({ success: true, message: 'League updated successfully!' });
      }
    });
  });

  /**
   * Add a team to a league.
   *
   * @route POST /add-team
   * @group Teams
   *
   * @param {number} req.body.user_id.required - The ID of the user to add to the league.
   * @param {number} req.body.league_id.required - The ID of the league to add the user to.
   *
   * @returns {object} 200 - The team was successfully added to the league.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while adding the team to the league.
   */
  router.post('/add-team', (req, res) => {
    const { user_id, league_id } = req.body;

    if (!user_id || !league_id) {
      res.status(400).send({ success: false, message: 'Please provide the user ID and league ID.' });
      return;
    }

    const query = `INSERT INTO teams (user_id, league_id) VALUES (?, ?)`;
    const values = [user_id, league_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: 'Unable to add team to league.' });
      } else {
        res.send({ success: true, message: 'Team added to league successfully!' });
      }
    });
  });

  /**
   * Remove a team from a league.
   *
   * @route POST /delete-team
   * @group Teams
   *
   * @param {number} req.body.user_id.required - The ID of the user whose team should be removed from the league.
   * @param {number} req.body.league_id.required - The ID of the league to remove the team from.
   *
   * @returns {object} 200 - The team was successfully removed from the league.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while removing the team from the league.
   */
  router.post('/delete-team', (req, res) => {
    const { user_id, league_id } = req.body;

    if (!user_id || !league_id) {
      res.status(400).send({ success: false, message: 'Please provide the user ID and league ID.' });
      return;
    }

    const query = `DELETE FROM teams WHERE user_id = ? AND league_id = ?`;
    const values = [user_id, league_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: 'Unable to remove team from league.' });
      } else {
        res.send({ success: true, message: 'Team removed from league successfully!' });
      }
    });
  });

  /**
   * Add an invite to a league for a specific user.
   *
   * @route POST /add-invite
   * @group Invites
   *
   * @param {string} req.body.username.required - The username of the user to invite.
   * @param {number} req.body.league_id.required - The ID of the league to invite the user to.
   * @param {string} req.body.league_admin - The username of the league administrator who is sending the invite.
   * @param {string} req.body.league_name - The name of the league the user is being invited to.
   *
   * @returns {object} 200 - The invite was successfully added to the league.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while adding the invite to the league.
   * @returns {object} 406 - The server encountered an error while looking up the user to invite.
   * @returns {object} 407 - The user is already part of the league and cannot be invited.
   * @returns {object} 408 - The server encountered an error while adding the invite to the database.
   */
  router.post('/add-invite', (req, res) => {
    const { username, league_id, league_admin, league_name } = req.body;
    const message = "Join my league";

    if (!username || !league_id) {
      res.status(400).send({ success: false, message: 'Please provide the username and league ID.' });
      return;
    }

    const checkQuery = `SELECT * FROM users WHERE users.username LIKE ? AND users.id NOT IN (SELECT user_id FROM teams WHERE teams.league_id = ?);`;
    const checkValues = [username, league_id];

    connection.query(checkQuery, checkValues, (error, results_user) => {
      if (error) {
        res.status(406).send({ success: false, message: 'Unable to add invite', error: error || 'Error' });
      } else if (!results_user || results_user.length !== 1) {
        res.status(407).send({ success: false, message: 'Player already in league' });
      } else {
        const query = `INSERT INTO invites (email, league_id) VALUES (?, ?)`;
        const values = [results_user[0]['email'], league_id];

        connection.query(query, values, (error, results) => {
          if (error) {
            res.status(408).send({ success: false, message: 'Unable to add invite', error: error || 'Error' });
          } else {
            email.sendInvite(league_name, league_admin, league_id, message, results_user[0]['email']);
            res.send({ success: true, message: 'Invite added to league successfully!' });
          }
        });
      }
    });
  });

  /**
   * Respond to an invite for a league.
   *
   * @route POST /respond-invite
   * @group Invites
   *
   * @param {number} req.body.user_id.required - The ID of the user who is responding to the invite.
   * @param {string} req.body.email.required - The email address associated with the invite.
   * @param {number} req.body.league_id.required - The ID of the league associated with the invite.
   * @param {number} req.body.status.required - The response status for the invite (0 for declined, 1 for accepted).
   *
   * @returns {object} 200 - The invite response was successfully processed.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while processing the invite response.
   * @returns {object} 406 - The server encountered an error while looking up the invite information.
   * @returns {object} 407 - No invite exists for the provided email address and league ID.
   * @returns {object} 408 - The provided status is invalid.
   * @returns {object} 409 - The server encountered an error while updating the invite information.
   */
  router.post('/respond-invite', (req, res) => {
    const { user_id, email, league_id, status } = req.body;

    if (!user_id || !email || !league_id || (status !== 0 && status !== 1)) {
      res.status(400).send({ success: false, message: 'Please provide the user ID, email, league ID, and response status.' });
      return;
    }

    const checkQuery = `SELECT * FROM invites i WHERE i.league_id = ? AND i.email = ?`;
    const checkValues = [league_id, email];

    connection.query(checkQuery, checkValues, (error, results) => {
      if (error) {
        res.status(406).send({ success: false, error: error || 'Error' });
        return;
      }
      if (!results || results.length === 0) {
        res.status(407).send({ success: false, message: 'No invite exists for this email address and league ID.' });
        return;
      }

      let query = '';
      if (status === 1) {
        query = `INSERT INTO teams (user_id, league_id) VALUES (?, ?); DELETE FROM invites WHERE email = ? AND league_id = ?`;
      } else if (status === 0) {
        query = `DELETE FROM invites WHERE email = ? AND league_id = ?`;
      } else {
        res.status(408).send({ success: false, message: 'Invalid status provided. Status must be either 0 or 1.' });
        return;
      }

      const values = [user_id, league_id, email, league_id];

      connection.query(query, values, (error, results) => {
        if (error) {
          res.status(409).send({ success: false, message: error || 'Error' });
        } else {
          res.send({ success: true, message: `Invite status changed to ${status}` });
        }
      });
    });
  });

  /**
   * Get all league invites associated with the provided email address.
   *
   * @route GET /get-invites
   * @group Invites
   *
   * @param {string} req.query.email.required - The email address associated with the invites.
   *
   * @returns {object} 200 - The list of invites was successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the list of invites.
   */
  router.get('/get-invites', (req, res) => {
    const email = req.query.email;

    if (!email) {
      res.status(400).send({ success: false, message: 'Please provide an email address to retrieve invites for.' });
      return;
    }

    const query = 'SELECT invites.*, leagues.*, users.first, users.last, users.username FROM invites, leagues, users WHERE invites.email = ? AND invites.league_id = leagues.id AND leagues.league_admin = users.id;';
    const values = [email];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(500).send({ success: false, message: error });
      } else {
        res.send({ success: true, invites: results });
      }
    });
  });


  /**
   * Get all league invites associated with the provided league ID.
   *
   * @route GET /get-league-invites
   * @group Invites
   *
   * @param {string} req.query.league_id.required - The ID of the league to retrieve invites for.
   *
   * @returns {object} 200 - The list of invites was successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the list of invites.
   */
  router.get('/get-league-invites', (req, res) => {
    const league_id = parseInt(req.query.league_id);

    if (!league_id) {
      res.status(400).send({ success: false, message: 'Please provide a league ID to retrieve invites for.' });
      return;
    }

    const query = `SELECT invites.*, users.first, users.last, users.username, users.id FROM invites LEFT JOIN users ON invites.email = users.email WHERE invites.league_id = ?;`;
    const values = [league_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(405).send({ success: false, message: error || 'Error' });
      } else {
        res.send({ success: true, invites: results });
      }
    });
  });

  /**
   * Retrieve all teams belonging to a specific user.
   *
   * @route GET /get-user-teams
   * @group Teams
   *
   * @param {number} req.query.user_id.required - The ID of the user whose teams to retrieve.
   *
   * @returns {object} 200 - The teams belonging to the specified user.
   * @returns {object} 400 - Bad request. The required user_id parameter was missing.
   * @returns {object} 405 - Internal server error. An error occurred while processing the request.
   */
  router.get('/get-user-teams', function (req, res) {
    const { user_id } = req.query;

    if (!user_id) {
      res.status(400).send({ success: false, message: 'Missing required parameter: user_id' });
    } else {
      const query = `
      SELECT * FROM teams
      JOIN (SELECT * FROM leagues LEFT JOIN draft ON leagues.id = draft.league_id) AS leagues ON leagues.id = teams.league_id
      WHERE teams.user_id = ?
    `;

      connection.query(query, [user_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, teams: results });
        }
      });
    }
  });

  /**
   * Get the teams and schools for a user by their ID.
   *
   * @route GET /get-user-teams-schools
   * @group Users
   *
   * @param {string} req.query.user_id.required - The ID of the user to retrieve the teams and schools for.
   *
   * @returns {object} 200 - The teams and schools were successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 500 - The server encountered an error while retrieving the teams and schools.
   */
  router.get('/get-user-teams-schools', function (req, res) {
    const userId = req.query.user_id;

    if (!userId) {
      res.status(400).send({ success: false, message: 'Missing required parameter: user_id' });
      return;
    }

    const query = 'SELECT * FROM teams ' +
      'INNER JOIN assignments ON teams.user_id = assignments.user_id AND teams.league_id = assignments.league_id ' +
      'INNER JOIN schools ON assignments.school_id = schools.id ' +
      'WHERE teams.user_id = ? ' +
      'ORDER BY assignments.pick';

    connection.query(query, [userId], function (error, results) {
      if (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Server encountered an error while retrieving the teams and schools.' });
      } else {
        const teams = results;
        res.send({ success: true, teams: teams });
      }
    });
  });

  /**
   * Get the stats for a user in each of their leagues.
   *
   * @route GET /get-user-league-stats
   * @group Users
   *
   * @param {string} req.query.user_id.required - The ID of the user to retrieve the league stats for.
   *
   * @returns {object} 200 - The user league stats were successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 500 - The server encountered an error while retrieving the user league stats.
   */
  router.get('/get-user-league-stats', function (req, res) {
    const user_id = req.query.user_id;

    if (!user_id) {
      res.status(400).send({ success: false, message: 'Missing required parameter: user_id' });
    } else {
      const query = `SELECT * FROM (
      SELECT teams.league_id, teams.user_id, SUM(schools.wins) AS wins,
      RANK() OVER (PARTITION BY teams.league_id ORDER BY SUM(schools.wins) DESC) AS 'rank'
      FROM teams
      JOIN assignments ON teams.user_id = assignments.user_id AND teams.league_id = assignments.league_id
      JOIN schools ON assignments.school_id = schools.id
      GROUP BY teams.league_id, teams.user_id
    ) AS S
    WHERE S.user_id = ?;`;

      connection.query(query, [user_id], function (error, results) {
        if (error) {
          res.status(500).send({ success: false, message: 'Server error while retrieving user league stats' });
        } else {
          res.send({ success: true, stats: results });
        }
      });
    }
  });

  /**
   * Get teams in a league with additional statistics.
   *
   * @route GET /get-league-teams
   * @group Leagues
   *
   * @param {string} req.query.league_id.required - The ID of the league to retrieve teams for.
   *
   * @returns {object} 200 - The league teams were successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the league teams.
   */
  router.get('/get-league-teams', function (req, res) {
    const league_id = req.query.league_id;

    if (!league_id) {
      res.status(400).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      const query = `
    SELECT *, rank() OVER (PARTITION BY r2.league_id ORDER BY r2.wins DESC) AS 'rank'
    FROM (
      SELECT r1.*, IF(r1.user_id = champions.user_id, 1, 0) AS 'is_champ' 
      FROM (
        SELECT t.*, users.id, users.username, users.first, users.last,
          (SELECT SUM(s.wins)
           FROM teams t1, schools s, assignments a
           WHERE t1.league_id = ? 
             AND t1.user_id = t.user_id 
             AND t1.user_id = a.user_id 
             AND t1.league_id = a.league_id 
             AND a.school_id = s.id) AS wins
        FROM teams t, leagues, users 
        WHERE t.league_id = ? 
          AND t.league_id = leagues.id 
          AND users.id = t.user_id
      ) r1  
      LEFT JOIN champions 
        ON r1.league_id = champions.league_id 
      ORDER BY r1.wins DESC, is_champ DESC
    ) r2;
    `;
      connection.query(query, [league_id, league_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, teams: results });
        }
      });
    }
  });

  /**
   * Retrieve all stories for a given league.
   *
   * @route GET /get-stories
   * @group Stories
   *
   * @param {string} req.query.league_id.required - The ID of the league to retrieve stories for.
   *
   * @returns {object} 200 - The stories were successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the stories.
   */
  router.get('/get-stories', function (req, res) {
    var league_id = req.query.league_id;

    if (!league_id) {
      res.status(400).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      query = `SELECT stories.*, users.first, users.last FROM stories, users WHERE stories.league_id = ? AND stories.user_id = users.id ORDER BY stories.league_week DESC, stories.post_date DESC;`;
      connection.query(query, [league_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, stories: results });
        }
      });
    }
  });

  /**
   * Get a single story for a specific week and user in a league.
   *
   * @route GET /get-story
   * @group Stories
   *
   * @param {string} req.query.league_id.required - The ID of the league the story belongs to.
   * @param {string} req.query.user_id.required - The ID of the user who wrote the story.
   * @param {string} req.query.week.required - The week number the story was written for.
   *
   * @returns {object} 200 - The requested story was successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the story.
   */
  router.get('/get-story', function (req, res) {
    const { league_id, user_id, week } = req.body;

    if (!league_id || !week || !user_id) {
      res.status(400).send({ success: false, message: 'Missing required parameter(s): league_id, user_id, or week' });
    } else {
      const query = `SELECT stories.*, users.first, users.last FROM stories JOIN users ON stories.user_id = users.id WHERE stories.league_id = ? AND stories.league_week = ? AND stories.user_id = ? LIMIT 1;`;
      const values = [league_id, week, user_id];
      connection.query(query, values, function (error, results) {
        if (error) {
          res.status(500).send({ success: false, message: error });
        } else if (results.length === 0) {
          res.status(404).send({ success: false, message: 'No story found with the provided parameters' });
        } else {
          res.send({ success: true, story: results[0] });
        }
      });
    }
  });


  /**
   * Post a story for a specific week.
   *
   * @route POST /post-story
   * @group Stories
   *
   * @param {string} req.query.league_id.required - The ID of the league to post the story for.
   * @param {string} req.query.user_id.required - The ID of the user posting the story.
   * @param {string} req.query.story.required - The text of the story to post.
   * @param {string} req.query.heading.required - The heading of the story to post.
   *
   * @returns {object} 200 - The story was successfully posted.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while posting the story.
   */
  router.post('/post-story', function (req, res) {
    const league_id = req.body.league_id;
    const user_id = req.body.user_id;
    const story = req.body.story;
    const heading = req.body.heading;
    const week = getCurrentWeek().week;

    if (!league_id || !user_id) {
      res.status(400).send({ success: false, message: 'Ensure league_id and user_id were provided' });
    } else {
      const query = `REPLACE INTO stories values (?,?,?,?,?,NOW())`;
      const params = [league_id, user_id, week, story, heading];

      connection.query(query, params, function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true });
        }
      });
    }
  });

  /**
   * Get the league information for a specific league ID.
   *
   * @route GET /get-league-info
   * @group Leagues
   *
   * @param {string} req.query.league_id.required - The ID of the league to retrieve information for.
   *
   * @returns {object} 200 - The league information was successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters or the league was not found.
   * @returns {object} 405 - The server encountered an error while retrieving the league information.
   */
  router.get('/get-league-info', function (req, res) {
    const leagueId = req.query.league_id;

    if (!leagueId) {
      res.status(400).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      const query = `SELECT leagues.*, users.first, users.last, 
      (SELECT COUNT(*) FROM teams WHERE league_id = ?) AS team_count 
      FROM (SELECT * FROM leagues LEFT JOIN draft ON leagues.id = draft.league_id) AS leagues, users 
      WHERE leagues.id = ? AND leagues.league_admin = users.id;`;
      const values = [leagueId, leagueId];

      connection.query(query, values, function (error, results) {
        if (error || results.length != 1) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, league: results[0] });
        }
      });
    }
  });

  /**
   * Get the teams and schools for a league by its ID.
   *
   * @route GET /get-league-teams-schools
   * @group Leagues
   *
   * @param {string} req.query.league_id.required - The ID of the league to retrieve the teams and schools for.
   *
   * @returns {object} 200 - The teams and schools were successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the teams and schools.
   */
  router.get('/get-league-teams-schools', function (req, res) {
    const leagueId = req.query.league_id;

    if (!leagueId) {
      return res.status(400).send({ success: false, message: 'Missing required parameter: league_id' });
    }

    const query = `SELECT * FROM teams 
                 JOIN assignments ON teams.user_id = assignments.user_id AND teams.league_id = assignments.league_id 
                 JOIN schools ON assignments.school_id = schools.id 
                 WHERE teams.league_id = ? 
                 ORDER BY assignments.pick`;

    connection.query(query, [leagueId], function (error, results) {
      if (error) {
        return res.status(405).send({ success: false, message: error || "Error" });
      }

      return res.send({ success: true, schools: results });
    });
  });

  /**
   * Retrieve information about a single team in a given league.
   *
   * @param {string} req.query.user_id - The ID of the user associated with the team.
   * @param {string} req.query.league_id - The ID of the league associated with the team.
   * @returns {object} An object containing information about the team.
   */
  router.get('/get-single-team', (req, res) => {
    const { user_id, league_id } = req.query;

    if (!user_id || !league_id) {
      res.status(400).send({ success: false, message: 'Please provide both user_id and league_id.' });
      return;
    }

    const query = `
    SELECT *
    FROM teams t
    JOIN assignments a ON t.user_id = a.user_id AND t.league_id = a.league_id
    JOIN schools s ON a.school_id = s.id
    WHERE t.user_id = ? AND t.league_id = ?
  `;
    const values = [user_id, league_id];

    connection.query(query, values, (error, results) => {
      if (error) {
        res.status(500).send({ success: false, message: error });
      } else if (results.length === 0) {
        res.status(404).send({ success: false, message: 'No team found with the provided parameters' });
      } else {
        res.send({ success: true, team: results });
      }
    });
  });

  /**
   * Get schools matching given query parameters.
   *
   * @route GET /get-schools
   * @group Schools
   *
   * @param {string} req.query.name - The name of the school.
   * @param {string} req.query.city - The city where the school is located.
   * @param {string} req.query.state - The state where the school is located.
   *
   * @returns {object} 200 - The schools matching the query parameters were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the schools.
   */
  router.get('/get-schools', function (req, res) {
    let query = 'SELECT * FROM schools WHERE 1 = 1';
    const parameters = {};

    for (const key in req.query) {
      if (key === 'name' || key === 'city' || key === 'state') {
        query += ` AND ${key} = ?`;
        parameters[key] = req.query[key];
      }
    }

    connection.query(query, parameters, function (error, results) {
      if (error) {
        res.status(405).send({ success: false, message: error || "Error" });
      } else {
        res.send({ success: true, schools: results });
      }
    });
  });

  /**
   * Get school colors, filtered by query parameters.
   *
   * @route GET /get-school-colors
   * @group Schools
   *
   * @param {string} req.query.id - Filter results by school ID.
   * @param {string} req.query.school - Filter results by school name.
   * @param {string} req.query.primary_color - Filter results by primary color.
   * @param {string} req.query.secondary_color - Filter results by secondary color.
   * @param {string} req.query.text_color - Filter results by text color.
   *
   * @returns {object} 200 - The school colors were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the school colors.
   */
  router.get('/get-school-colors', function (req, res) {
    var query = `SELECT id, school, primary_color, secondary_color, text_color FROM schools WHERE division != "FCS"`;
    var queryParams = [];

    for (var key in req.query) {
      query = `${query} AND ${key} = ?`;
      queryParams.push(req.query[key]);
    }

    connection.query(query, queryParams, function (error, results) {
      if (error) {
        res.status(405).send({ success: false, message: error || "Error" });
      }
      else {
        res.send({ success: true, schools: results });
      }
    });
  });

  /**
   * Update a user's school assignments for a given league
   * 
   * @param {string} req.query.user_id - The user's ID
   * @param {string} req.query.league_id - The league's ID
   * @param {number[]} req.query.schools - An array of school IDs to assign to the user, in order of preference
   * @returns {Object} Response object indicating success or failure
   */
   router.post('/change-schools', function (req, res) {
    const user_id = req.body.user_id;
    const league_id = req.body.league_id;
    const schools = req.body.schools;
  
    if (!user_id || !league_id || schools.length < 1) {
      res.status(400).send({ success: false, message: 'Please provide user_id, league_id, and at least one school_id.' });
      return;
    }
  
    const delete_query = `DELETE FROM assignments WHERE user_id = ? AND league_id = ?;`;
    const delete_values = [user_id, league_id];
    connection.query(delete_query, delete_values, function (error, results) {
      if (error) {
        res.status(500).send({ success: false, message: error });
        return;
      }
  
      let insert_query = `INSERT INTO assignments (user_id, league_id, school_id, pick) VALUES `;
      const insert_values = [];
  
      schools.forEach((school_id, index) => {
        insert_query += `(?, ?, ?, ?),`;
        insert_values.push(user_id, league_id, school_id, index);
      });
  
      // Remove trailing comma
      insert_query = insert_query.slice(0, -1);
  
      connection.query(insert_query, insert_values, function (error, results) {
        if (error) {
          res.status(500).send({ success: false, message: error });
          return;
        }
  
        res.send({ success: true });
      });
    });
  });
  

  /**
   * Adds a new school for a user in a given league.
   * @route POST /add-school
   * @group Assignments - Operations related to team assignments
   * @param {integer} req.body.user_id.required - The ID of the user to add the school for.
   * @param {integer} req.body.league_id.required - The ID of the league to add the school for.
   * @param {integer} req.body.school_id.required - The ID of the school to add.
   * @param {integer} req.body.pick.required - The pick number for the added school.
   * @returns {object} 200 - An object containing a success message.
   * @returns {object} 405 - An object containing a success message and an error message.
   */
  router.post('/add-school', function (req, res) {
    const { user_id, league_id, school_id, pick } = req.body;

    if (!user_id || !league_id || !school_id || !pick) {
      res.status(400).send({ success: false, message: 'Please provide user_id, league_id, school_id, and pick to add a school.' });
      return;
    }

    const query = 'INSERT INTO assignments (user_id, league_id, school_id, pick) VALUES (?, ?, ?, ?);';
    const values = [user_id, league_id, school_id, pick];

    connection.query(query, values, function (error, results) {
      if (error) {
        res.status(405).send({ success: false, message: error || "Error" });
      } else {
        res.send({ success: true, message: 'School added successfully!' });
      }
    });
  });

  /**
   * Adds a new school for a user in a given league.
   * @route POST /add-school
   * @group Assignments - Operations related to team assignments
   * @param {integer} req.body.user_id.required - The ID of the user to add the school for.
   * @param {integer} req.body.league_id.required - The ID of the league to add the school for.
   * @param {integer} req.body.school_id.required - The ID of the school to add.
   * @param {integer} req.body.pick.required - The pick number for the added school.
   * @returns {object} 200 - An object containing a success message.
   * @returns {object} 405 - An object containing a success message and an error message.
   */
  router.post('/add-school', function (req, res) {
    const { user_id, league_id, school_id, pick } = req.body;

    if (!user_id || !league_id || !school_id || !pick) {
      res.status(405).send({ success: false, message: 'Ensure user_id, league_id, school_id, pick were provided' });
    } else {
      const query = `INSERT INTO assignments (user_id, league_id, school_id, pick) VALUES (?, ?, ?, ?);`;
      const values = [user_id, league_id, school_id, pick];

      connection.query(query, values, function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, message: 'School added successfully!' });
        }
      });
    }
  });

  /**
   * Update the school assigned to a user for a particular league and pick number.
   *
   * @route POST /update-school
   * 
   * @group School - Operations to manage school assignments
   * 
   * @param {number} req.body.user_id.required - The ID of the user to update the school assignment for.
   * @param {number} req.body.league_id.required - The ID of the league to update the school assignment for.
   * @param {number} req.body.school_id.required - The ID of the new school to assign to the user.
   * @param {number} req.body.pick.required - The pick number to update the school assignment for.
   * @returns {object} 200 - Success message
   * @returns {object} 405 - Error message
   */
  router.post('/update-school', function (req, res) {
    const { user_id, league_id, school_id, pick } = req.body;

    if (!user_id || !league_id || !school_id || !pick) {
      res.status(405).send({ success: false, message: 'Ensure user_id, league_id, school_id, pick were provided' });
    } else {
      const query = 'UPDATE assignments SET school_id = ? WHERE user_id = ? AND league_id = ? AND pick = ?';
      const values = [school_id, user_id, league_id, pick];

      connection.query(query, values, function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || 'Error' });
        }
        else {
          res.send({ success: true, message: 'School added successfully!' });
        }
      });
    }
  });


  /**
   * Remove a school from a user's pick list for a specific league
   * 
   * @route POST /remove-school
   * 
   * @group School - Operations to manage school assignments
   * 
   * @param {string} req.body.user_id - The ID of the user to remove the school for (required)
   * @param {string} req.body.league_id - The ID of the league to remove the school from (required)
   * @param {string} req.body.school_id - The ID of the school to remove (required)
   * 
   * @returns {Object} Returns an object with a success property indicating whether the operation was successful, and a message property containing a success or error message.
   */
  router.post('/remove-school', function (req, res) {
    const { user_id, league_id, school_id } = req.body;

    if (!user_id || !league_id || !school_id) {
      res.status(400).send({ success: false, message: 'Missing required parameter(s): user_id, league_id, or school_id' });
      return;
    }

    const query = `DELETE FROM assignments WHERE user_id = ? AND league_id = ? AND school_id = ?`;
    const values = [user_id, league_id, school_id];

    connection.query(query, values, function (error, results) {
      if (error) {
        res.status(500).send({ success: false, message: error });
      } else if (results.affectedRows === 0) {
        res.status(404).send({ success: false, message: 'No matching record found in the database' });
      } else {
        res.send({ success: true, message: 'School removed successfully!' });
      }
    });
  });


  /**
   * Change the name of a user's team in a specific league
   * 
   * @route POST /change-squad-name
   * 
   * @group Team - Operations to manage user's teams
   * 
   * @param {string} req.body.user_id - The ID of the user whose team's name will be updated (required)
   * @param {string} req.body.league_id - The ID of the league the team is in (required)
   * @param {string} req.body.name - The new name of the team (required)
   * 
   * @returns {Object} Returns an object with a success property indicating whether the operation was successful, and a message property containing a success or error message.
   */
  router.post('/change-squad-name', function (req, res) {
    const { user_id, league_id, name } = req.body;

    if (!user_id || !league_id || !name) {
      res.status(400).send({ success: false, message: 'Please provide a user_id, league_id, and name to update.' });
      return;
    }

    const query = `UPDATE teams SET team_name = ? WHERE league_id = ? AND user_id = ?;`;
    const values = [name, league_id, user_id];

    connection.query(query, values, function (error, results) {
      if (error) {
        res.status(500).send({ success: false, message: error });
      } else {
        res.send({ success: true, message: 'Name changed successfully!' });
      }
    });
  });

  /**
   * Get the schedule of a team for a specific season
   *
   * @route GET /get-team-schedule
   *
   * @group Schedule - Operations to manage team schedules
   *
   * @param {string} req.body.school_id.required - The ID of the school for which to get the schedule
   * @param {string} req.body.season.required - The season for which to get the schedule
   *
   * @returns {Object} Returns an object with a success property indicating whether the operation was successful, and a schedule property containing an array of game information including school name, game week, and game result.
   */
  router.get('/get-team-schedule', function (req, res) {
    const { school_id, season } = req.query;

    if (!school_id || !season) {
      res.status(405).send({ success: false, message: 'Ensure school_id AND season were provided' });
    } else {
      const query =
        `SELECT school, game_week, IF(g.shortDetail LIKE "FINAL%", IF (g.winner = ?, "W", "L"), "" ) AS result
      FROM schools s, (SELECT IF(home = ?, away, home) AS school_id, game_week, shortDetail, winner FROM games WHERE (home = ? OR away = ?) AND season = ?) g WHERE s.id = g.school_id AND g.shortDetail NOT LIKE "CANC%" AND g.shortDetail NOT LIKE "POSTPONED" ORDER BY g.game_week;`;
      const values = [school_id, school_id, school_id, school_id, season];

      connection.query(query, values, function (error, results) {
        if (error) {
          res.status(406).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, schedule: results });
        }
      });
    }
  });

  /**
   * Get the champion for a specific league
   * 
   * @route GET /get-champion
   * 
   * @group Champion - Operations to fetch league champions
   * 
   * @param {string} req.query.league_id.required - The ID of the league to get the champion for
   * 
   * @returns {Object} Returns an object with a success property indicating whether the operation was successful, and a champion property containing the champion data.
   */
  router.get('/get-champion', function (req, res) {
    const league_id = req.query.league_id;

    if (!league_id) {
      res.status(400).send({ success: false, message: 'Ensure league_id was provided' });
    } else {
      const query = `SELECT * FROM champions, users WHERE champions.league_id = ? AND users.id = champions.user_id ORDER BY game_week DESC LIMIT 1;`;
      connection.query(query, [league_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, champion: results[0] });
        }
      });
    }
  });

  return router;
}
