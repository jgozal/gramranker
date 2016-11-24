// crontab -> 00 00 * * * node path/to/accounts-import.js

'use strict'

// Load packages
let request = require('request')
let cheerio = require("cheerio");
let mongoose = require("mongoose");

let secrets = require('../secrets.js');
let mlabsConnect = require('../api/mlabsConnect.js');

// Models
let Accounts = require('../models/topAccounts.js');

let urlCounter = 0;
let urlArray = secrets.ig_accounts;
let topAccountsArray = [];

let parseHtml = function (html) {
    let $ = cheerio.load(html)

    let accounts = [];

    // Grab account values
    $('#username a').each(function (i, elem) {
        accounts[i] = { account: $(this).text() };
    });

    // Grab follower values
    let followersCounter = 0;
    $('td').each(function (i, elem) {
        try {
            let text = $(this).text();
            if (text.includes('Followers')) {
                let value = parseInt(text.replace('Followers', '').replace(/,/g, ''))
                if (!isNaN(value)) {
                    accounts[followersCounter].followers = value;
                    followersCounter++;
                }

            }
        } catch (e) {
            console.log(e);
            accounts[followersCounter].followers = null;
            followersCounter++;
        }
    });

    // Grab media values
    let mediaCounter = 0;
    $('td').each(function (i, elem) {
        try {
            let text = $(this).text();
            if (text.includes('Media')) {
                let value = parseInt(text.replace('Media', '').replace(/,/g, ''))
                if (!isNaN(value)) {
                    accounts[mediaCounter].media = value;
                    mediaCounter++;
                }

            }
        } catch (e) {
            console.log(e);
            accounts[mediaCounter].media = null;
            mediaCounter++;
        }
    });

    accounts.join(', ');
    topAccountsArray = topAccountsArray.concat(accounts);
    urlCounter++; // for control flow with promises 
};


// Run scraper for each url
let getAccounts = function () {
    return new Promise(function (resolve, reject) {
        urlArray.forEach(function (url, index) {
            request(url, function (error, res, body) {
                if (error) console.log(error);
                parseHtml(body);
                console.log(urlCounter + '%')
                if (urlCounter == 99) { // resolve promise after 99 urls
                    console.log('account import completed... saving data...');
                    resolve(topAccountsArray);
                }
            })
        })

    })
}

let importTopAccounts = function () {

    // Get all accounts and save them to db

    getAccounts().then(function (topAccounts) {
        if (topAccounts.length != 0) {
            // drop accounts collection
            mongoose.connection.db.dropCollection('accounts', function (err, result) {
                console.log('removed old accounts')
            });
            // Batch insert
            Accounts.insertMany(topAccounts)
                .then(function (result) {
                    if (result.length != 0) {
                        console.log('Succesfully saved ' + result.length + ' documents... closing connection...')
                        mongoose.connection.close(); // close connection
                    }
                })
                .catch(function (err) {
                    console.log('oh shit');
                    console.log(err);
                })
        } else {
            console.log('hum... no data... O.o');
        }
    })
}

// once connection to db is open, start importing accounts

mlabsConnect().once('open', function () {
    console.log('Succesfully connected to mongolabs');
    importTopAccounts();
});




