// Import required dependencies
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rfs = require('rotating-file-stream')
const path = require('path');
const cors = require('cors');
const csp = require('helmet-csp')

// Create Express app instance
const app = express()
const session = require('express-session')

// Set up session middleware
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // use secure cookies in production
}));

// Set up static file serving middleware
app.use(express.static(path.join(__dirname, '../www')));

// Set up JSON request parsing middleware
app.use(bodyParser.json());

// Set up CORS headers middleware
const allowedOrigins = ['*']
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
app.use(allowCrossDomain);

// Set up API routing middleware
const authRoutes = require('./routes/authRoutes')(router)

app.use('/auth', authRoutes);

const appRoutes = require('./routes/api')(router);

app.use('/api', appRoutes);

// Catch-all route for serving the index.html file
app.get('*', function (req, res) {
  try {
    res.setHeader('Content-Type', 'text/html/application-json');
    return res.sendFile(path.join(__dirname, '../www/index.html'));
  } catch {
    res.sendStatus(404);
  }
});

// Set up Content Security Policy middleware
app.use(csp({
  directives: {
    defaultSrc: ["*"],
  }
}))

// Set up helmet middleware for basic security
app.use(helmet());

// Set up CORS middleware
app.use(cors({
  origins: allowedOrigins
}));

// Set up rotating file stream for access logs
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log')
})
app.use(morgan('combined', { stream: accessLogStream }))
// app.use(morgan("dev"))

// Export the Express app instance
module.exports = {
  app: app
}
