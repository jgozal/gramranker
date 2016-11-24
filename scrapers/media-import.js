// run -> while :; do node media-import.js; sleep 60; done

'use strict'

// Load packages
let fs = require('fs');
let request = require('request')
let mongoose = require("mongoose");
let async = require('async');

let secrets = require('../secrets.js');
let mlabsConnect = require('../api/mlabsConnect.js')();

// Models
let Account = require('../models/topAccounts.js');
let Media = require('../models/topMedia.js');

// Get current UTC timestamp

let now = new Date()
let unixTimestampNow = Math.floor((new Date()).getTime() / 1000);
let accountCounter = 0;
let mediaData = [];
let retries = {}; // used to store request retries

// Read Accounts collection in db

let topAccounts = new Promise(function (resolve, reject) {
    mlabsConnect.once('open', function () {
        console.log('Succesfully connected to mongolabs: getting accounts data...');
        Account
            .find()
            .exec(function (err, accounts) {
                if (err) reject(err);
                resolve(accounts);
                console.log('closing connection...')
                mongoose.connection.close(); // close connection
            })
    });
})

// Clean response JSON

let cleanData = function (data) {
    return data
        //Return content posted in the past 24 hours
        .filter(function (media) {
            let diff = unixTimestampNow - media.created_time;
            let hours_diff = diff / 3600;
            return hours_diff <= 24;
        })
        .map(function (media) {
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

let retryRequest = function (user) {
    getData.unshift(user, function () {
        console.log(retries[user] + ': retrying ' + user);
    });
}

// Request

let getData = async.queue(function (user, progress) {

    let url = secrets.ig_media(user);

    let options = {
        url: url,
        json: true
    }

    // slow down requests to avoid getting blocked
    setTimeout(function () {
        request(options, function (error, res, body) {
            if (error) console.log(error);
            try {
                mediaData = mediaData.concat(cleanData(body.items));
            } catch (e) {
                if (res) console.log(res.statusCode)
                console.log(url)
                //console.log(e);
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
    }, 400)
}, 1)

// import all account media

let importAccountMedia = function () {
    accountCounter = 0; //reset accountCounter
    mediaData = []; //reset mediaData
    return new Promise(function (resolve, reject) {
        topAccounts
            .then(function (accounts) {
                accounts.forEach(function (user) {
                    try {
                        getData.push(user.account, function () {
                            accountCounter++
                            console.log((accountCounter / accounts.length * 100).toFixed(2) + '%')  // print progress
                            if (accountCounter == accounts.length) {
                                resolve(mediaData);
                            }
                        });
                    } catch (e) {
                        console.log(e)
                        console.log(user);
                    }
                })
            })
            .catch(function (err) {
                console.log(err);
            })
    })
}

let pageMediaImport = function (data) {
    accountCounter = 0; //reset accountCounter
    mediaData = []; //reset mediaData

    console.log('starting page media import...')

    data.slice(0, 50).map(function (media) {
        // get the top 50 posts' accounts
        return media.user;
    }).filter(function (elem, index, self) {
        //remove duplicates
        return index == self.indexOf(elem);
    }).forEach(function (user, index, array) {
        //get media data for each account
        try {
            getData.push(user, function () {
                accountCounter++
                console.log((accountCounter / array.length * 100).toFixed(2) + '%')  // print progress
                if (accountCounter == array.length) {
                    mediaData.sort(function (a, b) {
                        return b.engagement - a.engagement;
                    });

                    if (mediaData.length != 0) {
                        fs.writeFileSync("../data/top-media-array-12grams", JSON.stringify(mediaData.slice(0, 12)));
                        console.log('page media complete');
                    }
                }
            });
        } catch (e) {
            console.log(e)
            console.log(user);
        }
    })
}


// start top media import

importAccountMedia()
    .then(function (topMedia) {
        // sorting media by engagement score
        topMedia.sort(function (a, b) {
            return b.engagement - a.engagement;
        });

        if (topMedia.length != 0) {
            mlabsConnect.once('open', function () {
                console.log('Succesfully connected to mongolabs: saving media data...');

                // drop media collection
                mongoose.connection.db.dropCollection('media', function (err, result) {
                    console.log('removed old media')
                });
                // Batch insert
                Media.insertMany(topMedia)
                    .then(function (result) {
                        if (result.length != 0) {
                            console.log('Succesfully saved ' + result.length + ' documents... closing connection...')
                            mongoose.connection.close(); // close connection
                            // Second round for accuracy on front page
                            pageMediaImport(mediaData);
                        }
                    })
                    .catch(function (err) {
                        console.log('oh shit');
                        console.log(err);
                    })
            });
        } else {
            console.log('hum... no data... O.o');
        }
    })



