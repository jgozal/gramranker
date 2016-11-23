let mongoose = require('mongoose');
let secrets = require('../secrets.json');

// Connect to mongolabs host
let options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

let mongodbUri = secrets.mongolab_creds;

let mlabsConnect = function () {
    mongoose.connect(mongodbUri, options);
    let conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));
    return conn;
}

module.exports = mlabsConnect;