'use strict'

let fs = require('fs');
let Media = require('../models/topMedia.js');

let ranker = function (number) {
    if (number <= 10) {
        return 'top 10';
    } else if (number <= 30) {
        return 'top 30';
    } else if (number <= 50) {
        return 'top 50';
    } else if (number <= 100) {
        return 'top 100';
    } else if (number <= 200) {
        return 'top 200';
    } else if (number <= 300) {
        return 'top 300';
    } else if (number <= 400) {
        return 'top 400';
    } else if (number <= 500) {
        return 'top 500';
    } else if (number <= 600) {
        return 'top 600';
    } else if (number <= 700) {
        return 'top 700';
    } else if (number <= 800) {
        return 'top 800';
    } else if (number <= 900) {
        return 'top 900';
    } else if (number <= 1000) {
        return 'top 1000';
    }
}

let pageData = function (req, res) {
    fs.readFile('./data/top-media-array-12grams', 'utf-8', function (err, file) {
        if (err) {
            res.send('something went wrong.');
            return;
        }
        res.send(JSON.stringify(eval(JSON.parse(file))));
    });
}

let top1000 = function (req, res) {
    Media
        .find()
        .limit(1000)
        .exec(function (err, media) {
            let ranking = [];
            if (err) {
                console.log(err);
                res.send('something went wrong.')
                return;
            }
            for (let i = 0; i < media.length; i++) {
                if (media[i].user === req.body.username) {
                    ranking.push({
                        user: media[i].user,
                        ranking: ranker(i + 1),
                        link: media[i].link
                    })
                }
            }
            console.log('Request for ' + req.body.username + ' was received.');
            res.end(JSON.stringify(ranking))
        })
}

let requestHandlers = {
    pageData,
    top1000
}

module.exports = requestHandlers;