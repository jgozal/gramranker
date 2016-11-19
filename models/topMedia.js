'use strict'

let mongoose = require('mongoose');

let topMedia =  mongoose.Schema({
  userId: String,
  user: String,
  name: String,
  mediaId: String,
  link: String,
  type: String,
  durl: String,
  views: Number,
  comments: Number,
  likes: Number,
  engagement: Number
});

module.exports = mongoose.model("media", topMedia);