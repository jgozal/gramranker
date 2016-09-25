var fullArr;

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
        doc[index].innerHTML += '<div class="overlay"><img src=' + user.durl + 'class="img-responsive"><p class="text_overlay">By @'+ user.user +'</p></div>';
    } else if (user.type === "video") {
        doc[index].setAttribute('href', user.link);
        doc[index].innerHTML += '<div class="overlay"><video autoplay loop muted><source src=' + user.durl + ' type="video/mp4" class ="img-responsive"></video><p class="text_overlay">By @'+ user.user +'</p></div>'
    }
})