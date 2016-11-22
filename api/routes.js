'use strict'

let express = require('express');
let rh = require('../api/requestHandlers');
let router = express.Router();

router.get('/data', rh.pageData); // render top 12 on page load
router.post('/top1000', rh.top1000); // top 1000 ranking

module.exports = router;