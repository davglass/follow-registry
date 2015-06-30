/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License.
See LICENSE file.
*/

var request = require('request');
var url = require('url');
var config = require('./config.json');

var getDoc = function(change, callback) {
    var opt = {
        url: config.registry + change.id,
        json: true,
        headers: {
            'user-agent': config.ua
        }
    };
    request.get(opt, function(err, res, json) {
        if (err) {
            console.error(err);
            return callback(err, json, change);
        }

        // check if the rev in the json is the same or newer than change data.
        // if it's older, wait and try again in a minute.
        // if there's no json and rev # is 1, then it's a brand new package, so
        // just wait and try again.
        var retry;
        try{
            var rev = getRev(change.changes[0].rev);
            retry = json ? getRev(json._rev) < rev : rev === 1;
        } catch (e) {
            // errors happen if there's some bad json. ignore them since
            // there's nothing we can do.
            console.error(e.stack);
        }
        if (retry) {
            // wait a minute. try again.
            return setTimeout(function(){
                return getDoc(change, callback);
            }, 60000);
        }
        callback(null, json, change);
    });
};
exports.get = getDoc;

var getRev = function(_rev) {
    return _rev.split('-')[0]
};

var splitVersions = function(json) {
    var parts = [];
    if (json['dist-tags']) {
        Object.keys(json['dist-tags']).forEach(function(name) {
            var tag = json['dist-tags'][name];
            parts.push({
                version: name,
                json: json.versions[tag]
            });
        });
    }
    if (json.versions) {
        Object.keys(json.versions).forEach(function(name) {
            parts.push({
                version: name,
                json: json.versions[name]
            });
        });
    }
    return parts;
};

var splitTarballs = function(doc) {
    var balls = [];
    if (doc.versions) {
        Object.keys(doc.versions).forEach(function(v) {
            var item = doc.versions[v];
            balls.push({
                path: url.parse(item.dist.tarball).pathname,
                tarball: item.dist.tarball,
                shasum: item.dist.shasum
            });
        });
    }
    return balls;
};


var split = function(doc) {
    var versions = splitVersions(doc),
        tarballs = splitTarballs(doc);
    return {
        json: doc,
        versions: versions,
        tarballs: tarballs
    };
};

exports.split = split;
