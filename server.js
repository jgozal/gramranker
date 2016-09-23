var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {

  if (req.method === 'GET' && req.url === '/') {

    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('index.html', 'utf-8', function (err, file) {
      if (err) {
        res.end('something went wrong.');
        return;
      }
      res.end(file);
    });
  }

  if (req.method === 'GET' && req.url === '/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    fs.readFile('top-accounts-array', 'utf-8', function (err, file) {
      if (err) {
        res.end('something went wrong.');
        return;
      }
      res.end(JSON.stringify(file), 'utf-8');
    });
  }



}).listen(8080);
console.log("Server running on port 8080.")


