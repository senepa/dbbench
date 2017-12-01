//import { setImmediate } from 'timers';

var setImmediate = process.nextTick;

'use strict';

var fs = require('fs');
var path = require('path');
var Database = require('better-sqlite3');

var dbFile = path.join(__dirname, 'sqlite.db');
var db, stmt_insert, stmt_get;

var useTransactions = true;
var inTransaction = false;

const SQL_CREATE = 'CREATE TABLE tbl (id PRIMARY KEY, firstname, lastname, zipcode, city, country)';
const SQL_INSERT = 'INSERT INTO tbl VALUES (?, ?, ?, ?, ?, ?)';
const SQL_SELECT = 'SELECT * FROM tbl WHERE id = ?';
const SQL_BEGIN = 'BEGIN TRANSACTION';
const SQL_END = 'COMMIT TRANSACTION';

exports.name = 'Better SQLite3';

exports.init = function (options, callback) {
  
  if (options.hasOwnProperty('useTransactions')) useTransactions = !!options.useTransactions;

  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      try {
        db = new Database(dbFile);
        db.prepare(SQL_CREATE).run();
        stmt_insert = db.prepare(SQL_INSERT);
        stmt_get = db.prepare(SQL_SELECT);
        callback(null);
      } catch (e) {
        callback(e);
      }
    }
  });
};

exports.insert = function (id, entry, callback) {
  if(useTransactions && !inTransaction) {
    db.prepare(SQL_BEGIN).run();
    inTransaction = true;
  }


  let values = [id, entry.firstname, entry.lastname, entry.zipcode, entry.city, entry.country];
  try {
    stmt_insert.run(values);
    setImmediate(callback, null);
  } catch (e) {
    setImmediate(callback, e);
  }
};

exports.get = function (id, callback) {
  if(useTransactions && inTransaction) {
    db.prepare(SQL_END).run();
    inTransaction = false;
  }

  try {
    var row = stmt_get.get(id);
    setImmediate(callback, null, row);
  } catch (e) {
    setImmediate(callback, e);
  }
};