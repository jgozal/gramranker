'use strict'

// Load packages
let fs = require('fs');
let request = require('request')
let mongoose = require("mongoose");
let async = require('async');

let secrets = require('../secrets.json')

// Models
let Account = require('../models/topAccounts.js');
let Media = require('../models/topMedia.js');

let options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

let mongodbUri = secrets.mongolab_creds;

// Get current UTC timestamp

let now = new Date()
let unixTimestampNow = Math.floor((new Date()).getTime() / 1000);
let accountCounter = 0;
let allMedia = [];
let retries = {}; // used to store request retries

// Connect to mongolabs host

let mlabsConnect = function() {
    mongoose.connect(mongodbUri, options);
    let conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));
    return conn;
}

// Read Accounts collection in db

let topAccounts = new Promise(function(resolve, reject) {
    mlabsConnect().once('open', function() {
        console.log('Succesfully connected to mongolabs: getting accounts data...');
        Account
            .find()
            .exec(function(err, accounts) {
                if (err) reject(err);
                resolve(accounts);
                console.log('closing connection...')
                mongoose.connection.close(); // close connection
            })
    });
})

// Clean response JSON

let cleanData = function(data) {
    return data
        //Return content posted in the past 24 hours
        .filter(function(media) {
            let diff = unixTimestampNow - media.created_time;
            let hours_diff = diff / 3600;
            return hours_diff <= 24;
        })
        .map(function(media) {
            return {
                userId: media.user.id,
                user: media.user.username,
                name: media.user.full_name,
                mediaId: media.id,
                link: media.link,
                type: media.type,
                durl: media.type === 'image' ? media.images.standard_resolution.url : media.videos.standard_resolution.url,
                views: media.type === 'image' ? null : media.video_views, // media.image_views does not exists
                comments: media.comments.count,
                likes: media.likes.count,
                engagement: media.comments.count + media.likes.count
            }
        })
}

// retry request by inserting the user back into the queue

let retryRequest = function(user) {
    getData.unshift(user, function() {
        console.log(retries[user] + ': retrying ' + user);
    });
}

// Request

let getData = async.queue(function(user, progress) {

    let url = 'https://www.instagram.com/' + user + '/media/';

    let options = {
        url: url,
        json: true
    }

    request(options, function(error, res, body) {
        if (error) console.log(error);
        try {
            allMedia = allMedia.concat(cleanData(body.items));
        } catch (e) {
            console.log(url)
            console.log(e);
            // retry request until it succeeds for at least 5 tries
            if (retries[user] && retries[user] < 5) {
                retries[user]++
                retryRequest(user);
            } else if (!retries[user]) {
                retries[user] = 1;
                retryRequest(user);
            }
        }
        progress();
    })
}, 5)

// import all account media

let importAccountMedia = function() {
    return new Promise(function(resolve, reject) {
        topAccounts
            .then(function(accounts) {
                accounts.forEach(function(user) {
                    try {
                        getData.push(user.account, function() {
                            accountCounter++
                            console.log((accountCounter / accounts.length * 100).toFixed(2) + '%')
                            if (accountCounter == accounts.length) {
                                resolve(allMedia);
                            }
                        });
                    } catch (e) {
                        console.log(e)
                        console.log(user);
                    }
                })
            })
            .catch(function(err) {
                console.log(err);
            })
    })

    //let finalArr = [];

    /*
    // Second round for accuracy

    allMedia.slice(0, 50).map(function (media) {
        return media.user;
    }).filter(function (elem, index, self) {
        return index == self.indexOf(elem);
    }).forEach(function (user) {
        try {
            finalArr = finalArr.concat(getData(user));
        } catch (e) {
            console.log(e.statusCode)
            console.log(user);
        }
    })

    finalArr.sort(function (obj1, obj2) {
        return obj2.engagement - obj1.engagement;
    });

    if (finalArr.length != 0) {
        fs.writeFileSync("./data/top-media-array-12grams", JSON.stringify(finalArr));
    }

    */

}

// start top media import

importAccountMedia()
    .then(function(topMedia) {
        // sorting media by engagement score
        topMedia.sort(function(a, b) {
            return b.engagement - a.engagement;
        });

        if (topMedia.length != 0) {
            mlabsConnect().once('open', function() {
                console.log('Succesfully connected to mongolabs: saving media data...');
                // Remove old documents in collection
                Media.remove({}, function() {
                    console.log('removed old media')
                })
                // Batch insert
                Media.insertMany(topMedia)
                    .then(function(result) {
                        if (result.length != 0) {
                            console.log('Succesfully saved ' + result.length + ' documents... closing connection...')
                            mongoose.connection.close(); // close connection
                        }
                    })
                    .catch(function(err) {
                        console.log('oh shit');
                        console.log(err);
                    })
            });
        }
    })




