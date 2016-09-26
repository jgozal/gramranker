var fs = require('fs');
var path = require('path');
var express = require('express');

var app = express();

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

app.listen(8080, function () {
  console.log('Server running on port 8080.');
});