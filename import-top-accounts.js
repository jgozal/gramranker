//Load packages

var fs = require('fs');
var request = require('sync-request');

// Reads text file with URL, gets rid of invisible characters, and converts to array
var urlArray = (fs.readFileSync('url-array', 'utf8')).replace(/\r?\n|\r/g, '').split(',');

// Array containing all account info
var topAccountsArray = [];

// Call Import.io API for every url in urlArray and push all data into topAccountsArray

urlArray.forEach(function(url) {
    var res = request('GET', 'https://api.import.io/store/connector/094ba3f9-1016-4563-b32c-8bb9186b38b0/_query?input=webpage/url:' + encodeURI(url) + '&&_apikey=eb785e83e877471b84615d76a4bed5e632ddbe443e47242a2218c2b49ce75d3fac95f4c822b930541b56c860a9374df149563e2c358927cf56cd3fadf42b152945036080719c107f7ec38ba203dcaf04');

    var topAccounts = (JSON.parse(res.getBody().toString()).results);

    topAccountsArray = topAccountsArray.concat(topAccounts.map(function(account) {
        return {
            account: account["link_2/_text"],
            followers: account["followers_number"],
            media: account["media_number"]
        };
    }))
})

console.log(topAccountsArray)
