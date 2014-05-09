/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License.
See LICENSE file.
*/

var config = require('./config.json');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var readSeq = function(callback) {
    fs.readFile(config.seqFile, 'utf8', function(err, data) {
        var since = data || 0;
        callback(since);
    });
};

exports.read = readSeq;

var writeSeq = function(data, callback) {
    mkdirp(path.dirname(config.seqFile), function() {
        fs.writeFile(config.seqFile, data, 'utf8', callback);
    });
};

exports.write = writeSeq;
