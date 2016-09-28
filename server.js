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
  
   fs.readFile('./data/top-media-array-1000grams', 'utf-8', function (err, file) {
    if (err) {
      res.send('something went wrong.');
      return;
    }
    var top1000 = eval(JSON.parse(file)).slice(0, 1000);
    var ranking = [];
    for(var i = 0; i < top1000.length; i++){
      if (top1000[i].user === req.body.username) {
        ranking.push({
               ranking: i+1,
              link: top1000[i].link 
            })     
      }  
    }
        console.log('Request for ' + req.body.username + ' was received.');
        res.end(JSON.stringify(ranking))
  });
  
});

app.listen(8080, function () {
  console.log('Server running on port 8080.');
});