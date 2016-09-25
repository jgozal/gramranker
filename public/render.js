var fullArr;

function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}

xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "http://localhost:8080/data", false);
xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        fullArr = (eval(JSON.parse(xmlhttp.responseText)));

    }
}
xmlhttp.send();

var doc = document.getElementsByClassName('thumbnail');
fullArr.forEach(function (user, index) {
    if (user.type === "image") {
        doc[index].setAttribute('href', user.link);
        doc[index].innerHTML += '<div class="overlay"><img src=' + user.durl + 'class="img-responsive"><p class="text_overlay">By @' + user.user + '<br><span class="glyphicon">&#xe005;</span> ' + abbreviateNumber(user.likes) + '<span class="glyphicon">&#xe111;</span>' + abbreviateNumber(user.comments) + '</p></div>';
    } else if (user.type === "video") {
        doc[index].setAttribute('href', user.link);
        doc[index].innerHTML += '<div class="overlay"><video autoplay loop muted><source src=' + user.durl + ' type="video/mp4" class ="img-responsive"></video><p class="text_overlay">By @' + user.user + '<br><span class="glyphicon">&#xe005;</span> ' + abbreviateNumber(user.likes) + '<span class="glyphicon">&#xe111;</span>' + abbreviateNumber(user.comments) + '</p></div>';
    }
})