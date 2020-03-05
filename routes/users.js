var express = require('express');
var router = express.Router();
const auth = require('../auth');
const mysqlConnection  = require('../database.js');

// GET all users-------/

router.get('/', async (req, res) => {
  mysqlConnection.query('SELECT * FROM cao_acompanhamento_sistema', (err, rows, fields) => {
    if(!err) {
      auth.returnMessage(res, 200, 'data', rows);
    } else {
      console.log(err);
      auth.returnMessage(res, 404, 'error', err);
    }
  });
});

module.exports = router;
