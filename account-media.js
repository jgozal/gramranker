var fs = require('fs');
var request = require('sync-request');

var now = new Date(),
    startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    unixTimestamp = startOfDay / 1000;

var fullArr = [];
var finalArr = [];

// Read full array of top accounts

var topAccountsArray = JSON.parse(fs.readFileSync('./data/top-accounts-array', 'utf8'));

var getData = function (user) {
    var res = request('GET', 'https://www.instagram.com/' + user + '/media/');

    var data = (JSON.parse(res.getBody().toString()).items);

    var cleanArr = data.filter(function (media) {
        return media.created_time >= unixTimestamp;
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
        console.log(e);
        console.log(user);
    }
})

fullArr.sort(function (obj1, obj2) {
    return obj2.engagement - obj1.engagement;
});

fs.writeFile("./data/top-media-array-1000grams", JSON.stringify(fullArr));

// Second round for accuracy

fullArr.slice(0,50).map(function(media){
    return media.user;
}).filter(function(elem, index, self) {
    return index == self.indexOf(elem);
}).forEach(function (user) {
    try {
       finalArr = finalArr.concat(getData(user));
    } catch (e) {
       console.log(e);
       console.log(user);
    }
})

finalArr.sort(function (obj1, obj2) {
    return obj2.engagement - obj1.engagement;
});

fs.writeFile("./data/top-media-array-12grams", JSON.stringify(finalArr));

