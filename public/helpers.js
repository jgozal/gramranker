// Checks if user exists through a proxy since Instagram does not allow CORS
function isURLReal(fullyQualifiedURL) {
    var URL = encodeURIComponent(fullyQualifiedURL),
        dfd = $.Deferred(),
        checkURLPromise = $.getJSON('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22' + URL + '%22&format=json');

    checkURLPromise
        .done(function (response) {
            // results should be null if the page 404s or the domain doesn't work
            if (response.query.results) {
                dfd.resolve(true);
            } else {
                dfd.reject(false);
            }
        })
        .fail(function () {
            dfd.reject('failed');
        });
    return dfd.promise();
}

// Adds suffix to likes and comments
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