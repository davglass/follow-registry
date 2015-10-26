/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License.
See LICENSE file.
*/

var request = require('request');
var url = require('url');
var config = require('./config.json');

var getDoc = function(change, callback, retries) {
    retries = retries || 0;
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

        callback(null, json, change);
    });
};
exports.get = getDoc;

var getRev = function(_rev) {
    return _rev.split('-')[0]
};

var splitVersions = function(json) {
    var parts = [];

    function addVersionAs(name, version) {
        var versionJson = json.versions[version];
        if (typeof versionJson === 'undefined') {
            return;
        }
        parts.push({
            version: name,
            json: JSON.parse(JSON.stringify(versionJson))
        });
    }

    if (json['dist-tags']) {
        Object.keys(json['dist-tags']).forEach(function(name) {
            var tag = json['dist-tags'][name];
            addVersionAs(name, tag);
        });
    }
    if (json.versions) {
        Object.keys(json.versions).forEach(function(name) {
            addVersionAs(name, name);
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
