 var fs = require('fs');
 var request = require('sync-request');

// Read full array of top accounts

var topAccountsArray = JSON.parse(fs.readFileSync('top-accounts-array', 'utf8'))

// Instagram Auth

var res = request('GET', 'https://api.instagram.com/v1/users/self/media/recent/?access_token=3925985838.c880b65.5849d24775d848efabe6aa47b746d061');

var arr = (JSON.parse(res.getBody().toString()).data);

/*
arr.forEach(function(media){
    console.log(media.likes.count);
    console.log(media.comments.count)
    console.log(media.created_time)
    console.log(media.user_has_liked)
    console.log(media)
})*/
