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

//simple config setter..
function mix(c) {
    c = c || {};
    Object.keys(c).forEach(function(key) {
        config[key] = c[key];
    });
    if (!config.handler) {
        throw new Error("a change handler must be provided in the config..");
    }
}

function processChange(change, callback) {
    registry.get(change, function(err, doc) {
        if (err) return callback()
        var info = registry.split(doc);
        info.seq = change.seq;
        config.handler(info, function() {
            seq.write(change.seq, callback);
        });
    });
}

function start(c, callback) {
    mix(c);

    q = async.queue(processChange, config.concurrency);

    seq.read(function(since) {
        since = c.since || since;
        var opts = {
            db: config.skim,
            since: since,
            inactivity_ms: config.inactivity_ms
        };
        follower = follow(opts, function(err, change) {
            if (!err) {
                q.push(change);
            }
        });

        /*istanbul ignore next*/
        if (callback) {
            callback(follower);
        }
    });

}

module.exports = start;

function clear(callback) {
    fs.unlink(config.seqFile, callback);
}

start.clear = clear;
