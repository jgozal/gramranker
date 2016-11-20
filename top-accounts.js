/*  The ranking on http://zymanga.com/ is most likely built by crawling on a number
 *  of random Instagram users, and counting the specific accounts they all follow. 
 *  It is all a probability game - those accounts that are followed by most of the
 *  random users are most likely in the top 5000. Although I could have built this myself,
 *  I decided not to in order to avoid making even more calls to Instagram's servers.
 *  By scraping zymanga.com, I save thousands of calls that could get me blocked.
 */

// Load packages
let request = require('request')
let cheerio = require("cheerio");
let mongoose = require("mongoose");
let secrets = require('./secrets.json')
let Accounts = require('./models/topAccounts.js');

let urlArray = [];
let urlCounter = 0;
let topAccountsArray = [];

// Connect to mongolabs

let options = {
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};

let mongodbUri = secrets.mongolab_creds;

mongoose.connect(mongodbUri, options);
let conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

let parseHtml = function (html) {
    $ = cheerio.load(html)

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
    urlCounter++; // for better control flow with promises 
};


// Run scraper for each url
let getAccounts = function () {
    return new Promise(function (resolve, reject) {
        urlArray.forEach(function (url, index) {
            request(url, function (error, res, body) {
                if (error) console.log(error);
                parseHtml(body);
                console.log(urlCounter + '%')
                if (urlCounter == 99) {
                    console.log('account import completed... saving data...');
                    resolve(topAccountsArray);
                }
            })
        })

    })
}

let importTopAccounts = function () {

    // Build urlArray   
    for (let i = 1; i < 100; i++) {
        urlArray.push('http://zymanga.com/millionplus/' + i.toString() + 'f')
    }

    // Get all accounts and save them to db

    getAccounts().then(function (topAccounts) {
        if (topAccounts.length != 0) {
            // Remove old documents in collection
            Accounts.remove({}, function(){
                console.log('removed old accounts')
            })
            // Batch insert
            Accounts.insertMany(topAccounts)
                .then(function (result) {
                    console.log('Succesfully saved ' + result.length + ' documents... closing connection...')
                    mongoose.connection.close(); // close connection
                })
                .catch(function (err) {
                    console.log('oh shit');
                    console.log(err);
                })
        }
    })
}

// once connection to db is open, start importing accounts

conn.once('open', function () {
    console.log('Succesfully connected to mongolabs');
    importTopAccounts();
});




