'use strict';

var fs        = require('fs');
var path      = require('path');
var LinvoDB   = require('linvodb3');
var db;

var dbFile = __dirname + "doc";

LinvoDB.dbPath = __dirname;

exports.name = 'LinvoDB';

exports.init = function (options, callback) {
  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      db = new LinvoDB("doc",{});
	  callback();
    }
  });
};

exports.insert = function (id, entry, callback) {
  entry._id = id;
  db.insert(entry, callback);
};

exports.get = function (id, callback) {
  db.findOne({ _id: id }, callback);
};
