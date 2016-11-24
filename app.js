'use strict'

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let routes = require('./api/routes');
let mlabsConnect = require('./api/mlabsConnect.js');

let app = express();
let port = process.env.PORT || 8080;

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

mlabsConnect().once('open', function () {
    console.log('Succesfully connected to mongolabs');
    app.listen(port, function () {
        console.log('Server running on port ' + port);
    });
});






