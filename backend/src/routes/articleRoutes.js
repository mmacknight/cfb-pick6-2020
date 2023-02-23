const mysql = require('mysql');
const connection = require('../config/databaseConnection.js').createConnection();
const { getCurrentWeek } = require('../utilities/timeFrame.js');

module.exports = function (router) {

  /**
   * Get an article by its ID.
   *
   * @route GET /get-article-by-id
   * @group Articles
   *
   * @param {string} req.query.article_id.required - The ID of the article to retrieve.
   *
   * @returns {object} 200 - The article was successfully retrieved.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while retrieving the article.
   */
   router.get('/get-article-by-id', function (req, res) {
    const article_id = req.query.article_id;
  
    if (!article_id) {
      res.status(400).send({ success: false, message: 'Ensure article_id was provided' });
    } else {
      const query = 'SELECT articles.*, authors.author_name, authors.author_role FROM articles, authors WHERE articles.id = ? AND articles.author_id = authors.id;';
      connection.query(query, [article_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, article: results[0] || null });
        }
      });
    }
  });
  

  /**
   * Get all articles written by a specific author, sorted by post date.
   *
   * @route GET /get-articles-by-author
   * @group Articles
   *
   * @param {string} req.query.author_id.required - The ID of the author whose articles to retrieve.
   *
   * @returns {object} 200 - The request was successful and returned a list of articles.
   * @returns {object} 400 - The request was missing required parameters.
   * @returns {object} 405 - The server encountered an error while processing the request.
   */
   router.get('/get-articles-by-author', function (req, res) {
    const author_id = req.query.author_id;
  
    if (!author_id) {
      res.status(400).send({ success: false, message: 'Ensure author_id was provided' });
    } else {
      const query = `SELECT articles.*, authors.author_name, authors.author_role FROM articles, authors WHERE articles.author_id = ? AND articles.author_id = authors.id ORDER BY articles.post_date DESC;`;
      connection.query(query, [author_id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, articles: results });
        }
      });
    }
  });
  

  /**
   * Get a list of articles for the dashboard.
   *
   * @route GET /get-articles-dashboard
   * @group Articles
   *
   * @param {number} req.query.limit - Limit the number of articles to return.
   *
   * @returns {object} 200 - The articles were successfully retrieved.
   * @returns {object} 405 - The server encountered an error while retrieving the articles.
   */
  router.get('/get-articles-dashboard', function (req, res) {
    const limit = req.query.limit || 0;

    if (isNaN(limit)) {
      res.status(405).send({ success: false, message: 'Limit must be a number' });
    } else {
      const query = `SELECT articles.id, articles.author_id, articles.title, articles.tease, articles.post_date, articles.edit_date, authors.author_name, authors.author_role FROM articles, authors WHERE articles.author_id = authors.id AND articles.visible = 1 ORDER BY articles.post_date DESC ${limit ? 'LIMIT ' + limit : ''};`;
      connection.query(query, function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        }
        else {
          res.send({ success: true, articles: results });
        }
      });
    }
  });

  /**
   * Add a new article.
   *
   * @route POST /post-article
   * @group Articles
   *
   * @param {number} req.body.author_id.required - The ID of the author who wrote the article.
   * @param {string} req.body.title.required - The title of the article.
   * @param {string} req.body.tease.required - The summary of the article.
   * @param {string} req.body.content.required - The content of the article.
   *
   * @returns {object} 200 - The article was successfully added.
   * @returns {object} 405 - The server encountered an error while adding the article.
   */
  router.post('/post-article', function (req, res) {
    const { author_id, title, tease, content } = req.body;

    if (!author_id) {
      res.status(405).send({ success: false, message: 'Ensure author_id was provided' });
    } else {
      const query = `INSERT INTO articles (author_id, title, content, post_date, edit_date, tease, game_week) VALUES (?, ?, ?, NOW(), NOW(), ?, ?)`;
      const values = [author_id, title, content, tease, getCurrentWeek().week];

      connection.query(query, values, function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, message: 'Article added successfully!' });
        }
      });
    }
  });

  /**
   * Update an article.
   *
   * @route POST /update-article
   * @group Articles
   *
   * @param {number} req.body.id.required - The id of the article to update.
   * @param {number} req.body.author_id.required - The id of the author of the article.
   * @param {string} req.body.title.required - The title of the article.
   * @param {string} req.body.tease.required - A short description or summary of the article.
   * @param {string} req.body.content.required - The full content of the article.
   *
   * @returns {object} 200 - The article was successfully updated.
   * @returns {object} 405 - The server encountered an error while updating the article.
   */
  router.post('/update-article', function (req, res) {
    const { id, author_id, title, tease, content } = req.body;

    if (!author_id || !id) {
      res.status(405).send({ success: false, message: 'Ensure author_id and id were provided' });
    } else {
      query = `UPDATE articles SET author_id = ?, title = ?, content = ?, edit_date = NOW(), tease = ? WHERE id = ?;`;
      connection.query(query, [author_id, title, content, tease, id], function (error, results) {
        if (error) {
          res.status(405).send({ success: false, message: error || "Error" });
        } else {
          res.send({ success: true, message: 'Article updated successfully!' });
        }
      });
    }
  });

  return router
}
