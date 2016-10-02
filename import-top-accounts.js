var importTopAccounts = function () {

    // Load packages
    var fs = require('fs');
    var request = require('sync-request');
    var cheerio = require("cheerio");

    var urlArray = [];
    var topAccountsArray = [];

    // Build urlArray   
    for (var i = 1; i <= 99; i++) {
        urlArray.push('http://zymanga.com/millionplus/' + i.toString() + 'f')
    }

    // Run scraper for each url

    urlArray.forEach(function (url) {

        var parseHtml = function (html) {
            $ = cheerio.load(html)

            var accounts = [];

            // Grab account values
            $('#username a').each(function (i, elem) {
                accounts[i] = { account: $(this).text() };
            });

            /*
            // If one day all mighty Instagram grants us access to public_content permissions, we might be able to use this...
            // Grab account id
            var idCounter = 0;
            accounts.forEach(function (account) {

                try {
                    var res = request('GET', 'https://www.instagram.com/' + (account.account).toString() + '/?__a=1');
                    var id = parseInt(JSON.parse(res.getBody().toString()).user.id);
                    accounts[idCounter].id = (!isNaN(id)) ? id : null;
                    idCounter++;

                } catch (e) {
                    accounts[idCounter].id = null;
                    idCounter++;
                }

            })
            */

            // Grab follower values
            var followersCounter = 0;
            $('td').each(function (i, elem) {
                try {
                    var text = $(this).text();
                    if (text.includes('Followers')) {
                        var value = parseInt(text.replace('Followers', '').replace(/,/g, ''))
                        if (!isNaN(value)) {
                            accounts[followersCounter].followers = value;
                            followersCounter++;
                        }

                    }
                } catch (e) {
                    console.log(e)
                    accounts[followersCounter].followers = null;
                    followersCounter++;
                }
            });

            // Grab media values
            var mediaCounter = 0;
            $('td').each(function (i, elem) {
                try {
                    var text = $(this).text();
                    if (text.includes('Media')) {
                        var value = parseInt(text.replace('Media', '').replace(/,/g, ''))
                        if (!isNaN(value)) {
                            accounts[mediaCounter].media = value;
                            mediaCounter++;
                        }

                    }
                } catch (e) {
                    console.log(e)
                    accounts[mediaCounter].media = null;
                    mediaCounter++;
                }
            });

            accounts.join(', ');
            topAccountsArray = topAccountsArray.concat(accounts);
        };

        var res = request('GET', url);
        parseHtml(res.getBody());


    })

    // Write full array of top accounts to file   
    if (topAccountsArray.length != 0) {
        fs.writeFileSync("./tmp/top-accounts-array", JSON.stringify(topAccountsArray));
    }
}

importTopAccounts();


