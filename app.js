'use strict'

let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

let routes = require('./api/routes');
let secrets = require('./secrets.json')

let app = express();
let port = process.env.PORT || 8080;

let options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

let mongodbUri = secrets.mongolab_creds;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

mongoose.connect(mongodbUri, options);
let conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function () {
    console.log('Succesfully connected to mongolabs');
    app.listen(port, function () {
        console.log('Server running on port ' + port);
    });
});






