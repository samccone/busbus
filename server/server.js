var PORT = 3000;

var express   = require("express");
var http      = require('http');
var app       = express();
var server    = http.createServer(app).listen(3000);

var garage    = require('./modules/garage.js');

app.get('/busses', function(req, res) {
  if (req.query && req.query.near) {

    var queryPosition = {
      latitude: req.query.near.split(',')[0],
      longitude: req.query.near.split(',')[1]
    }

    var results = garage.vehicleNear({
      position:  queryPosition,
      threshold: req.query.threshold
    });
  }

  res.json(results || garage.listings);
});

app.get('/trips', function(req, res) {
  res.json(garage.trips);
});

garage.poll();

console.log("BusBus server running on port " + PORT);
