var fullArr;
var ranking;

$(document).ready(function () {
    // get top 12 Instagram posts on page load
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

    // listen to Enter key 
    document.getElementById("username")
        .addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                document.getElementById("send").click();
            }
        });

    // decorate top Instagram posts
    var top12 = document.getElementsByClassName('flex-item-12gram');
    fullArr.forEach(function (user, index) {
        if (user.type === "image") {
            top12[index].parentElement.setAttribute('href', user.link);
            top12[index].innerHTML += '<img src=' + user.durl + '><div class="overlay small"><p>By @' + user.user + '<br><span class="glyphicon">&#xe005;</span> ' + abbreviateNumber(user.likes) + '<span class="glyphicon">&#xe111;</span>' + abbreviateNumber(user.comments) + '</p></div>';
        } else if (user.type === "video") {
            top12[index].parentElement.setAttribute('href', user.link);
            top12[index].innerHTML += '<video autoplay loop muted><source src=' + user.durl + ' type="video/mp4"></video><div class="overlay small"><p>By @' + user.user + '<br><span class="glyphicon">&#xe005;</span> ' + abbreviateNumber(user.likes) + '<span class="glyphicon">&#xe111;</span>' + abbreviateNumber(user.comments) + '</p></div>';
        }
    })
})


// check if user is in top 1000
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

// render top 1000 results for a user
var loadTop1000 = function (rankingArr) {
    //clear results
    $('#results').html('');
    var username = document.getElementById('username').value;

    //check if user exists
    isURLReal('http://www.instagram.com/' + username)
        .done(function (result) {
            console.log(result)
            // if no data
            if (rankingArr.length === 0 && username != '') {
                $('#results').fadeOut(100, function () {
                    $(this).html('<p>No posts from this user have made it to the top 1000 in the last 24 hours.</p>').fadeIn(100);
                })
            // if empty username
            } else if (rankingArr.length === 0 && username == '') {
                $('#results').fadeOut(100, function () {
                    $(this).html('<p>Please enter a username.</p>').fadeIn(100);
                })
            } else {
                $('#results').fadeOut(100, function () {
                    $(this).append('<p><b>' + rankingArr[0].user + ' has ' + rankingArr.length.toString() + ' post/s in the top 1000:</b></p><br>').fadeIn(100);


                    rankingArr.forEach(function (media) {
                        $('#results').append('<p><a target="_blank" href="' + media.link + '">This</a> post has made it to the ' + media.ranking + ' so far!<br></p>').fadeIn(100);
                    })

                    // share buttons
                    $(this).append('<ul class="share-buttons"><li><a href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.gramranker.com&t=gramRanker" title="Share on Facebook" target="_blank"><img alt="Share on Facebook" src="images/social/Facebook.svg"></a></li><li><a href="https://twitter.com/intent/tweet?source=http%3A%2F%2Fwww.gramranker.com&text=gramRanker:%20http%3A%2F%2Fwww.gramranker.com" target="_blank" title="Tweet"><img alt="Tweet" src="images/social/Twitter.svg"></a></li><li><a href="https://plus.google.com/share?url=http%3A%2F%2Fwww.gramranker.com" target="_blank" title="Share on Google+"><img alt="Share on Google+" src="images/social/Google+.svg"></a></li><li><a href="http://www.reddit.com/submit?url=http%3A%2F%2Fwww.gramranker.com&title=gramRanker" target="_blank" title="Submit to Reddit"><img alt="Submit to Reddit" src="images/social/Reddit.svg"></a></li><li><a href="mailto:?subject=gramRanker&body=Bringing%20you%20the%20most%20popular%20Instagram%20posts%20daily:%20http%3A%2F%2Fwww.gramranker.com" target="_blank" title="Send email"><img alt="Send email" src="images/social/Email.svg"></a></li></ul>').fadeIn(100);

                })
            }
        })
        .fail(function (result) {
            console.log(result)
            $('#results').fadeOut(100, function () {
                $(this).html("<p>Seems like that particular username doesn't exist. Check your spelling and make sure you aren't including an '@' in the username!<br><br>Example: 9gag, not @9gag. </p>").fadeIn(100);
            })
        });

}

// FAQ and Privacy Policy modals
var loadModalContent = function (modal) {
    if (modal === 'Privacy Policy') {

        document.getElementById('mtitle').innerHTML = 'Privacy Policy';

        document.getElementById('mbody').innerHTML = "<p>We collect the following information:<br><br><b>Queries:</b> gramRanker may keep track of the Instagram usernames being queried through our application. We do this to help improve our services, to provide more relevant advertising, and to be able to share aggregate statistics such as the frequency of a particular user being queried.<br><br><b>Cookies:</b> Like most apps, we use cookies and similar technologies to collect additional application usage data and to improve our application. gramRanker may use both session cookies and persistent cookies to better understand how our users interact with our application, to monitor aggregate usage by our users and traffic routing on our application, and to customize and improve our services.<br><br><b>Google Analytics:</b> we use Google Analytics to analyze traffic behavior when using our application.<br><br><b>No personal information is collected/stored/distributed through any of our services. Do not hesitate to contact us at <a href='mailto:info@gramranker.com?Subject=Privacy%20Policy' target='_top'>info@gramranker.com</a> if you have any questions.</b></p>"

    } else if (modal === 'FAQ') {

        document.getElementById('mtitle').innerHTML = 'FAQ';

        document.getElementById('mbody').innerHTML = "<p><b>How do you calculate popularity?</b><br><br>Simple: likes + comments.<br><br><b>How often do you update your data?</b><br><br>As the website says, 'every day, every hour.' Although the more correct answer is 'approximately every hour.' Sometimes a little less, sometimes a little more, depending on how much media is out there.<br><br><b>Why do I get results in ranking categories such as 'top 50' or 'top 300' as opposed to getting the exact ranking position of the post?</b><br><br>Instagram is an incredibly dynamic platform. Users like and comment on posts every second of the day and we can only update our data every hour. By the time we tell you a post is ranked 351, it might actually be ranked 334, so we'd rather tell you it made it to the top 400.<br><br><b>What are the different ranking categories?</b><br><br>Top 10, top 30, top 50, top 100, top 200, top 300, top 400, top 500, top 600, top 700, top 800, top 900, and top 1000. If you get results saying that a post made it to the top 1000, you know it ranked somewhere between 900-1000.<br><br><b>Can you enable subscription services so that I can get notified whenever a user of my interest makes it to the top 1000 as opposed to checking the website periodically?</b><br><br>We can, but this takes up server resources and server resources cost money. Shoot us an email at <a href='mailto:info@gramranker.com?Subject=Subscription%20Services' target='_top'>info@gramranker.com</a> and we can chat about it if you're interested.<br><br><b>I'd like to get more data on a specific user's posts.</b><br><br>Shoot us an email at <a href='mailto:info@gramranker.com?Subject=More%20Data' target='_top'>info@gramranker.com</a>.<br><br><b>Do not hesitate to email us if you have any other inquiries.</b></p>"
    }
}



