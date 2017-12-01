'use strict';

var fs = require('fs');
var path = require('path');
var Database = require('sqlite3').Database;

var dbFile = path.join(__dirname, 'sqlite.db');
var db, stmt;

var useStatements = true;

var useTransactions = true;
var inTransaction = false;

const SQL_CREATE = 'CREATE TABLE tbl (id PRIMARY KEY, firstname, lastname, zipcode, city, country)';
const SQL_INSERT = 'INSERT INTO tbl VALUES (?, ?, ?, ?, ?, ?)';
const SQL_SELECT = 'SELECT * FROM tbl WHERE id = ?';
const SQL_BEGIN = 'BEGIN TRANSACTION'
const SQL_END = 'COMMIT TRANSACTION'

exports.name = 'SQLite3';

exports.init = function (options, callback) {

  if (options.hasOwnProperty('useStatements')) useStatements = !!options.useStatements;
  if (options.hasOwnProperty('useTransactions')) useTransactions = !!options.useTransactions;

  function prepareStatement(err) {
    if (err) {
      callback(err);
      return;
    }

    stmt = db.prepare(SQL_INSERT, callback);

  }

  function setupTables(err) {
    if (err) {
      callback(err);
      return;
    }

    db.run(SQL_CREATE, useStatements ? prepareStatement : callback);
  }

  fs.unlink(dbFile, function (err) {
    if (err && err.code != 'ENOENT') {
      callback(err);
    } else {
      db = new Database(dbFile, setupTables);
    }
  });
};

function beginTransaction(id, entry, cb) {
  db.run(SQL_BEGIN, function (err) {
    if (err) {
      return cb(err);
    }

    inTransaction = true;
    insert(id, entry, cb);
  });
}

function insert(id, entry, callback) {
  if (useTransactions && !inTransaction) {
    return beginTransaction(id, entry, callback);
  }

  let values = [id, entry.firstname, entry.lastname, entry.zipcode, entry.city, entry.country];
  if (useStatements) {
    stmt.run(values, callback);
  } else {
    db.run(SQL_INSERT, values, callback);
  }
};

function endTransaction(id, cb) {
  db.run(SQL_END, function (err) {
    if (err) {
      return cb(err);
    }

    inTransaction = false;
    get(id, cb);
  });
}

function get(id, callback) {
  if (useTransactions && inTransaction) {
    return endTransaction(id, callback);
  }

  db.get(SQL_SELECT, [id], callback);
};

exports.insert = insert;
exports.get = get;