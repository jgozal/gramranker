var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.get('/data', function (req, res) {
  fs.readFile('./data/top-media-array-12grams', 'utf-8', function (err, file) {
    if (err) {
      res.send('something went wrong.');
      return;
    }
    res.send(JSON.stringify(eval(JSON.parse(file)).slice(0, 12)));
  });
});

app.post('/top1000', function(req, res) {
    console.log('Request for ' + req.body.username + ' was received.');
    res.end(req.body.username);   
});

app.listen(8080, function () {
  console.log('Server running on port 8080.');
});