/**
  * LFU cache implementation
  * Items cached in object hash, frequency managed by doubly-linked list 
  * of frequency sets.
  * Higher frequency sets are at the tail of the list, so we always
  * clean up from the head.
  */


function LFUCache(maxSize) {
	this._setup();
	this.maxSize = maxSize;
}

LFUCache.prototype = {
	put: function (key, value) {
		var node = this.cache[key];

		// If key already exists, just set its new value and get out.
		if (node) {
			node.value = value;
			return;
		}

		if (this.cacheSize === this.maxSize) {
			this._evict();
		}

        // If head frequency set is not 0 weight, we need to create
        // a new one and make it head.
        if (this.head.weight > 0) {
            var oldHead = this.head;
            this.head = new FrequencySet({
                weight: 0,
                next: oldHead
            });
            // Push the old head down the list.
            oldHead.prev = this.head;
        }

		this.head.add(key);
		this.cache[key] = {
			value: value,
			frequencySet: this.head
		};

		this.cacheSize = this.cacheSize + 1;
	},

	get: function (key) {
		var node = this.cache[key];

		if (!node) {
			return null;
		}

		var currentFrequencySet = node.frequencySet;
		var nextFrequencySet = currentFrequencySet.next;

		// If there isn't a set for the next frequency create a new one.
		if (!nextFrequencySet || nextFrequencySet.weight !== currentFrequencySet.weight + 1) {
			nextFrequencySet = new FrequencySet({
                weight: currentFrequencySet.weight + 1,
                prev: currentFrequencySet,
                next: currentFrequencySet.next
            });

			currentFrequencySet.next = nextFrequencySet;
		}

		// Now we know that a nextFrequencySet exists, remove the 
        // key from the current on and move it to the next.
		currentFrequencySet.remove(key);
		nextFrequencySet.add(key);

		// Then tell the node its new frequency set.
		node.frequencySet = nextFrequencySet;
        
        if (currentFrequencySet.isEmpty()) {
            this._removeFrequencySet(currentFrequencySet);
        }
        
		return node.value;
	},
    
    flush: function () {
        this._setup();
    },

	_setup: function () {
		this.cache = Object.create(null);
        this.head = new FrequencySet({
            weight: 0
        });
		this.cacheSize = 0;
	},

	_evict:  function () {
		var tailKey = this.head && this.head.getTail();
        
		var node = this.cache[tailKey];
		if (!node) {
			return;
		}
		delete this.cache[tailKey];
		node.frequencySet.remove(tailKey);
        if (node.frequencySet.isEmpty()) {
            this._removeFrequencySet(node.frequencySet);
        }
		this.cacheSize = this.cacheSize - 1;
    },
    
    _removeFrequencySet: function (set) {
        var nextSet = set.next;
        if (set === this.head) {
            nextSet.prev = null;
            this.head = nextSet;
        } else {
            set.prev.next = set.next;
            set.next.prev = set.prev;
        }
    }
};

function FrequencySet(opts) {
    opts = opts || {};
    this.weight = opts.weight || 0;
    this.next = opts.next || null;
    this.prev = opts.prev || null;
    
    // Keep track of the set's item recency as a linked list.
    this._items = {};
	this._head = null;
	this._tail = null;
    
    // We keep track of length, for O(1) lookup. Avoid Object.keys().
	this._length = 0;
}

FrequencySet.prototype = {
	add: function (key) {
		if (this._items[key]) {
			return;
		}

		var node = {
			next: this.head,
			prev: null,
			value: key
		};

		// If there is a head already it's now going to have a prev.
		if (this.head) {
			this.head.prev = node;
		} else {
			// If there's no head, there's no tail either.
			this.tail = node;
		}

		// New node becomes head
		this.head = node;
		this._items[key] = node;

		this._length = this._length + 1;
	},

	remove: function (key) {
		var node = this._items[key];
		if (!node) {
			return;
		}

		var prev = node.prev;
		var next = node.next;

		// Pull the node out of the list. prev -> next, next -> prev.
		// If any is missing it must be head or tail node.
		if (prev) {
			prev.next = next;
		} else {
			this.head = next;
		}
		if (next) {
			next.prev = prev;
		} else {
			this.tail = prev;
		}

		delete this._items[key];

		this._length = this._length - 1;
	},
    
    isEmpty: function () {
        return this._length < 1;
    },

	getTail: function () {
		return this.tail && this.tail.value;
	}
};

module.exports = LFUCache;