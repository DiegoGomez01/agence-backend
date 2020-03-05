var express = require('express');
var router = express.Router();
const auth = require('../auth');

/* GET home page. */
router.get('/', (req, res) => {
  auth.returnMessage(res, 200, 'data', 'testData');
});

module.exports = router;
