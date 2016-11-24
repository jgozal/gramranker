var fs = require('fs');
var request = require('sync-request');
var secrets = require('../secrets.js');

var importAccountMedia = function () {

    // start timer
    var start = new Date().getTime();

    console.log('Starting top media import.');

    // Get current UTC timestamp

    var now = new Date(),
        //startOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
        //unixTimestampStart = startOfDay / 1000,
        unixTimestampNow = Math.floor((new Date()).getTime() / 1000);

    var fullArr = [];
    var finalArr = [];

    // Read full array of top accounts

    var topAccountsArray = JSON.parse(fs.readFileSync('./data/top-accounts-array', 'utf8'));

    var getData = function (user) {
        var res = request('GET', secrets.ig_media(user), {
            'retry': true,
            'maxRetries': 5,
            'retryDelay': 1000
        });

        var data = (JSON.parse(res.getBody().toString()).items);

        //Return content posted in the past 24 hours

        var cleanArr = data.filter(function (media) {
            var diff = unixTimestampNow - media.created_time;
            var hours_diff = diff / 3600;
            return hours_diff <= 24;
        }).map(function (media) {
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
        return cleanArr;
    }

    // request

    topAccountsArray.forEach(function (user) {
        try {
            fullArr = fullArr.concat(getData(user.account));
        } catch (e) {
            console.log(e.statusCode)
            console.log(user);
        }
    })

    fullArr.sort(function (obj1, obj2) {
        return obj2.engagement - obj1.engagement;
    });

    if (fullArr.length != 0) {
        fs.writeFileSync("./data/top-media-array-1000grams", JSON.stringify(fullArr));
    }
    // Second round for accuracy

    fullArr.slice(0, 50).map(function (media) {
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

    console.log('Top media import done.');
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
}

while (true) {
    importAccountMedia();
}