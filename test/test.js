'use strict';
var assert = require('assert');
var LFUCache = require('../');

describe('LFUCache', function () {

    it('should return cached value', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        assert.equal(cache.get('a'), '1');
        assert.equal(cache.get('a'), '1');
    });

    it('should not keep more than maxItems', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.put('c', '3');
        assert.equal(cache.get('a'), null);
        assert.equal(cache.get('b'), '2');
        assert.equal(cache.get('c'), '3');
    });
    
    it('should keep first value if second is never accessed', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.get('a');
        cache.put('c', '3');

        assert.equal(cache.get('a'), '1');
        assert.equal(cache.get('b'), null);
        assert.equal(cache.get('c'), '3');
    });
    
    it('should keep first value if accessed more than second', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.get('a');
        cache.get('a');
        cache.get('b');
        cache.put('c', '3');

        assert.equal(cache.get('a'), '1');
        assert.equal(cache.get('b'), null);
        assert.equal(cache.get('c'), '3');
    });
    
    it('should evict oldest if frequencies match', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.get('a'); cache.get('a');
        cache.get('b'); cache.get('b');
        cache.put('c', '3');

        assert.equal(cache.get('a'), null);
        assert.equal(cache.get('b'), '2');
        assert.equal(cache.get('c'), '3');
    });
    
    // This tests that head set is removed when it hits 0 length.
    it('should correctly evict >0 frequencies', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.get('a'); cache.get('a'); cache.get('a');
        cache.get('b'); cache.get('b');
        cache.put('c', '3'); // head frequencySet is removed.

        assert.equal(cache.get('a'), '1');
        assert.equal(cache.get('b'), null);
        assert.equal(cache.get('c'), '3');
    });
    
    // This tests that non-head set is removed when it hits 0 length.
    it('should evict LFU after oldest of equal evicted', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.get('a'); cache.get('a');
        cache.get('b'); cache.get('b');
        cache.put('c', '3');
        // Frequencies: a = 2, b =  2, c = 1
        // 'a' evicted.
        assert.equal(cache.get('a'), null);

        cache.get('b');
        cache.get('c');
        // Frequences: b = 3, c = 2
        
        cache.put('d', '4');
        // Frequencies: b = 3, c = 2, d = 1
        // 'c' evicted
        assert.equal(cache.get('c'), null);
        
        assert.equal(cache.get('a'), null);
        assert.equal(cache.get('b'), '2');
        assert.equal(cache.get('c'), null);
        assert.equal(cache.get('d'), '4');
    });
    
    it('should empty cache on flush', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.flush();
        assert.equal(cache.get('a'), null);
        assert.equal(cache.get('b'), null);
    });

    it('should be re-usable after flush', function () {
        var cache = new LFUCache(2);
        cache.put('a', '1');
        cache.put('b', '2');
        cache.flush();
        cache.put('a', '1');
        cache.put('b', '2');
        assert.equal(cache.get('a'), '1');
        assert.equal(cache.get('b'), '2');
    });

});
