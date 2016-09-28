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
            ranking = JSON.parse(xhr.responseText);
        }
    }
    xhr.send(JSON.stringify({username:document.getElementById('username').value}));
}


