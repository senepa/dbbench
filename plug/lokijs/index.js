'use strict';

var fs        = require('fs');
var path      = require('path');
var Datastore = require('lokijs');

var dbFile    = path.join(__dirname, 'base.db');
var db;

exports.name = 'LokiJS';

exports.init = function (options, callback) {
  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      db = new Datastore(dbFile).addCollection('bench');
      callback();
    }
  });
};

exports.insert = function (id, entry, callback) {
  entry._id = id;
  db.insert(entry);
  callback();
};

exports.get = function (id, callback) {
  db.findOne({ _id: id });
  callback();
};
