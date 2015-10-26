var vows = require('vows'),
    assert = require('assert'),
    mockery = require('mockery');

var noop = function() {};

var followMock = function(opts, change) {
    process.nextTick(function() {
        change(null, {id: 'async', changes: [{rev: '806-539c2faa42188c0d254280e9afaa0c6e'}]});
    });
    return {
        pause: noop,
        resume: noop
    };
};
var asyncJson = require('./async.json');
asyncJson['dist-tags'].foobar = '100.123.456'; // bad version
var requestMock = {
    get: function(opts, cb){
        assert.deepEqual(opts, {
            url: 'https://skimdb.npmjs.com/registry/async',
            json: true,
            headers: {
                'user-agent': 'npm-registry-follower'
            }
        });
        cb(null, null, asyncJson);
    }
};
mockery.registerMock('follow', followMock);
mockery.registerMock('request', requestMock);
mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
});

var follow = require('../');

var tests = {
    'should export': {
        topic: function() {
            return follow;
        },
        'one function': function(d) {
            assert.isFunction(d);
        }
    },
    'should start': {
        topic: function() {
            var self = this;
            follow({
                handler: noop
            }, function(f) {
                self.callback(null, f);
            });
        },
        'and return follower': function(d) {
            assert.ok(d);
        }
    },
    'should follow': {
        topic: function() {
            var self = this;
            follow({
                handler: function(json, callback) {
                    callback();
                    process.nextTick(function() {
                        self.callback(null, json);
                    });
                }
            });
        },
        'and return change': function(d) {
            assert.ok(d);
        },
        'and not reuse memory pointers': function(d) {
            d.versions.forEach(function(item) {
                var itemVersionObject = item.json;
                var rootVersionObject = d.json.versions[itemVersionObject.version];
                // Assert that json objects are distinct.
                assert.isFalse(
                    itemVersionObject === rootVersionObject,
                    'Memory pointers are identical at "' + item.version + '"'
                );
            });
        }
    }
};

vows.describe('follow-registry').addBatch(tests).export(module);
