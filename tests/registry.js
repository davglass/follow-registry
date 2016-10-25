var assert = require('assert'),
    registry = require('../lib/registry');


describe('registry', function () {
    describe('split()', function () {
        it('should sanitize bad version data.', function () {
            var shelljs = require('./shelljs');

            assert.ok(shelljs.versions['0.0.1alpha1']);
            assert.ok(shelljs.versions['0.0.2pre1']);
            assert.ok(shelljs.versions['0.0.4pre1']);
            assert.ok(shelljs.versions['0.0.5pre1']);
            assert.ok(shelljs.versions['0.0.5pre2']);
            assert.ok(shelljs.versions['0.0.5pre3']);
            assert.ok(shelljs.versions['0.0.5pre4']);

            var results = registry.split(shelljs);

            assert.ok(results.json.versions['0.0.1-alpha1']);
            assert.ok(results.json.versions['0.0.2-pre1']);
            assert.ok(results.json.versions['0.0.4-pre1']);
            assert.ok(results.json.versions['0.0.5-pre1']);
            assert.ok(results.json.versions['0.0.5-pre2']);
            assert.ok(results.json.versions['0.0.5-pre3']);
            assert.ok(results.json.versions['0.0.5-pre4']);
        });
    });

    describe('get()', function () {
        it('should retrieve valid data from the default registry', function (done) {
            registry.get({id: 'async'}, function (err, json, change) {
                assert.ok(!err);
                assert.equal(json.name, 'async');
                assert.deepEqual(change, {id: 'async'});
                done();
            });
        });
    });
});

