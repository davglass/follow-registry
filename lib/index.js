/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License.
See LICENSE file.
*/

var follow = require('follow');
var async = require('async');
var follower;
var q;
var config = require('./config.json');
var seq = require('./seq.js');
var registry = require('./registry.js');

var change = function(err, change) {
    if (!err) {
       q.push(change);
    }
};

//simple config setter..
var mix = function(c) {
    c = c || {};
    Object.keys(c).forEach(function(key) {
        config[key] = c[key];
    });
    if (!config.inactivity_ms) {
        config.inactivity_ms = 1000 * 60 * 60;
    }
    if (!config.handler) {
        throw("a change handler must be provided in the config..");
    }
};

var processChange = function(change, callback) {
    registry.get(change, function(err, doc) {
        if (err) return callback()
        var info = registry.split(doc);
        info.seq = change.seq;
        config.handler(info, function() {
            seq.write(change.seq, function() {
                callback()
            });
        });
    });
};

var start = function(c, callback) {
    q = async.queue(processChange, 100);

    mix(c);
    seq.read(function(since) {
        since = c.since || since;
        var opts = {
            db: config.skim,
            since: since,
            inactivity_ms: config.inactivity_ms
        };
      follower = follow(opts, change);

        /*istanbul ignore next*/
        if (callback) {
            callback(follower);
        }
    });

};

module.exports = start;

var clear = function(callback) {
    fs.unlink(config.seqFile, callback);
};

start.clear = clear;
