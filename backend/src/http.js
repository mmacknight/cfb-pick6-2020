// Import the Express.js module
const app = require('express')();

// Create an HTTP server using the built-in Node.js HTTP module
const server = require('http').createServer(app);

// Specify the port number for the server
const PORT = 8080;

// Create a route that redirects all HTTP requests to HTTPS
app.get('*', function(req, res) {
    res.redirect('https://' + req.headers.host + req.url);
});

// Start the server and listen for incoming requests
server.listen(PORT, function () {
  console.log(`HTTP redirect server running on port ${PORT}`);
});
