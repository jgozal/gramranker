var fs = require('fs');
var request = require('sync-request');

var now = new Date();
var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
var unixTimestamp = startOfDay / 1000;

var fullArr = [];

// Read full array of top accounts

var topAccountsArray = JSON.parse(fs.readFileSync('top-accounts-array', 'utf8'))

var getData = function (user) {

    var res = request('GET', 'https://www.instagram.com/' + user.account + '/media/');

    var data = (JSON.parse(res.getBody().toString()).items);

    var cleanArr = data.filter(function (media) {
        return media.created_time >= unixTimestamp;
    }).map(function (media) {
        return {
            user: media.user.username,
            link: media.link,
            comments: media.comments.count,
            likes: media.likes.count,
            engagement: media.comments.count + media.likes.count
        }
    })

    fullArr = fullArr.concat(cleanArr);
}

// request

topAccountsArray.forEach(function (user) {
    try {
        getData(user);
    } catch (e) {
        console.log(e);
    }
})


fullArr.sort(function (obj1, obj2) {
    return obj2.engagement - obj1.engagement;
});


fs.writeFile("./top-media-array", JSON.stringify(fullArr));

