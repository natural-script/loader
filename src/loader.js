// Rusha JS

(function () {
	var util = {
		getDataType: function (data) {
			if (typeof data === 'string') {
				return 'string';
			}
			if (data instanceof Array) {
				return 'array';
			}
			if (typeof global !== 'undefined' && global.Buffer && global.Buffer.isBuffer(data)) {
				return 'buffer';
			}
			if (data instanceof ArrayBuffer) {
				return 'arraybuffer';
			}
			if (data.buffer instanceof ArrayBuffer) {
				return 'view';
			}
			if (data instanceof Blob) {
				return 'blob';
			}
			throw new Error('Unsupported data type.');
		}
	};

	function Rusha(chunkSize) {
		'use strict';
		var // Private object structure.
			self$2 = {
				fill: 0
			};
		var // Calculate the length of buffer that the sha1 routine uses
			// including the padding.
			padlen = function (len) {
				for (len += 9; len % 64 > 0; len += 1);
				return len;
			};
		var padZeroes = function (bin, len) {
			var h8 = new Uint8Array(bin.buffer);
			var om = len % 4,
				align = len - om;
			switch (om) {
				case 0:
					h8[align + 3] = 0;
				case 1:
					h8[align + 2] = 0;
				case 2:
					h8[align + 1] = 0;
				case 3:
					h8[align + 0] = 0;
			}
			for (var i$2 = (len >> 2) + 1; i$2 < bin.length; i$2++) bin[i$2] = 0;
		};
		var padData = function (bin, chunkLen, msgLen) {
			bin[chunkLen >> 2] |= 128 << 24 - (chunkLen % 4 << 3);
			// To support msgLen >= 2 GiB, use a float division when computing the
			// high 32-bits of the big-endian message length in bits.
			bin[((chunkLen >> 2) + 2 & ~15) + 14] = msgLen / (1 << 29) | 0;
			bin[((chunkLen >> 2) + 2 & ~15) + 15] = msgLen << 3;
		};
		var // Convert a binary string and write it to the heap.
			// A binary string is expected to only contain char codes < 256.
			convStr = function (H8, H32, start, len, off) {
				var str = this,
					i$2, om = off % 4,
					lm = (len + om) % 4,
					j = len - lm;
				switch (om) {
					case 0:
						H8[off] = str.charCodeAt(start + 3);
					case 1:
						H8[off + 1 - (om << 1) | 0] = str.charCodeAt(start + 2);
					case 2:
						H8[off + 2 - (om << 1) | 0] = str.charCodeAt(start + 1);
					case 3:
						H8[off + 3 - (om << 1) | 0] = str.charCodeAt(start);
				}
				if (len < lm + om) {
					return;
				}
				for (i$2 = 4 - om; i$2 < j; i$2 = i$2 + 4 | 0) {
					H32[off + i$2 >> 2] = str.charCodeAt(start + i$2) << 24 | str.charCodeAt(start + i$2 + 1) << 16 | str.charCodeAt(start + i$2 + 2) << 8 | str.charCodeAt(start + i$2 + 3);
				}
				switch (lm) {
					case 3:
						H8[off + j + 1 | 0] = str.charCodeAt(start + j + 2);
					case 2:
						H8[off + j + 2 | 0] = str.charCodeAt(start + j + 1);
					case 1:
						H8[off + j + 3 | 0] = str.charCodeAt(start + j);
				}
			};
		var // Convert a buffer or array and write it to the heap.
			// The buffer or array is expected to only contain elements < 256.
			convBuf = function (H8, H32, start, len, off) {
				var buf = this,
					i$2, om = off % 4,
					lm = (len + om) % 4,
					j = len - lm;
				switch (om) {
					case 0:
						H8[off] = buf[start + 3];
					case 1:
						H8[off + 1 - (om << 1) | 0] = buf[start + 2];
					case 2:
						H8[off + 2 - (om << 1) | 0] = buf[start + 1];
					case 3:
						H8[off + 3 - (om << 1) | 0] = buf[start];
				}
				if (len < lm + om) {
					return;
				}
				for (i$2 = 4 - om; i$2 < j; i$2 = i$2 + 4 | 0) {
					H32[off + i$2 >> 2 | 0] = buf[start + i$2] << 24 | buf[start + i$2 + 1] << 16 | buf[start + i$2 + 2] << 8 | buf[start + i$2 + 3];
				}
				switch (lm) {
					case 3:
						H8[off + j + 1 | 0] = buf[start + j + 2];
					case 2:
						H8[off + j + 2 | 0] = buf[start + j + 1];
					case 1:
						H8[off + j + 3 | 0] = buf[start + j];
				}
			};
		var convBlob = function (H8, H32, start, len, off) {
			var blob = this,
				i$2, om = off % 4,
				lm = (len + om) % 4,
				j = len - lm;
			var buf = new Uint8Array(reader.readAsArrayBuffer(blob.slice(start, start + len)));
			switch (om) {
				case 0:
					H8[off] = buf[3];
				case 1:
					H8[off + 1 - (om << 1) | 0] = buf[2];
				case 2:
					H8[off + 2 - (om << 1) | 0] = buf[1];
				case 3:
					H8[off + 3 - (om << 1) | 0] = buf[0];
			}
			if (len < lm + om) {
				return;
			}
			for (i$2 = 4 - om; i$2 < j; i$2 = i$2 + 4 | 0) {
				H32[off + i$2 >> 2 | 0] = buf[i$2] << 24 | buf[i$2 + 1] << 16 | buf[i$2 + 2] << 8 | buf[i$2 + 3];
			}
			switch (lm) {
				case 3:
					H8[off + j + 1 | 0] = buf[j + 2];
				case 2:
					H8[off + j + 2 | 0] = buf[j + 1];
				case 1:
					H8[off + j + 3 | 0] = buf[j];
			}
		};
		var convFn = function (data) {
			switch (util.getDataType(data)) {
				case 'string':
					return convStr.bind(data);
				case 'array':
					return convBuf.bind(data);
				case 'buffer':
					return convBuf.bind(data);
				case 'arraybuffer':
					return convBuf.bind(new Uint8Array(data));
				case 'view':
					return convBuf.bind(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
				case 'blob':
					return convBlob.bind(data);
			}
		};
		var slice = function (data, offset) {
			switch (util.getDataType(data)) {
				case 'string':
					return data.slice(offset);
				case 'array':
					return data.slice(offset);
				case 'buffer':
					return data.slice(offset);
				case 'arraybuffer':
					return data.slice(offset);
				case 'view':
					return data.buffer.slice(offset);
			}
		};
		var // Precompute 00 - ff strings
			precomputedHex = new Array(256);
		for (var i = 0; i < 256; i++) {
			precomputedHex[i] = (i < 16 ? '0' : '') + i.toString(16);
		}
		var // Convert an ArrayBuffer into its hexadecimal string representation.
			hex = function (arrayBuffer) {
				var binarray = new Uint8Array(arrayBuffer);
				var res = new Array(arrayBuffer.byteLength);
				for (var i$2 = 0; i$2 < res.length; i$2++) {
					res[i$2] = precomputedHex[binarray[i$2]];
				}
				return res.join('');
			};
		var ceilHeapSize = function (v) {
			// The asm.js spec says:
			// The heap object's byteLength must be either
			// 2^n for n in [12, 24) or 2^24 * n for n ≥ 1.
			// Also, byteLengths smaller than 2^16 are deprecated.
			var p;
			if ( // If v is smaller than 2^16, the smallest possible solution
				// is 2^16.
				v <= 65536) return 65536;
			if ( // If v < 2^24, we round up to 2^n,
				// otherwise we round up to 2^24 * n.
				v < 16777216) {
				for (p = 1; p < v; p = p << 1);
			} else {
				for (p = 16777216; p < v; p += 16777216);
			}
			return p;
		};
		var // Initialize the internal data structures to a new capacity.
			init = function (size) {
				if (size % 64 > 0) {
					throw new Error('Chunk size must be a multiple of 128 bit');
				}
				self$2.offset = 0;
				self$2.maxChunkLen = size;
				self$2.padMaxChunkLen = padlen(size);
				// The size of the heap is the sum of:
				// 1. The padded input message size
				// 2. The extended space the algorithm needs (320 byte)
				// 3. The 160 bit state the algoritm uses
				self$2.heap = new ArrayBuffer(ceilHeapSize(self$2.padMaxChunkLen + 320 + 20));
				self$2.h32 = new Int32Array(self$2.heap);
				self$2.h8 = new Int8Array(self$2.heap);
				self$2.core = new Rusha._core({
					Int32Array: Int32Array,
					DataView: DataView
				}, {}, self$2.heap);
				self$2.buffer = null;
			};
		// Iinitializethe datastructures according
		// to a chunk siyze.
		init(chunkSize || 64 * 1024);
		var initState = function (heap, padMsgLen) {
			self$2.offset = 0;
			var io = new Int32Array(heap, padMsgLen + 320, 5);
			io[0] = 1732584193;
			io[1] = -271733879;
			io[2] = -1732584194;
			io[3] = 271733878;
			io[4] = -1009589776;
		};
		var padChunk = function (chunkLen, msgLen) {
			var padChunkLen = padlen(chunkLen);
			var view = new Int32Array(self$2.heap, 0, padChunkLen >> 2);
			padZeroes(view, chunkLen);
			padData(view, chunkLen, msgLen);
			return padChunkLen;
		};
		var // Write data to the heap.
			write = function (data, chunkOffset, chunkLen, off) {
				convFn(data)(self$2.h8, self$2.h32, chunkOffset, chunkLen, off || 0);
			};
		var // Initialize and call the RushaCore,
			// assuming an input buffer of length len * 4.
			coreCall = function (data, chunkOffset, chunkLen, msgLen, finalize) {
				var padChunkLen = chunkLen;
				write(data, chunkOffset, chunkLen);
				if (finalize) {
					padChunkLen = padChunk(chunkLen, msgLen);
				}
				self$2.core.hash(padChunkLen, self$2.padMaxChunkLen);
			};
		var getRawDigest = function (heap, padMaxChunkLen) {
			var io = new Int32Array(heap, padMaxChunkLen + 320, 5);
			var out = new Int32Array(5);
			var arr = new DataView(out.buffer);
			arr.setInt32(0, io[0], false);
			arr.setInt32(4, io[1], false);
			arr.setInt32(8, io[2], false);
			arr.setInt32(12, io[3], false);
			arr.setInt32(16, io[4], false);
			return out;
		};
		var // Calculate the hash digest as an array of 5 32bit integers.
			rawDigest = this.rawDigest = function (str) {
				var msgLen = str.byteLength || str.length || str.size || 0;
				initState(self$2.heap, self$2.padMaxChunkLen);
				var chunkOffset = 0,
					chunkLen = self$2.maxChunkLen;
				for (chunkOffset = 0; msgLen > chunkOffset + chunkLen; chunkOffset += chunkLen) {
					coreCall(str, chunkOffset, chunkLen, msgLen, false);
				}
				coreCall(str, chunkOffset, msgLen - chunkOffset, msgLen, true);
				return getRawDigest(self$2.heap, self$2.padMaxChunkLen);
			};
		// The digest and digestFrom* interface returns the hash digest
		// as a hex string.
		this.digest = this.digestFromString = this.digestFromBuffer = this.digestFromArrayBuffer = function (str) {
			return hex(rawDigest(str).buffer);
		};
		this.resetState = function () {
			initState(self$2.heap, self$2.padMaxChunkLen);
			return this;
		};
		this.append = function (chunk) {
			var chunkOffset = 0;
			var chunkLen = chunk.byteLength || chunk.length || chunk.size || 0;
			var turnOffset = self$2.offset % self$2.maxChunkLen;
			var inputLen;
			self$2.offset += chunkLen;
			while (chunkOffset < chunkLen) {
				inputLen = Math.min(chunkLen - chunkOffset, self$2.maxChunkLen - turnOffset);
				write(chunk, chunkOffset, inputLen, turnOffset);
				turnOffset += inputLen;
				chunkOffset += inputLen;
				if (turnOffset === self$2.maxChunkLen) {
					self$2.core.hash(self$2.maxChunkLen, self$2.padMaxChunkLen);
					turnOffset = 0;
				}
			}
			return this;
		};
		this.getState = function () {
			var turnOffset = self$2.offset % self$2.maxChunkLen;
			var heap;
			if (!turnOffset) {
				var io = new Int32Array(self$2.heap, self$2.padMaxChunkLen + 320, 5);
				heap = io.buffer.slice(io.byteOffset, io.byteOffset + io.byteLength);
			} else {
				heap = self$2.heap.slice(0);
			}
			return {
				offset: self$2.offset,
				heap: heap
			};
		};
		this.setState = function (state) {
			self$2.offset = state.offset;
			if (state.heap.byteLength === 20) {
				var io = new Int32Array(self$2.heap, self$2.padMaxChunkLen + 320, 5);
				io.set(new Int32Array(state.heap));
			} else {
				self$2.h32.set(new Int32Array(state.heap));
			}
			return this;
		};
		var rawEnd = this.rawEnd = function () {
			var msgLen = self$2.offset;
			var chunkLen = msgLen % self$2.maxChunkLen;
			var padChunkLen = padChunk(chunkLen, msgLen);
			self$2.core.hash(padChunkLen, self$2.padMaxChunkLen);
			var result = getRawDigest(self$2.heap, self$2.padMaxChunkLen);
			initState(self$2.heap, self$2.padMaxChunkLen);
			return result;
		};
		this.end = function () {
			return hex(rawEnd().buffer);
		};
	};
	// The low-level RushCore module provides the heart of Rusha,
	// a high-speed sha1 implementation working on an Int32Array heap.
	// At first glance, the implementation seems complicated, however
	// with the SHA1 spec at hand, it is obvious this almost a textbook
	// implementation that has a few functions hand-inlined and a few loops
	// hand-unrolled.
	Rusha._core = function RushaCore(stdlib, foreign, heap) {
		'use asm';
		var H = new stdlib.Int32Array(heap);

		function hash(k, x) {
			// k in bytes
			k = k | 0;
			x = x | 0;
			var i = 0,
				j = 0,
				y0 = 0,
				z0 = 0,
				y1 = 0,
				z1 = 0,
				y2 = 0,
				z2 = 0,
				y3 = 0,
				z3 = 0,
				y4 = 0,
				z4 = 0,
				t0 = 0,
				t1 = 0;
			y0 = H[x + 320 >> 2] | 0;
			y1 = H[x + 324 >> 2] | 0;
			y2 = H[x + 328 >> 2] | 0;
			y3 = H[x + 332 >> 2] | 0;
			y4 = H[x + 336 >> 2] | 0;
			for (i = 0;
				(i | 0) < (k | 0); i = i + 64 | 0) {
				z0 = y0;
				z1 = y1;
				z2 = y2;
				z3 = y3;
				z4 = y4;
				for (j = 0;
					(j | 0) < 64; j = j + 4 | 0) {
					t1 = H[i + j >> 2] | 0;
					t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | ~y1 & y3) | 0) + ((t1 + y4 | 0) + 1518500249 | 0) | 0;
					y4 = y3;
					y3 = y2;
					y2 = y1 << 30 | y1 >>> 2;
					y1 = y0;
					y0 = t0;
					H[k + j >> 2] = t1;
				}
				for (j = k + 64 | 0;
					(j | 0) < (k + 80 | 0); j = j + 4 | 0) {
					t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
					t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | ~y1 & y3) | 0) + ((t1 + y4 | 0) + 1518500249 | 0) | 0;
					y4 = y3;
					y3 = y2;
					y2 = y1 << 30 | y1 >>> 2;
					y1 = y0;
					y0 = t0;
					H[j >> 2] = t1;
				}
				for (j = k + 80 | 0;
					(j | 0) < (k + 160 | 0); j = j + 4 | 0) {
					t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
					t0 = ((y0 << 5 | y0 >>> 27) + (y1 ^ y2 ^ y3) | 0) + ((t1 + y4 | 0) + 1859775393 | 0) | 0;
					y4 = y3;
					y3 = y2;
					y2 = y1 << 30 | y1 >>> 2;
					y1 = y0;
					y0 = t0;
					H[j >> 2] = t1;
				}
				for (j = k + 160 | 0;
					(j | 0) < (k + 240 | 0); j = j + 4 | 0) {
					t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
					t0 = ((y0 << 5 | y0 >>> 27) + (y1 & y2 | y1 & y3 | y2 & y3) | 0) + ((t1 + y4 | 0) - 1894007588 | 0) | 0;
					y4 = y3;
					y3 = y2;
					y2 = y1 << 30 | y1 >>> 2;
					y1 = y0;
					y0 = t0;
					H[j >> 2] = t1;
				}
				for (j = k + 240 | 0;
					(j | 0) < (k + 320 | 0); j = j + 4 | 0) {
					t1 = (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) << 1 | (H[j - 12 >> 2] ^ H[j - 32 >> 2] ^ H[j - 56 >> 2] ^ H[j - 64 >> 2]) >>> 31;
					t0 = ((y0 << 5 | y0 >>> 27) + (y1 ^ y2 ^ y3) | 0) + ((t1 + y4 | 0) - 899497514 | 0) | 0;
					y4 = y3;
					y3 = y2;
					y2 = y1 << 30 | y1 >>> 2;
					y1 = y0;
					y0 = t0;
					H[j >> 2] = t1;
				}
				y0 = y0 + z0 | 0;
				y1 = y1 + z1 | 0;
				y2 = y2 + z2 | 0;
				y3 = y3 + z3 | 0;
				y4 = y4 + z4 | 0;
			}
			H[x + 320 >> 2] = y0;
			H[x + 324 >> 2] = y1;
			H[x + 328 >> 2] = y2;
			H[x + 332 >> 2] = y3;
			H[x + 336 >> 2] = y4;
		}
		return {
			hash: hash
		};
	};
	if ( // If we'e running in Node.JS, export a module.
		typeof module !== 'undefined') {
		module.exports = Rusha;
	} else if ( // If we're running in a DOM context, export
		// the Rusha object to toplevel.
		typeof window !== 'undefined') {
		window.Rusha = Rusha;
	}
	if ( // If we're running in a webworker, accept
		// messages containing a jobid and a buffer
		// or blob object, and return the hash result.
		typeof FileReaderSync !== 'undefined') {
		var reader = new FileReaderSync();
		var hashData = function hash(hasher, data, cb) {
			try {
				return cb(null, hasher.digest(data));
			} catch (e) {
				return cb(e);
			}
		};
		var hashFile = function hashArrayBuffer(hasher, readTotal, blockSize, file, cb) {
			var reader$2 = new self.FileReader();
			reader$2.onloadend = function onloadend() {
				var buffer = reader$2.result;
				readTotal += reader$2.result.byteLength;
				try {
					hasher.append(buffer);
				} catch (e) {
					cb(e);
					return;
				}
				if (readTotal < file.size) {
					hashFile(hasher, readTotal, blockSize, file, cb);
				} else {
					cb(null, hasher.end());
				}
			};
			reader$2.readAsArrayBuffer(file.slice(readTotal, readTotal + blockSize));
		};
		self.onmessage = function onMessage(event) {
			var data = event.data.data,
				file = event.data.file,
				id = event.data.id;
			if (typeof id === 'undefined') return;
			if (!file && !data) return;
			var blockSize = event.data.blockSize || 4 * 1024 * 1024;
			var hasher = new Rusha(blockSize);
			hasher.resetState();
			var done = function done$2(err, hash) {
				if (!err) {
					self.postMessage({
						id: id,
						hash: hash
					});
				} else {
					self.postMessage({
						id: id,
						error: err.name
					});
				}
			};
			if (data) hashData(hasher, data, done);
			if (file) hashFile(hasher, 0, blockSize, file, done);
		};
	}
}());

/* Zepto v1.2.0-25-gd7e4caf - zepto ajax ie - zeptojs.com/license */
(function(global, factory) {
	if (typeof define === 'function' && define.amd)
	  define(function() { return factory(global) })
	else
	  factory(global)
  }(window, function(window) {
	var Zepto = (function() {
	var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
	  document = window.document,
	  elementDisplay = {}, classCache = {},
	  cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
	  fragmentRE = /^\s*<(\w+|!)[^>]*>/,
	  singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
	  tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	  rootNodeRE = /^(?:body|html)$/i,
	  capitalRE = /([A-Z])/g,
  
	  // special attributes that should be get/set via method calls
	  methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
  
	  adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
	  table = document.createElement('table'),
	  tableRow = document.createElement('tr'),
	  containers = {
		'tr': document.createElement('tbody'),
		'tbody': table, 'thead': table, 'tfoot': table,
		'td': tableRow, 'th': tableRow,
		'*': document.createElement('div')
	  },
	  simpleSelectorRE = /^[\w-]*$/,
	  class2type = {},
	  toString = class2type.toString,
	  zepto = {},
	  camelize, uniq,
	  tempParent = document.createElement('div'),
	  propMap = {
		'tabindex': 'tabIndex',
		'readonly': 'readOnly',
		'for': 'htmlFor',
		'class': 'className',
		'maxlength': 'maxLength',
		'cellspacing': 'cellSpacing',
		'cellpadding': 'cellPadding',
		'rowspan': 'rowSpan',
		'colspan': 'colSpan',
		'usemap': 'useMap',
		'frameborder': 'frameBorder',
		'contenteditable': 'contentEditable'
	  },
	  isArray = Array.isArray ||
		function(object){ return object instanceof Array }
  
	zepto.matches = function(element, selector) {
	  if (!selector || !element || element.nodeType !== 1) return false
	  var matchesSelector = element.matches || element.webkitMatchesSelector ||
							element.mozMatchesSelector || element.oMatchesSelector ||
							element.matchesSelector
	  if (matchesSelector) return matchesSelector.call(element, selector)
	  // fall back to performing a selector:
	  var match, parent = element.parentNode, temp = !parent
	  if (temp) (parent = tempParent).appendChild(element)
	  match = ~zepto.qsa(parent, selector).indexOf(element)
	  temp && tempParent.removeChild(element)
	  return match
	}
  
	function type(obj) {
	  return obj == null ? String(obj) :
		class2type[toString.call(obj)] || "object"
	}
  
	function isFunction(value) { return type(value) == "function" }
	function isWindow(obj)     { return obj != null && obj == obj.window }
	function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
	function isObject(obj)     { return type(obj) == "object" }
	function isPlainObject(obj) {
	  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
	}
  
	function likeArray(obj) {
	  var length = !!obj && 'length' in obj && obj.length,
		type = $.type(obj)
  
	  return 'function' != type && !isWindow(obj) && (
		'array' == type || length === 0 ||
		  (typeof length == 'number' && length > 0 && (length - 1) in obj)
	  )
	}
  
	function compact(array) { return filter.call(array, function(item){ return item != null }) }
	function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
	camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
	function dasherize(str) {
	  return str.replace(/::/g, '/')
			 .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
			 .replace(/([a-z\d])([A-Z])/g, '$1_$2')
			 .replace(/_/g, '-')
			 .toLowerCase()
	}
	uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }
  
	function classRE(name) {
	  return name in classCache ?
		classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
	}
  
	function maybeAddPx(name, value) {
	  return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
	}
  
	function defaultDisplay(nodeName) {
	  var element, display
	  if (!elementDisplay[nodeName]) {
		element = document.createElement(nodeName)
		document.body.appendChild(element)
		display = getComputedStyle(element, '').getPropertyValue("display")
		element.parentNode.removeChild(element)
		display == "none" && (display = "block")
		elementDisplay[nodeName] = display
	  }
	  return elementDisplay[nodeName]
	}
  
	function children(element) {
	  return 'children' in element ?
		slice.call(element.children) :
		$.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
	}
  
	function Z(dom, selector) {
	  var i, len = dom ? dom.length : 0
	  for (i = 0; i < len; i++) this[i] = dom[i]
	  this.length = len
	  this.selector = selector || ''
	}
  
	// `$.zepto.fragment` takes a html string and an optional tag name
	// to generate DOM nodes from the given html string.
	// The generated DOM nodes are returned as an array.
	// This function can be overridden in plugins for example to make
	// it compatible with browsers that don't support the DOM fully.
	zepto.fragment = function(html, name, properties) {
	  var dom, nodes, container
  
	  // A special case optimization for a single tag
	  if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))
  
	  if (!dom) {
		if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
		if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
		if (!(name in containers)) name = '*'
  
		container = containers[name]
		container.innerHTML = '' + html
		dom = $.each(slice.call(container.childNodes), function(){
		  container.removeChild(this)
		})
	  }
  
	  if (isPlainObject(properties)) {
		nodes = $(dom)
		$.each(properties, function(key, value) {
		  if (methodAttributes.indexOf(key) > -1) nodes[key](value)
		  else nodes.attr(key, value)
		})
	  }
  
	  return dom
	}
  
	// `$.zepto.Z` swaps out the prototype of the given `dom` array
	// of nodes with `$.fn` and thus supplying all the Zepto functions
	// to the array. This method can be overridden in plugins.
	zepto.Z = function(dom, selector) {
	  return new Z(dom, selector)
	}
  
	// `$.zepto.isZ` should return `true` if the given object is a Zepto
	// collection. This method can be overridden in plugins.
	zepto.isZ = function(object) {
	  return object instanceof zepto.Z
	}
  
	// `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
	// takes a CSS selector and an optional context (and handles various
	// special cases).
	// This method can be overridden in plugins.
	zepto.init = function(selector, context) {
	  var dom
	  // If nothing given, return an empty Zepto collection
	  if (!selector) return zepto.Z()
	  // Optimize for string selectors
	  else if (typeof selector == 'string') {
		selector = selector.trim()
		// If it's a html fragment, create nodes from it
		// Note: In both Chrome 21 and Firefox 15, DOM error 12
		// is thrown if the fragment doesn't begin with <
		if (selector[0] == '<' && fragmentRE.test(selector))
		  dom = zepto.fragment(selector, RegExp.$1, context), selector = null
		// If there's a context, create a collection on that context first, and select
		// nodes from there
		else if (context !== undefined) return $(context).find(selector)
		// If it's a CSS selector, use it to select nodes.
		else dom = zepto.qsa(document, selector)
	  }
	  // If a function is given, call it when the DOM is ready
	  else if (isFunction(selector)) return $(document).ready(selector)
	  // If a Zepto collection is given, just return it
	  else if (zepto.isZ(selector)) return selector
	  else {
		// normalize array if an array of nodes is given
		if (isArray(selector)) dom = compact(selector)
		// Wrap DOM nodes.
		else if (isObject(selector))
		  dom = [selector], selector = null
		// If it's a html fragment, create nodes from it
		else if (fragmentRE.test(selector))
		  dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
		// If there's a context, create a collection on that context first, and select
		// nodes from there
		else if (context !== undefined) return $(context).find(selector)
		// And last but no least, if it's a CSS selector, use it to select nodes.
		else dom = zepto.qsa(document, selector)
	  }
	  // create a new Zepto collection from the nodes found
	  return zepto.Z(dom, selector)
	}
  
	// `$` will be the base `Zepto` object. When calling this
	// function just call `$.zepto.init, which makes the implementation
	// details of selecting nodes and creating Zepto collections
	// patchable in plugins.
	$ = function(selector, context){
	  return zepto.init(selector, context)
	}
  
	function extend(target, source, deep) {
	  for (key in source)
		if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
		  if (isPlainObject(source[key]) && !isPlainObject(target[key]))
			target[key] = {}
		  if (isArray(source[key]) && !isArray(target[key]))
			target[key] = []
		  extend(target[key], source[key], deep)
		}
		else if (source[key] !== undefined) target[key] = source[key]
	}
  
	// Copy all but undefined properties from one or more
	// objects to the `target` object.
	$.extend = function(target){
	  var deep, args = slice.call(arguments, 1)
	  if (typeof target == 'boolean') {
		deep = target
		target = args.shift()
	  }
	  args.forEach(function(arg){ extend(target, arg, deep) })
	  return target
	}
  
	// `$.zepto.qsa` is Zepto's CSS selector implementation which
	// uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
	// This method can be overridden in plugins.
	zepto.qsa = function(element, selector){
	  var found,
		  maybeID = selector[0] == '#',
		  maybeClass = !maybeID && selector[0] == '.',
		  nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
		  isSimple = simpleSelectorRE.test(nameOnly)
	  return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
		( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
		(element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
		slice.call(
		  isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
			maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
			element.getElementsByTagName(selector) : // Or a tag
			element.querySelectorAll(selector) // Or it's not simple, and we need to query all
		)
	}
  
	function filtered(nodes, selector) {
	  return selector == null ? $(nodes) : $(nodes).filter(selector)
	}
  
	$.contains = document.documentElement.contains ?
	  function(parent, node) {
		return parent !== node && parent.contains(node)
	  } :
	  function(parent, node) {
		while (node && (node = node.parentNode))
		  if (node === parent) return true
		return false
	  }
  
	function funcArg(context, arg, idx, payload) {
	  return isFunction(arg) ? arg.call(context, idx, payload) : arg
	}
  
	function setAttribute(node, name, value) {
	  value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
	}
  
	// access className property while respecting SVGAnimatedString
	function className(node, value){
	  var klass = node.className || '',
		  svg   = klass && klass.baseVal !== undefined
  
	  if (value === undefined) return svg ? klass.baseVal : klass
	  svg ? (klass.baseVal = value) : (node.className = value)
	}
  
	// "true"  => true
	// "false" => false
	// "null"  => null
	// "42"    => 42
	// "42.5"  => 42.5
	// "08"    => "08"
	// JSON    => parse if valid
	// String  => self
	function deserializeValue(value) {
	  try {
		return value ?
		  value == "true" ||
		  ( value == "false" ? false :
			value == "null" ? null :
			+value + "" == value ? +value :
			/^[\[\{]/.test(value) ? $.parseJSON(value) :
			value )
		  : value
	  } catch(e) {
		return value
	  }
	}
  
	$.type = type
	$.isFunction = isFunction
	$.isWindow = isWindow
	$.isArray = isArray
	$.isPlainObject = isPlainObject
  
	$.isEmptyObject = function(obj) {
	  var name
	  for (name in obj) return false
	  return true
	}
  
	$.isNumeric = function(val) {
	  var num = Number(val), type = typeof val
	  return val != null && type != 'boolean' &&
		(type != 'string' || val.length) &&
		!isNaN(num) && isFinite(num) || false
	}
  
	$.inArray = function(elem, array, i){
	  return emptyArray.indexOf.call(array, elem, i)
	}
  
	$.camelCase = camelize
	$.trim = function(str) {
	  return str == null ? "" : String.prototype.trim.call(str)
	}
  
	// plugin compatibility
	$.uuid = 0
	$.support = { }
	$.expr = { }
	$.noop = function() {}
  
	$.map = function(elements, callback){
	  var value, values = [], i, key
	  if (likeArray(elements))
		for (i = 0; i < elements.length; i++) {
		  value = callback(elements[i], i)
		  if (value != null) values.push(value)
		}
	  else
		for (key in elements) {
		  value = callback(elements[key], key)
		  if (value != null) values.push(value)
		}
	  return flatten(values)
	}
  
	$.each = function(elements, callback){
	  var i, key
	  if (likeArray(elements)) {
		for (i = 0; i < elements.length; i++)
		  if (callback.call(elements[i], i, elements[i]) === false) return elements
	  } else {
		for (key in elements)
		  if (callback.call(elements[key], key, elements[key]) === false) return elements
	  }
  
	  return elements
	}
  
	$.grep = function(elements, callback){
	  return filter.call(elements, callback)
	}
  
	if (window.JSON) $.parseJSON = JSON.parse
  
	// Populate the class2type map
	$.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	  class2type[ "[object " + name + "]" ] = name.toLowerCase()
	})
  
	// Define methods that will be available on all
	// Zepto collections
	$.fn = {
	  constructor: zepto.Z,
	  length: 0,
  
	  // Because a collection acts like an array
	  // copy over these useful array functions.
	  forEach: emptyArray.forEach,
	  reduce: emptyArray.reduce,
	  push: emptyArray.push,
	  sort: emptyArray.sort,
	  splice: emptyArray.splice,
	  indexOf: emptyArray.indexOf,
	  concat: function(){
		var i, value, args = []
		for (i = 0; i < arguments.length; i++) {
		  value = arguments[i]
		  args[i] = zepto.isZ(value) ? value.toArray() : value
		}
		return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
	  },
  
	  // `map` and `slice` in the jQuery API work differently
	  // from their array counterparts
	  map: function(fn){
		return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
	  },
	  slice: function(){
		return $(slice.apply(this, arguments))
	  },
  
	  ready: function(callback){
		// don't use "interactive" on IE <= 10 (it can fired premature)
		if (document.readyState === "complete" ||
			(document.readyState !== "loading" && !document.documentElement.doScroll))
		  setTimeout(function(){ callback($) }, 0)
		else {
		  var handler = function() {
			document.removeEventListener("DOMContentLoaded", handler, false)
			window.removeEventListener("load", handler, false)
			callback($)
		  }
		  document.addEventListener("DOMContentLoaded", handler, false)
		  window.addEventListener("load", handler, false)
		}
		return this
	  },
	  get: function(idx){
		return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
	  },
	  toArray: function(){ return this.get() },
	  size: function(){
		return this.length
	  },
	  remove: function(){
		return this.each(function(){
		  if (this.parentNode != null)
			this.parentNode.removeChild(this)
		})
	  },
	  each: function(callback){
		emptyArray.every.call(this, function(el, idx){
		  return callback.call(el, idx, el) !== false
		})
		return this
	  },
	  filter: function(selector){
		if (isFunction(selector)) return this.not(this.not(selector))
		return $(filter.call(this, function(element){
		  return zepto.matches(element, selector)
		}))
	  },
	  add: function(selector,context){
		return $(uniq(this.concat($(selector,context))))
	  },
	  is: function(selector){
		return typeof selector == 'string' ? this.length > 0 && zepto.matches(this[0], selector) : 
			selector && this.selector == selector.selector
	  },
	  not: function(selector){
		var nodes=[]
		if (isFunction(selector) && selector.call !== undefined)
		  this.each(function(idx){
			if (!selector.call(this,idx)) nodes.push(this)
		  })
		else {
		  var excludes = typeof selector == 'string' ? this.filter(selector) :
			(likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
		  this.forEach(function(el){
			if (excludes.indexOf(el) < 0) nodes.push(el)
		  })
		}
		return $(nodes)
	  },
	  has: function(selector){
		return this.filter(function(){
		  return isObject(selector) ?
			$.contains(this, selector) :
			$(this).find(selector).size()
		})
	  },
	  eq: function(idx){
		return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
	  },
	  first: function(){
		var el = this[0]
		return el && !isObject(el) ? el : $(el)
	  },
	  last: function(){
		var el = this[this.length - 1]
		return el && !isObject(el) ? el : $(el)
	  },
	  find: function(selector){
		var result, $this = this
		if (!selector) result = $()
		else if (typeof selector == 'object')
		  result = $(selector).filter(function(){
			var node = this
			return emptyArray.some.call($this, function(parent){
			  return $.contains(parent, node)
			})
		  })
		else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
		else result = this.map(function(){ return zepto.qsa(this, selector) })
		return result
	  },
	  closest: function(selector, context){
		var nodes = [], collection = typeof selector == 'object' && $(selector)
		this.each(function(_, node){
		  while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
			node = node !== context && !isDocument(node) && node.parentNode
		  if (node && nodes.indexOf(node) < 0) nodes.push(node)
		})
		return $(nodes)
	  },
	  parents: function(selector){
		var ancestors = [], nodes = this
		while (nodes.length > 0)
		  nodes = $.map(nodes, function(node){
			if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
			  ancestors.push(node)
			  return node
			}
		  })
		return filtered(ancestors, selector)
	  },
	  parent: function(selector){
		return filtered(uniq(this.pluck('parentNode')), selector)
	  },
	  children: function(selector){
		return filtered(this.map(function(){ return children(this) }), selector)
	  },
	  contents: function() {
		return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
	  },
	  siblings: function(selector){
		return filtered(this.map(function(i, el){
		  return filter.call(children(el.parentNode), function(child){ return child!==el })
		}), selector)
	  },
	  empty: function(){
		return this.each(function(){ this.innerHTML = '' })
	  },
	  // `pluck` is borrowed from Prototype.js
	  pluck: function(property){
		return $.map(this, function(el){ return el[property] })
	  },
	  show: function(){
		return this.each(function(){
		  this.style.display == "none" && (this.style.display = '')
		  if (getComputedStyle(this, '').getPropertyValue("display") == "none")
			this.style.display = defaultDisplay(this.nodeName)
		})
	  },
	  replaceWith: function(newContent){
		return this.before(newContent).remove()
	  },
	  wrap: function(structure){
		var func = isFunction(structure)
		if (this[0] && !func)
		  var dom   = $(structure).get(0),
			  clone = dom.parentNode || this.length > 1
  
		return this.each(function(index){
		  $(this).wrapAll(
			func ? structure.call(this, index) :
			  clone ? dom.cloneNode(true) : dom
		  )
		})
	  },
	  wrapAll: function(structure){
		if (this[0]) {
		  $(this[0]).before(structure = $(structure))
		  var children
		  // drill down to the inmost element
		  while ((children = structure.children()).length) structure = children.first()
		  $(structure).append(this)
		}
		return this
	  },
	  wrapInner: function(structure){
		var func = isFunction(structure)
		return this.each(function(index){
		  var self = $(this), contents = self.contents(),
			  dom  = func ? structure.call(this, index) : structure
		  contents.length ? contents.wrapAll(dom) : self.append(dom)
		})
	  },
	  unwrap: function(){
		this.parent().each(function(){
		  $(this).replaceWith($(this).children())
		})
		return this
	  },
	  clone: function(){
		return this.map(function(){ return this.cloneNode(true) })
	  },
	  hide: function(){
		return this.css("display", "none")
	  },
	  toggle: function(setting){
		return this.each(function(){
		  var el = $(this)
		  ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
		})
	  },
	  prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
	  next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
	  html: function(html){
		return 0 in arguments ?
		  this.each(function(idx){
			var originHtml = this.innerHTML
			$(this).empty().append( funcArg(this, html, idx, originHtml) )
		  }) :
		  (0 in this ? this[0].innerHTML : null)
	  },
	  text: function(text){
		return 0 in arguments ?
		  this.each(function(idx){
			var newText = funcArg(this, text, idx, this.textContent)
			this.textContent = newText == null ? '' : ''+newText
		  }) :
		  (0 in this ? this.pluck('textContent').join("") : null)
	  },
	  attr: function(name, value){
		var result
		return (typeof name == 'string' && !(1 in arguments)) ?
		  (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
		  this.each(function(idx){
			if (this.nodeType !== 1) return
			if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
			else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
		  })
	  },
	  removeAttr: function(name){
		return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
		  setAttribute(this, attribute)
		}, this)})
	  },
	  prop: function(name, value){
		name = propMap[name] || name
		return (typeof name == 'string' && !(1 in arguments)) ?
		  (this[0] && this[0][name]) :
		  this.each(function(idx){
			if (isObject(name)) for (key in name) this[propMap[key] || key] = name[key]
			else this[name] = funcArg(this, value, idx, this[name])
		  })
	  },
	  removeProp: function(name){
		name = propMap[name] || name
		return this.each(function(){ delete this[name] })
	  },
	  data: function(name, value){
		var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()
  
		var data = (1 in arguments) ?
		  this.attr(attrName, value) :
		  this.attr(attrName)
  
		return data !== null ? deserializeValue(data) : undefined
	  },
	  val: function(value){
		if (0 in arguments) {
		  if (value == null) value = ""
		  return this.each(function(idx){
			this.value = funcArg(this, value, idx, this.value)
		  })
		} else {
		  return this[0] && (this[0].multiple ?
			 $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
			 this[0].value)
		}
	  },
	  offset: function(coordinates){
		if (coordinates) return this.each(function(index){
		  var $this = $(this),
			  coords = funcArg(this, coordinates, index, $this.offset()),
			  parentOffset = $this.offsetParent().offset(),
			  props = {
				top:  coords.top  - parentOffset.top,
				left: coords.left - parentOffset.left
			  }
  
		  if ($this.css('position') == 'static') props['position'] = 'relative'
		  $this.css(props)
		})
		if (!this.length) return null
		if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
		  return {top: 0, left: 0}
		var obj = this[0].getBoundingClientRect()
		return {
		  left: obj.left + window.pageXOffset,
		  top: obj.top + window.pageYOffset,
		  width: Math.round(obj.width),
		  height: Math.round(obj.height)
		}
	  },
	  css: function(property, value){
		if (arguments.length < 2) {
		  var element = this[0]
		  if (typeof property == 'string') {
			if (!element) return
			return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
		  } else if (isArray(property)) {
			if (!element) return
			var props = {}
			var computedStyle = getComputedStyle(element, '')
			$.each(property, function(_, prop){
			  props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
			})
			return props
		  }
		}
  
		var css = ''
		if (type(property) == 'string') {
		  if (!value && value !== 0)
			this.each(function(){ this.style.removeProperty(dasherize(property)) })
		  else
			css = dasherize(property) + ":" + maybeAddPx(property, value)
		} else {
		  for (key in property)
			if (!property[key] && property[key] !== 0)
			  this.each(function(){ this.style.removeProperty(dasherize(key)) })
			else
			  css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
		}
  
		return this.each(function(){ this.style.cssText += ';' + css })
	  },
	  index: function(element){
		return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
	  },
	  hasClass: function(name){
		if (!name) return false
		return emptyArray.some.call(this, function(el){
		  return this.test(className(el))
		}, classRE(name))
	  },
	  addClass: function(name){
		if (!name) return this
		return this.each(function(idx){
		  if (!('className' in this)) return
		  classList = []
		  var cls = className(this), newName = funcArg(this, name, idx, cls)
		  newName.split(/\s+/g).forEach(function(klass){
			if (!$(this).hasClass(klass)) classList.push(klass)
		  }, this)
		  classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
		})
	  },
	  removeClass: function(name){
		return this.each(function(idx){
		  if (!('className' in this)) return
		  if (name === undefined) return className(this, '')
		  classList = className(this)
		  funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
			classList = classList.replace(classRE(klass), " ")
		  })
		  className(this, classList.trim())
		})
	  },
	  toggleClass: function(name, when){
		if (!name) return this
		return this.each(function(idx){
		  var $this = $(this), names = funcArg(this, name, idx, className(this))
		  names.split(/\s+/g).forEach(function(klass){
			(when === undefined ? !$this.hasClass(klass) : when) ?
			  $this.addClass(klass) : $this.removeClass(klass)
		  })
		})
	  },
	  scrollTop: function(value){
		if (!this.length) return
		var hasScrollTop = 'scrollTop' in this[0]
		if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
		return this.each(hasScrollTop ?
		  function(){ this.scrollTop = value } :
		  function(){ this.scrollTo(this.scrollX, value) })
	  },
	  scrollLeft: function(value){
		if (!this.length) return
		var hasScrollLeft = 'scrollLeft' in this[0]
		if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
		return this.each(hasScrollLeft ?
		  function(){ this.scrollLeft = value } :
		  function(){ this.scrollTo(value, this.scrollY) })
	  },
	  position: function() {
		if (!this.length) return
  
		var elem = this[0],
		  // Get *real* offsetParent
		  offsetParent = this.offsetParent(),
		  // Get correct offsets
		  offset       = this.offset(),
		  parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()
  
		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
		offset.left -= parseFloat( $(elem).css('margin-left') ) || 0
  
		// Add offsetParent borders
		parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
		parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0
  
		// Subtract the two offsets
		return {
		  top:  offset.top  - parentOffset.top,
		  left: offset.left - parentOffset.left
		}
	  },
	  offsetParent: function() {
		return this.map(function(){
		  var parent = this.offsetParent || document.body
		  while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
			parent = parent.offsetParent
		  return parent
		})
	  }
	}
  
	// for now
	$.fn.detach = $.fn.remove
  
	// Generate the `width` and `height` functions
	;['width', 'height'].forEach(function(dimension){
	  var dimensionProperty =
		dimension.replace(/./, function(m){ return m[0].toUpperCase() })
  
	  $.fn[dimension] = function(value){
		var offset, el = this[0]
		if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
		  isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
		  (offset = this.offset()) && offset[dimension]
		else return this.each(function(idx){
		  el = $(this)
		  el.css(dimension, funcArg(this, value, idx, el[dimension]()))
		})
	  }
	})
  
	function traverseNode(node, fun) {
	  fun(node)
	  for (var i = 0, len = node.childNodes.length; i < len; i++)
		traverseNode(node.childNodes[i], fun)
	}
  
	// Generate the `after`, `prepend`, `before`, `append`,
	// `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
	adjacencyOperators.forEach(function(operator, operatorIndex) {
	  var inside = operatorIndex % 2 //=> prepend, append
  
	  $.fn[operator] = function(){
		// arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
		var argType, nodes = $.map(arguments, function(arg) {
			  var arr = []
			  argType = type(arg)
			  if (argType == "array") {
				arg.forEach(function(el) {
				  if (el.nodeType !== undefined) return arr.push(el)
				  else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
				  arr = arr.concat(zepto.fragment(el))
				})
				return arr
			  }
			  return argType == "object" || arg == null ?
				arg : zepto.fragment(arg)
			}),
			parent, copyByClone = this.length > 1
		if (nodes.length < 1) return this
  
		return this.each(function(_, target){
		  parent = inside ? target : target.parentNode
  
		  // convert all methods to a "before" operation
		  target = operatorIndex == 0 ? target.nextSibling :
				   operatorIndex == 1 ? target.firstChild :
				   operatorIndex == 2 ? target :
				   null
  
		  var parentInDocument = $.contains(document.documentElement, parent)
  
		  nodes.forEach(function(node){
			if (copyByClone) node = node.cloneNode(true)
			else if (!parent) return $(node).remove()
  
			parent.insertBefore(node, target)
			if (parentInDocument) traverseNode(node, function(el){
			  if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
				 (!el.type || el.type === 'text/javascript') && !el.src){
				var target = el.ownerDocument ? el.ownerDocument.defaultView : window
				target['eval'].call(target, el.innerHTML)
			  }
			})
		  })
		})
	  }
  
	  // after    => insertAfter
	  // prepend  => prependTo
	  // before   => insertBefore
	  // append   => appendTo
	  $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
		$(html)[operator](this)
		return this
	  }
	})
  
	zepto.Z.prototype = Z.prototype = $.fn
  
	// Export internal API functions in the `$.zepto` namespace
	zepto.uniq = uniq
	zepto.deserializeValue = deserializeValue
	$.zepto = zepto
  
	return $
  })()
  
  window.Zepto = Zepto
  window.$ === undefined && (window.$ = Zepto)
  
  ;(function($){
	var jsonpID = +new Date(),
		document = window.document,
		key,
		name,
		rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
		scriptTypeRE = /^(?:text|application)\/javascript/i,
		xmlTypeRE = /^(?:text|application)\/xml/i,
		jsonType = 'application/json',
		htmlType = 'text/html',
		blankRE = /^\s*$/,
		originAnchor = document.createElement('a')
  
	originAnchor.href = window.location.href
  
	// trigger a custom event and return false if it was cancelled
	function triggerAndReturn(context, eventName, data) {
	  var event = $.Event(eventName)
	  $(context).trigger(event, data)
	  return !event.isDefaultPrevented()
	}
  
	// trigger an Ajax "global" event
	function triggerGlobal(settings, context, eventName, data) {
	  if (settings.global) return triggerAndReturn(context || document, eventName, data)
	}
  
	// Number of active Ajax requests
	$.active = 0
  
	function ajaxStart(settings) {
	  if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
	}
	function ajaxStop(settings) {
	  if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
	}
  
	// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
	function ajaxBeforeSend(xhr, settings) {
	  var context = settings.context
	  if (settings.beforeSend.call(context, xhr, settings) === false ||
		  triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
		return false
  
	  triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
	}
	function ajaxSuccess(data, xhr, settings, deferred) {
	  var context = settings.context, status = 'success'
	  settings.success.call(context, data, status, xhr)
	  if (deferred) deferred.resolveWith(context, [data, status, xhr])
	  triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
	  ajaxComplete(status, xhr, settings)
	}
	// type: "timeout", "error", "abort", "parsererror"
	function ajaxError(error, type, xhr, settings, deferred) {
	  var context = settings.context
	  settings.error.call(context, xhr, type, error)
	  if (deferred) deferred.rejectWith(context, [xhr, type, error])
	  triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
	  ajaxComplete(type, xhr, settings)
	}
	// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
	function ajaxComplete(status, xhr, settings) {
	  var context = settings.context
	  settings.complete.call(context, xhr, status)
	  triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
	  ajaxStop(settings)
	}
  
	function ajaxDataFilter(data, type, settings) {
	  if (settings.dataFilter == empty) return data
	  var context = settings.context
	  return settings.dataFilter.call(context, data, type)
	}
  
	// Empty function, used as default callback
	function empty() {}
  
	$.ajaxJSONP = function(options, deferred){
	  if (!('type' in options)) return $.ajax(options)
  
	  var _callbackName = options.jsonpCallback,
		callbackName = ($.isFunction(_callbackName) ?
		  _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
		script = document.createElement('script'),
		originalCallback = window[callbackName],
		responseData,
		abort = function(errorType) {
		  $(script).triggerHandler('error', errorType || 'abort')
		},
		xhr = { abort: abort }, abortTimeout
  
	  if (deferred) deferred.promise(xhr)
  
	  $(script).on('load error', function(e, errorType){
		clearTimeout(abortTimeout)
		$(script).off().remove()
  
		if (e.type == 'error' || !responseData) {
		  ajaxError(null, errorType || 'error', xhr, options, deferred)
		} else {
		  ajaxSuccess(responseData[0], xhr, options, deferred)
		}
  
		window[callbackName] = originalCallback
		if (responseData && $.isFunction(originalCallback))
		  originalCallback(responseData[0])
  
		originalCallback = responseData = undefined
	  })
  
	  if (ajaxBeforeSend(xhr, options) === false) {
		abort('abort')
		return xhr
	  }
  
	  window[callbackName] = function(){
		responseData = arguments
	  }
  
	  script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
	  document.head.appendChild(script)
  
	  if (options.timeout > 0) abortTimeout = setTimeout(function(){
		abort('timeout')
	  }, options.timeout)
  
	  return xhr
	}
  
	$.ajaxSettings = {
	  // Default type of request
	  type: 'GET',
	  // Callback that is executed before request
	  beforeSend: empty,
	  // Callback that is executed if the request succeeds
	  success: empty,
	  // Callback that is executed the the server drops error
	  error: empty,
	  // Callback that is executed on request complete (both: error and success)
	  complete: empty,
	  // The context for the callbacks
	  context: null,
	  // Whether to trigger "global" Ajax events
	  global: true,
	  // Transport
	  xhr: function () {
		return new window.XMLHttpRequest()
	  },
	  // MIME types mapping
	  // IIS returns Javascript as "application/x-javascript"
	  accepts: {
		script: 'text/javascript, application/javascript, application/x-javascript',
		json:   jsonType,
		xml:    'application/xml, text/xml',
		html:   htmlType,
		text:   'text/plain'
	  },
	  // Whether the request is to another domain
	  crossDomain: false,
	  // Default timeout
	  timeout: 0,
	  // Whether data should be serialized to string
	  processData: true,
	  // Whether the browser should be allowed to cache GET responses
	  cache: true,
	  //Used to handle the raw response data of XMLHttpRequest.
	  //This is a pre-filtering function to sanitize the response.
	  //The sanitized response should be returned
	  dataFilter: empty
	}
  
	function mimeToDataType(mime) {
	  if (mime) mime = mime.split(';', 2)[0]
	  return mime && ( mime == htmlType ? 'html' :
		mime == jsonType ? 'json' :
		scriptTypeRE.test(mime) ? 'script' :
		xmlTypeRE.test(mime) && 'xml' ) || 'text'
	}
  
	function appendQuery(url, query) {
	  if (query == '') return url
	  return (url + '&' + query).replace(/[&?]{1,2}/, '?')
	}
  
	// serialize payload and append it to the URL for GET requests
	function serializeData(options) {
	  if (options.processData && options.data && $.type(options.data) != "string")
		options.data = $.param(options.data, options.traditional)
	  if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
		options.url = appendQuery(options.url, options.data), options.data = undefined
	}
  
	$.ajax = function(options){
	  var settings = $.extend({}, options || {}),
		  deferred = $.Deferred && $.Deferred(),
		  urlAnchor, hashIndex
	  for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]
  
	  ajaxStart(settings)
  
	  if (!settings.crossDomain) {
		urlAnchor = document.createElement('a')
		urlAnchor.href = settings.url
		// cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
		urlAnchor.href = urlAnchor.href
		settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
	  }
  
	  if (!settings.url) settings.url = window.location.toString()
	  if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
	  serializeData(settings)
  
	  var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
	  if (hasPlaceholder) dataType = 'jsonp'
  
	  if (settings.cache === false || (
		   (!options || options.cache !== true) &&
		   ('script' == dataType || 'jsonp' == dataType)
		  ))
		settings.url = appendQuery(settings.url, '_=' + Date.now())
  
	  if ('jsonp' == dataType) {
		if (!hasPlaceholder)
		  settings.url = appendQuery(settings.url,
			settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
		return $.ajaxJSONP(settings, deferred)
	  }
  
	  var mime = settings.accepts[dataType],
		  headers = { },
		  setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
		  protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
		  xhr = settings.xhr(),
		  nativeSetHeader = xhr.setRequestHeader,
		  abortTimeout
  
	  if (deferred) deferred.promise(xhr)
  
	  if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
	  setHeader('Accept', mime || '*/*')
	  if (mime = settings.mimeType || mime) {
		if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
		xhr.overrideMimeType && xhr.overrideMimeType(mime)
	  }
	  if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
		setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
  
	  if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
	  xhr.setRequestHeader = setHeader
  
	  xhr.onreadystatechange = function(){
		if (xhr.readyState == 4) {
		  xhr.onreadystatechange = empty
		  clearTimeout(abortTimeout)
		  var result, error = false
		  if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
			dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
  
			if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
			  result = xhr.response
			else {
			  result = xhr.responseText
  
			  try {
				// http://perfectionkills.com/global-eval-what-are-the-options/
				// sanitize response accordingly if data filter callback provided
				result = ajaxDataFilter(result, dataType, settings)
				if (dataType == 'script')    (1,eval)(result)
				else if (dataType == 'xml')  result = xhr.responseXML
				else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
			  } catch (e) { error = e }
  
			  if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
			}
  
			ajaxSuccess(result, xhr, settings, deferred)
		  } else {
			ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
		  }
		}
	  }
  
	  if (ajaxBeforeSend(xhr, settings) === false) {
		xhr.abort()
		ajaxError(null, 'abort', xhr, settings, deferred)
		return xhr
	  }
  
	  var async = 'async' in settings ? settings.async : true
	  xhr.open(settings.type, settings.url, async, settings.username, settings.password)
  
	  if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]
  
	  for (name in headers) nativeSetHeader.apply(xhr, headers[name])
  
	  if (settings.timeout > 0) abortTimeout = setTimeout(function(){
		  xhr.onreadystatechange = empty
		  xhr.abort()
		  ajaxError(null, 'timeout', xhr, settings, deferred)
		}, settings.timeout)
  
	  // avoid sending empty string (#319)
	  xhr.send(settings.data ? settings.data : null)
	  return xhr
	}
  
	// handle optional data/success arguments
	function parseArguments(url, data, success, dataType) {
	  if ($.isFunction(data)) dataType = success, success = data, data = undefined
	  if (!$.isFunction(success)) dataType = success, success = undefined
	  return {
		url: url
	  , data: data
	  , success: success
	  , dataType: dataType
	  }
	}
  
	$.get = function(/* url, data, success, dataType */){
	  return $.ajax(parseArguments.apply(null, arguments))
	}
  
	$.post = function(/* url, data, success, dataType */){
	  var options = parseArguments.apply(null, arguments)
	  options.type = 'POST'
	  return $.ajax(options)
	}
  
	$.getJSON = function(/* url, data, success */){
	  var options = parseArguments.apply(null, arguments)
	  options.dataType = 'json'
	  return $.ajax(options)
	}
  
	$.fn.load = function(url, data, success){
	  if (!this.length) return this
	  var self = this, parts = url.split(/\s/), selector,
		  options = parseArguments(url, data, success),
		  callback = options.success
	  if (parts.length > 1) options.url = parts[0], selector = parts[1]
	  options.success = function(response){
		self.html(selector ?
		  $('<div>').html(response.replace(rscript, "")).find(selector)
		  : response)
		callback && callback.apply(self, arguments)
	  }
	  $.ajax(options)
	  return this
	}
  
	var escape = encodeURIComponent
  
	function serialize(params, obj, traditional, scope){
	  var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
	  $.each(obj, function(key, value) {
		type = $.type(value)
		if (scope) key = traditional ? scope :
		  scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
		// handle data in serializeArray() format
		if (!scope && array) params.add(value.name, value.value)
		// recurse into nested objects
		else if (type == "array" || (!traditional && type == "object"))
		  serialize(params, value, traditional, key)
		else params.add(key, value)
	  })
	}
  
	$.param = function(obj, traditional){
	  var params = []
	  params.add = function(key, value) {
		if ($.isFunction(value)) value = value()
		if (value == null) value = ""
		this.push(escape(key) + '=' + escape(value))
	  }
	  serialize(params, obj, traditional)
	  return params.join('&').replace(/%20/g, '+')
	}
  })(Zepto)
  
  ;(function(){
	// getComputedStyle shouldn't freak out when called
	// without a valid element as argument
	try {
	  getComputedStyle(undefined)
	} catch(e) {
	  var nativeGetComputedStyle = getComputedStyle
	  window.getComputedStyle = function(element, pseudoElement){
		try {
		  return nativeGetComputedStyle(element, pseudoElement)
		} catch(e) {
		  return null
		}
	  }
	}
  })()
	return Zepto
  }))

var localAddress;
if (navigator.platform == 'Win32') {
	localAddress = 'localhost';
} else {
	localAddress = '0.0.0.0';
}
window.onload = function () {
	var JsteInstallationCheckingRequest = new XMLHttpRequest();
	JsteInstallationCheckingRequest.open('GET', 'http://' + localAddress + ':5050/db-manager.html', true);
	JsteInstallationCheckingRequest.onreadystatechange = function () {
		if (JsteInstallationCheckingRequest.readyState === 4) {
			if (JsteInstallationCheckingRequest.status === 200) {
				var reader = new XMLHttpRequest();
				var checkFor = 'http://' + localAddress + ':5050/framework.html';
				reader.open('get', checkFor, true);
				reader.onreadystatechange = checkReadyState;

				function checkReadyState() {
					if (reader.readyState === 4) {
						if ((reader.status == 200)) {
							var request = new XMLHttpRequest();
							request.open('GET', 'http://' + localAddress + ':5050/framework.html', true);
							request.responseType = 'blob';
							request.onload = function () {
								var reader = new FileReader();
								reader.readAsDataURL(request.response);
								reader.onload = function (e) {
									var file_result = e.target.result; // this == reader, get the loaded file "result"
									var sha1_hash = new Rusha().digestFromArrayBuffer(file_result);
									var currentFileHash = sha1_hash.toString();
									var genuineFileHash = '97f4d5937975a027b7c9341fa1d9413f027a01ca';
									console.log(currentFileHash);
									if (currentFileHash === genuineFileHash) {
										setTimeout(function () {
											$('head').load('http://0.0.0.0:5050/framework.html');
										}, 1000);
									} else {
										document.getElementsByTagName("BODY")[0].style.background = 'black';
										document.getElementsByTagName("BODY")[0].innerHTML = '<h1 style="color: white;">It seems that you have modified version of Jste :(</h1>';
									}
								};
							};
							request.send();
						}
					}
				}
				reader.send(null);

			} else {
				document.getElementsByTagName("BODY")[0].style.background = 'black';
				document.getElementsByTagName("BODY")[0].innerHTML = "<center><h1 style='color: white;'>It seems that Jste isn't installed on your device :(</h1></center>";
			}
		}
	};
	JsteInstallationCheckingRequest.send();
};