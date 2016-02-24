#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Simple LFU cache. put and get.


## Install

```sh
$ npm install --save tiny-lfu-cache
```


## Usage

```js
var LRUCache = require('tiny-lfu-cache');

var maxSize = 100;
var cache = new LFUCache(maxSize);
cache.put('key', 'value');
cache.get('key'); // returns 'value'

cache.flush(); // Empties the cache
```

### LFU Eviction Policy

Once the cache reaches its maximum size, the least frequently used (LFU) item is removed.

If items in the cache have equal frequency of use, then the least recently used (LRU) item is evicted.

## Development

```sh
npm install
npm test
```

## License

MIT © [Andy Hume](2015)


[npm-image]: https://badge.fury.io/js/tiny-lfu-cache.svg
[npm-url]: https://npmjs.org/package/tiny-lfu-cache
[travis-image]: https://travis-ci.org/ahume/tiny-lfu-cache.svg?branch=master
[travis-url]: https://travis-ci.org/ahume/tiny-lfu-cache
[daviddm-image]: https://david-dm.org/ahume/tiny-lfu-cache.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ahume/tiny-lfu-cache
