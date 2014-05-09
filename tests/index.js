var vows = require('vows'),
    assert = require('assert'),
    mockery = require('mockery');

var noop = function() {};

var followMock = function(opts, change) {
    process.nextTick(function() {
        change(null, {});
    });
    return {
        pause: noop,
        resume: noop
    };
};
mockery.registerMock('follow', followMock);
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
        }
    }
};

vows.describe('follow-registry').addBatch(tests).export(module);
