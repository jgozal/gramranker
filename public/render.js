var fullArr;
var ranking;

/* Get UTC hour difference between now and start of the day 

var now = new Date(),
    startOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
    unixTimestampStart = startOfDay / 1000,
    unixTimestampNow = Math.floor((new Date()).getTime() / 1000),
    diff = unixTimestampNow - unixTimestampStart,
    hours_diff = Math.round(diff/3600); 

document.getElementById('top12gram').innerHTML = '<p>Most popular posts in the past ' + hours_diff + ' hour/s</p>'
    
    */

function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b", "t"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

(function getTop12() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/data", false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            fullArr = (eval(JSON.parse(xhr.responseText)));

        }
    }
    xhr.send();
} ())

var doc = document.getElementsByClassName('flex-item-12gram');
fullArr.forEach(function (user, index) {
    if (user.type === "image") {
        doc[index].parentElement.setAttribute('href', user.link);
        doc[index].innerHTML += '<img src=' + user.durl + '><div class="overlay small"><p>By @' + user.user + '<br><span class="glyphicon">&#xe005;</span> ' + abbreviateNumber(user.likes) + '<span class="glyphicon">&#xe111;</span>' + abbreviateNumber(user.comments) + '</p></div>';
    } else if (user.type === "video") {
        doc[index].parentElement.setAttribute('href', user.link);
        doc[index].innerHTML += '<video autoplay loop muted><source src=' + user.durl + ' type="video/mp4"></video><div class="overlay small"><p>By @' + user.user + '<br><span class="glyphicon">&#xe005;</span> ' + abbreviateNumber(user.likes) + '<span class="glyphicon">&#xe111;</span>' + abbreviateNumber(user.comments) + '</p></div>';
    }
})

function getTop1000() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/top1000', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            loadTop1000(JSON.parse(xhr.responseText));
        }
    }
    xhr.send(JSON.stringify({ username: document.getElementById('username').value.toLowerCase() }));
}

var loadTop1000 = function (rankingArr) {
    //clear
    document.getElementById('results').innerHTML = '';

    if (rankingArr.length === 0 && document.getElementById('username').value != '') {
        document.getElementById('results').innerHTML = '<p>No posts from this user have made it to the top 1000 in the last 24 hours.</p>';
    } else if (rankingArr.length === 0 && document.getElementById('username').value == '') {
         document.getElementById('results').innerHTML = '<p>Please enter a username.</p>';
    } else {
        document.getElementById('results').innerHTML = '<p><b>' + rankingArr[0].user + ' has ' + rankingArr.length.toString() + ' post/s in the top 1000:</b></p><br>'
        rankingArr.forEach(function (media) {
            document.getElementById('results').innerHTML += '<p><a target="_blank" href="' + media.link + '">This</a> post has made it to the ' + media.ranking + ' so far!<br></p>';
        })
    }
}

var loadModalContent = function (modal) {
    if(modal === 'Privacy Policy') {
        
        document.getElementById('mtitle').innerHTML = 'Privacy Policy';
        
        document.getElementById('mbody').innerHTML = "<p>We collect the following information:<br><br><b>Queries:</b> gramRanks may keep track of the Instagram usernames being queried through our application. We do this to help improve our services, to provide more relevant advertising, and to be able to share aggregate statistics such as the frequency of a particular user being queried.<br><br><b>Cookies:</b> Like most apps, we use cookies and similar technologies to collect additional application usage data and to improve our application. gramRanks may use both session cookies and persistent cookies to better understand how our users interact with our application, to monitor aggregate usage by our users and traffic routing on our application, and to customize and improve our services.<br><br><b>Google Analytics:</b> we use Google Analytics to analyze traffic behavior when using our application.<br><br><b>No personal information is collected/stored/distributed through any of our services. Do not hesitate to contact us at <a href='mailto:info@gramranks.com?Subject=Privacy%20Policy' target='_top'>info@gramranks.com</a> if you have any questions.</b></p>"
        
    }else if (modal === 'FAQ'){
        
        document.getElementById('mtitle').innerHTML = 'FAQ';
        
        document.getElementById('mbody').innerHTML = "<p><b>How do you calculate popularity?</b><br><br>Simple: likes + comments.<br><br><b>Why do I get results in ranking categories such as 'top 50' or 'top 300' as opposed to getting the exact ranking position of the post?</b><br><br>Instagram is an incredibly dynamic platform. Users like and comment on posts every second of the day and we can only update our data every hour. By the time we tell you a post is ranked 351, it might actually be ranked 334, so we'd rather tell you it made it to the top 400.<br><br><b>What are the different ranking categories?</b><br><br>Top 10, top 30, top 50, top 100, top 200, top 300, top 400, top 500, top 600, top 700, top 800, top 900, and top 1000. If you get results saying that a post made it to the top 1000, you know it ranked somewhere between 900-1000.<br><br><b>Can you enable subscription services so that I can get notified whenever a user of my interest makes it to the top 1000 as opposed to checking the website periodically?</b><br><br>We can, but this takes up server resources and server resources cost money. Shoot us an email at <a href='mailto:info@gramranks.com?Subject=Subscription%20Services' target='_top'>info@gramranks.com</a> and we can chat about it if you're interested.<br><br><b>I'd like to get more data on a specific user's posts.</b><br><br>Shoot us an email at <a href='mailto:info@gramranks.com?Subject=More%20Data' target='_top'>info@gramranks.com</a>.<br><br><b>Do not hesitate to email us if you have any other inquiries.</b></p>"
    }
}



