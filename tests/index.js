var assert = require('assert'),
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
            url: 'https://replicate.npmjs.com/registry/async',
            json: true,
            headers: {
                'user-agent': 'npm-registry-follower'
            }
        });
        cb(null, null, asyncJson);
    }
};
var asyncMock = {
    queue: function(handler, concurrency) {
        assert.equal(concurrency, 100);
        return {
            handler: handler,
            push: function(change) {
                handler(change, noop);
            }
        };
    }
};

var follow;

describe('follow-registry', function(){
    before(function(){
        mockery.registerMock('follow', followMock);
        mockery.registerMock('request', requestMock);
        mockery.registerMock('async', asyncMock);
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        follow = require('../');
    });
    after(function(){
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should export one function', function(){
        assert.equal(typeof follow, 'function');
    });

    it('should start and return follower', function(done) {
        follow({handler: noop}, function(f){
            assert(f);
            done();
        });
    });

    it('should follow, returning change and not reusing pointers', function(done){
        follow({
            handler: function(json, callback) {
                assert(json);

                json.versions.forEach(function(item) {
                    var itemVersionObject = item.json;
                    var rootVersionObject = json.json.versions[itemVersionObject.version];
                    // Assert that json objects are distinct.
                    assert.notStrictEqual(itemVersionObject, rootVersionObject,
                        'Memory pointers are identical at "' + item.version + '"'
                    );
                });
                done();
            }
        });
    });
});

