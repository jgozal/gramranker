'use strict'

let mongoose = require('mongoose');

let topAccounts =   mongoose.Schema({
  account: String,
  followers: Number,
  media: Number
});

module.exports = mongoose.model("accounts", topAccounts);