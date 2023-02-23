require('dotenv').config()
const http = require('http');
const https = require('https');
const app = require('./app.js').app;
const { createGameUpdateTimer } = require('./utilities/timeFrame');
const createSocket = require('./socket.js');
const fs = require('fs')
const port = process.env.PORT

if (process.env.ENV == "PROD") {
  const options = {
    key: fs.readFileSync(process.env.PRIVATE_KEY_PATH),
    cert: fs.readFileSync(process.env.FULLCHAIN_KEY_PATH),
    dhparam: fs.readFileSync(process.env.DHPARAM_PATH),
  };
  app.use(function (req, res, next) {
    res.setHeader("Content-Security-Policy", "default-src * https:; img-src * https: data: ; script-src * https: 'unsafe-inline' 'unsafe-eval'; style-src * https: 'unsafe-inline' 'unsafe-eval'; connect-src * https:;");
    return next();
  });
  const server = createSocket(https.createServer(options, app));

  server.listen(port, function () {
    console.log(`PROD server running on port: ${port}`)
  })
} else {
  app.use(function (req, res, next) {
    res.setHeader("Content-Security-Policy", "default-src * https:; img-src * https: data: ; script-src * https: 'unsafe-inline' 'unsafe-eval'; style-src * https: 'unsafe-inline' 'unsafe-eval'; connect-src * https:;");
    return next();
  });
  const server = createSocket(http.createServer(app));

  server.listen(port, function () {
    console.log(`DEV server running on port: ${port}`)
  })
}
