var geolib    = require('geolib');
var _         = require("underscore");
var ProtoBuf  = require("protobufjs");
var Transit   = ProtoBuf.protoFromFile("gtfs-realtime.proto").build("transit_realtime");
var request   = require("request");

// get updates every n seconds
var UPDATE_FREQUENCY = 10;

exports.vehicles = [];
exports.trips = [];

var sync = {},
    tickCount = -1;

sync.vehicles = function() {
  request.get('http://developer.mbta.com/lib/gtrtfs/Vehicles.pb', {
    encoding: null
  }, function(e, r, b) {
    exports.vehicles = Transit.FeedMessage.decode(r.body).entity;
    console.log(exports.vehicles.length);
  });
}

sync.trips = function() {
  request.get('http://developer.mbta.com/lib/gtrtfs/Passages.pb', {
    encoding: null
  }, function(e, r, b) {
    exports.trips = Transit.FeedMessage.decode(r.body).entity;
    console.log(exports.trips.length);
  });
}

function tick() {
  var methods = Object.keys(sync);
  var method  = methods[++tickCount % methods.length];

  sync[method]();

  setTimeout(tick, 1000 * UPDATE_FREQUENCY);
}

exports.poll = function() {
  tick();
}

exports.vehicleNear = function (options) {
  //default distance from position (in miles)
  var DEFAULT_THRESHOLD = 3;

  return _.reject(exports.vehicles, function(o) {
        var distanceInMeters   = geolib.getDistance(options.position, o.vehicle.position, 1);
        var distanceInMiles    = geolib.convertUnit('mi', distanceInMeters, 2);
        return distanceInMiles > (options.threshold || DEFAULT_THRESHOLD);
      });
}
