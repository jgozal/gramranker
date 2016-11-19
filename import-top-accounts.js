let importTopAccounts = function () {

    // Load packages
    let fs = require('fs')
    let request = require('request')
    let cheerio = require("cheerio");

    let urlArray = [];
    let urlCounter = 0; // for better control flow with promises 
    let topAccountsArray = [];

    // Build urlArray   
    for (let i = 1; i <= 100; i++) {
        urlArray.push('http://zymanga.com/millionplus/' + i.toString() + 'f')
    }

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
                console.log(e)
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
                console.log(e)
                accounts[mediaCounter].media = null;
                mediaCounter++;
            }
        });

        accounts.join(', ');
        topAccountsArray = topAccountsArray.concat(accounts);
        urlCounter++
    };


    // Run scraper for each url
    let getAccounts = function () {
        return new Promise(function (resolve, reject) {
            urlArray.forEach(function (url, index) {
                request(url, function (error, res, body) {
                    if (error) console.log(error);
                    parseHtml(body);
                    console.log(urlCounter + '%')
                    if(urlCounter == 100) resolve(topAccountsArray);
                })
            })

        })
    }
    // Write full array of top accounts to file 

    getAccounts().then(function (topAccounts) {
        if (topAccounts.length != 0) {
            fs.writeFileSync("./data/top-accounts-array", JSON.stringify(topAccounts));
        }
    })
}

importTopAccounts();


