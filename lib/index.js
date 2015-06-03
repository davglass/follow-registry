/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License.
See LICENSE file.
*/

var follow = require('follow');
var follower;
var config = require('./config.json');
var seq = require('./seq.js');
var registry = require('./registry.js');

var change = function(err, change) {
    /*istanbul ignore next*/
    if (err) { return; }
    start.pause();
    registry.get(change, function(err, doc) {
        /*istanbul ignore next*/
        if (err) {
            //Error, resume and go on..
            return start.resume();
        }
        var info = registry.split(doc);
        info.seq = change.seq;
        config.handler(info, function() {
            seq.write(change.seq, function() {
                start.resume();
            });
        });
    });
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

var start = function(c, callback) {
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

var resume = function() {
    start.changing = false;
    follower.resume();
};
start.resume = resume;

var pause = function() {
    start.changing = true;
    follower.pause();
};

start.pause = pause;

start.changing = false;

start._follower = follower;
