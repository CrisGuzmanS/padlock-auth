(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('arrowy-env'), require('buffer'), require('stream'), require('util'), require('crypto')) :
	typeof define === 'function' && define.amd ? define(['exports', 'arrowy-env', 'buffer', 'stream', 'util', 'crypto'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PadlockAuth = {}, global.arrowyEnv, global.require$$0, global.require$$3, global.require$$5, global.require$$2));
})(this, (function (exports, arrowyEnv, require$$0, require$$3, require$$5, require$$2) { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var jws$3 = {};

	var safeBuffer = {exports: {}};

	/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

	(function (module, exports) {
		/* eslint-disable node/no-deprecated-api */
		var buffer = require$$0;
		var Buffer = buffer.Buffer;

		// alternative to using Object.keys for old browsers
		function copyProps (src, dst) {
		  for (var key in src) {
		    dst[key] = src[key];
		  }
		}
		if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
		  module.exports = buffer;
		} else {
		  // Copy properties from require('buffer')
		  copyProps(buffer, exports);
		  exports.Buffer = SafeBuffer;
		}

		function SafeBuffer (arg, encodingOrOffset, length) {
		  return Buffer(arg, encodingOrOffset, length)
		}

		SafeBuffer.prototype = Object.create(Buffer.prototype);

		// Copy static methods from Buffer
		copyProps(Buffer, SafeBuffer);

		SafeBuffer.from = function (arg, encodingOrOffset, length) {
		  if (typeof arg === 'number') {
		    throw new TypeError('Argument must not be a number')
		  }
		  return Buffer(arg, encodingOrOffset, length)
		};

		SafeBuffer.alloc = function (size, fill, encoding) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  var buf = Buffer(size);
		  if (fill !== undefined) {
		    if (typeof encoding === 'string') {
		      buf.fill(fill, encoding);
		    } else {
		      buf.fill(fill);
		    }
		  } else {
		    buf.fill(0);
		  }
		  return buf
		};

		SafeBuffer.allocUnsafe = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return Buffer(size)
		};

		SafeBuffer.allocUnsafeSlow = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return buffer.SlowBuffer(size)
		}; 
	} (safeBuffer, safeBuffer.exports));

	var safeBufferExports = safeBuffer.exports;

	/*global module, process*/

	var Buffer$7 = safeBufferExports.Buffer;
	var Stream$2 = require$$3;
	var util$3 = require$$5;

	function DataStream$2(data) {
	  this.buffer = null;
	  this.writable = true;
	  this.readable = true;

	  // No input
	  if (!data) {
	    this.buffer = Buffer$7.alloc(0);
	    return this;
	  }

	  // Stream
	  if (typeof data.pipe === 'function') {
	    this.buffer = Buffer$7.alloc(0);
	    data.pipe(this);
	    return this;
	  }

	  // Buffer or String
	  // or Object (assumedly a passworded key)
	  if (data.length || typeof data === 'object') {
	    this.buffer = data;
	    this.writable = false;
	    process.nextTick(function () {
	      this.emit('end', data);
	      this.readable = false;
	      this.emit('close');
	    }.bind(this));
	    return this;
	  }

	  throw new TypeError('Unexpected data type ('+ typeof data + ')');
	}
	util$3.inherits(DataStream$2, Stream$2);

	DataStream$2.prototype.write = function write(data) {
	  this.buffer = Buffer$7.concat([this.buffer, Buffer$7.from(data)]);
	  this.emit('data', data);
	};

	DataStream$2.prototype.end = function end(data) {
	  if (data)
	    this.write(data);
	  this.emit('end', data);
	  this.emit('close');
	  this.writable = false;
	  this.readable = false;
	};

	var dataStream = DataStream$2;

	/*jshint node:true */
	var Buffer$6 = require$$0.Buffer; // browserify
	var SlowBuffer = require$$0.SlowBuffer;

	var bufferEqualConstantTime = bufferEq;

	function bufferEq(a, b) {

	  // shortcutting on type is necessary for correctness
	  if (!Buffer$6.isBuffer(a) || !Buffer$6.isBuffer(b)) {
	    return false;
	  }

	  // buffer sizes should be well-known information, so despite this
	  // shortcutting, it doesn't leak any information about the *contents* of the
	  // buffers.
	  if (a.length !== b.length) {
	    return false;
	  }

	  var c = 0;
	  for (var i = 0; i < a.length; i++) {
	    /*jshint bitwise:false */
	    c |= a[i] ^ b[i]; // XOR
	  }
	  return c === 0;
	}

	bufferEq.install = function() {
	  Buffer$6.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
	    return bufferEq(this, that);
	  };
	};

	var origBufEqual = Buffer$6.prototype.equal;
	var origSlowBufEqual = SlowBuffer.prototype.equal;
	bufferEq.restore = function() {
	  Buffer$6.prototype.equal = origBufEqual;
	  SlowBuffer.prototype.equal = origSlowBufEqual;
	};

	function getParamSize(keySize) {
		var result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
		return result;
	}

	var paramBytesForAlg = {
		ES256: getParamSize(256),
		ES384: getParamSize(384),
		ES512: getParamSize(521)
	};

	function getParamBytesForAlg$1(alg) {
		var paramBytes = paramBytesForAlg[alg];
		if (paramBytes) {
			return paramBytes;
		}

		throw new Error('Unknown algorithm "' + alg + '"');
	}

	var paramBytesForAlg_1 = getParamBytesForAlg$1;

	var Buffer$5 = safeBufferExports.Buffer;

	var getParamBytesForAlg = paramBytesForAlg_1;

	var MAX_OCTET = 0x80,
		CLASS_UNIVERSAL = 0,
		PRIMITIVE_BIT = 0x20,
		TAG_SEQ = 0x10,
		TAG_INT = 0x02,
		ENCODED_TAG_SEQ = (TAG_SEQ | PRIMITIVE_BIT) | (CLASS_UNIVERSAL << 6),
		ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

	function base64Url(base64) {
		return base64
			.replace(/=/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');
	}

	function signatureAsBuffer(signature) {
		if (Buffer$5.isBuffer(signature)) {
			return signature;
		} else if ('string' === typeof signature) {
			return Buffer$5.from(signature, 'base64');
		}

		throw new TypeError('ECDSA signature must be a Base64 string or a Buffer');
	}

	function derToJose(signature, alg) {
		signature = signatureAsBuffer(signature);
		var paramBytes = getParamBytesForAlg(alg);

		// the DER encoded param should at most be the param size, plus a padding
		// zero, since due to being a signed integer
		var maxEncodedParamLength = paramBytes + 1;

		var inputLength = signature.length;

		var offset = 0;
		if (signature[offset++] !== ENCODED_TAG_SEQ) {
			throw new Error('Could not find expected "seq"');
		}

		var seqLength = signature[offset++];
		if (seqLength === (MAX_OCTET | 1)) {
			seqLength = signature[offset++];
		}

		if (inputLength - offset < seqLength) {
			throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
		}

		if (signature[offset++] !== ENCODED_TAG_INT) {
			throw new Error('Could not find expected "int" for "r"');
		}

		var rLength = signature[offset++];

		if (inputLength - offset - 2 < rLength) {
			throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
		}

		if (maxEncodedParamLength < rLength) {
			throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
		}

		var rOffset = offset;
		offset += rLength;

		if (signature[offset++] !== ENCODED_TAG_INT) {
			throw new Error('Could not find expected "int" for "s"');
		}

		var sLength = signature[offset++];

		if (inputLength - offset !== sLength) {
			throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
		}

		if (maxEncodedParamLength < sLength) {
			throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
		}

		var sOffset = offset;
		offset += sLength;

		if (offset !== inputLength) {
			throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
		}

		var rPadding = paramBytes - rLength,
			sPadding = paramBytes - sLength;

		var dst = Buffer$5.allocUnsafe(rPadding + rLength + sPadding + sLength);

		for (offset = 0; offset < rPadding; ++offset) {
			dst[offset] = 0;
		}
		signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);

		offset = paramBytes;

		for (var o = offset; offset < o + sPadding; ++offset) {
			dst[offset] = 0;
		}
		signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);

		dst = dst.toString('base64');
		dst = base64Url(dst);

		return dst;
	}

	function countPadding(buf, start, stop) {
		var padding = 0;
		while (start + padding < stop && buf[start + padding] === 0) {
			++padding;
		}

		var needsSign = buf[start + padding] >= MAX_OCTET;
		if (needsSign) {
			--padding;
		}

		return padding;
	}

	function joseToDer(signature, alg) {
		signature = signatureAsBuffer(signature);
		var paramBytes = getParamBytesForAlg(alg);

		var signatureBytes = signature.length;
		if (signatureBytes !== paramBytes * 2) {
			throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
		}

		var rPadding = countPadding(signature, 0, paramBytes);
		var sPadding = countPadding(signature, paramBytes, signature.length);
		var rLength = paramBytes - rPadding;
		var sLength = paramBytes - sPadding;

		var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

		var shortLength = rsBytes < MAX_OCTET;

		var dst = Buffer$5.allocUnsafe((shortLength ? 2 : 3) + rsBytes);

		var offset = 0;
		dst[offset++] = ENCODED_TAG_SEQ;
		if (shortLength) {
			// Bit 8 has value "0"
			// bits 7-1 give the length.
			dst[offset++] = rsBytes;
		} else {
			// Bit 8 of first octet has value "1"
			// bits 7-1 give the number of additional length octets.
			dst[offset++] = MAX_OCTET	| 1;
			// length, base 256
			dst[offset++] = rsBytes & 0xff;
		}
		dst[offset++] = ENCODED_TAG_INT;
		dst[offset++] = rLength;
		if (rPadding < 0) {
			dst[offset++] = 0;
			offset += signature.copy(dst, offset, 0, paramBytes);
		} else {
			offset += signature.copy(dst, offset, rPadding, paramBytes);
		}
		dst[offset++] = ENCODED_TAG_INT;
		dst[offset++] = sLength;
		if (sPadding < 0) {
			dst[offset++] = 0;
			signature.copy(dst, offset, paramBytes);
		} else {
			signature.copy(dst, offset, paramBytes + sPadding);
		}

		return dst;
	}

	var ecdsaSigFormatter = {
		derToJose: derToJose,
		joseToDer: joseToDer
	};

	var bufferEqual = bufferEqualConstantTime;
	var Buffer$4 = safeBufferExports.Buffer;
	var crypto = require$$2;
	var formatEcdsa = ecdsaSigFormatter;
	var util$2 = require$$5;

	var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
	var MSG_INVALID_SECRET = 'secret must be a string or buffer';
	var MSG_INVALID_VERIFIER_KEY = 'key must be a string or a buffer';
	var MSG_INVALID_SIGNER_KEY = 'key must be a string, a buffer or an object';

	var supportsKeyObjects = typeof crypto.createPublicKey === 'function';
	if (supportsKeyObjects) {
	  MSG_INVALID_VERIFIER_KEY += ' or a KeyObject';
	  MSG_INVALID_SECRET += 'or a KeyObject';
	}

	function checkIsPublicKey(key) {
	  if (Buffer$4.isBuffer(key)) {
	    return;
	  }

	  if (typeof key === 'string') {
	    return;
	  }

	  if (!supportsKeyObjects) {
	    throw typeError(MSG_INVALID_VERIFIER_KEY);
	  }

	  if (typeof key !== 'object') {
	    throw typeError(MSG_INVALID_VERIFIER_KEY);
	  }

	  if (typeof key.type !== 'string') {
	    throw typeError(MSG_INVALID_VERIFIER_KEY);
	  }

	  if (typeof key.asymmetricKeyType !== 'string') {
	    throw typeError(MSG_INVALID_VERIFIER_KEY);
	  }

	  if (typeof key.export !== 'function') {
	    throw typeError(MSG_INVALID_VERIFIER_KEY);
	  }
	}
	function checkIsPrivateKey(key) {
	  if (Buffer$4.isBuffer(key)) {
	    return;
	  }

	  if (typeof key === 'string') {
	    return;
	  }

	  if (typeof key === 'object') {
	    return;
	  }

	  throw typeError(MSG_INVALID_SIGNER_KEY);
	}
	function checkIsSecretKey(key) {
	  if (Buffer$4.isBuffer(key)) {
	    return;
	  }

	  if (typeof key === 'string') {
	    return key;
	  }

	  if (!supportsKeyObjects) {
	    throw typeError(MSG_INVALID_SECRET);
	  }

	  if (typeof key !== 'object') {
	    throw typeError(MSG_INVALID_SECRET);
	  }

	  if (key.type !== 'secret') {
	    throw typeError(MSG_INVALID_SECRET);
	  }

	  if (typeof key.export !== 'function') {
	    throw typeError(MSG_INVALID_SECRET);
	  }
	}

	function fromBase64(base64) {
	  return base64
	    .replace(/=/g, '')
	    .replace(/\+/g, '-')
	    .replace(/\//g, '_');
	}

	function toBase64(base64url) {
	  base64url = base64url.toString();

	  var padding = 4 - base64url.length % 4;
	  if (padding !== 4) {
	    for (var i = 0; i < padding; ++i) {
	      base64url += '=';
	    }
	  }

	  return base64url
	    .replace(/\-/g, '+')
	    .replace(/_/g, '/');
	}

	function typeError(template) {
	  var args = [].slice.call(arguments, 1);
	  var errMsg = util$2.format.bind(util$2, template).apply(null, args);
	  return new TypeError(errMsg);
	}

	function bufferOrString(obj) {
	  return Buffer$4.isBuffer(obj) || typeof obj === 'string';
	}

	function normalizeInput(thing) {
	  if (!bufferOrString(thing))
	    thing = JSON.stringify(thing);
	  return thing;
	}

	function createHmacSigner(bits) {
	  return function sign(thing, secret) {
	    checkIsSecretKey(secret);
	    thing = normalizeInput(thing);
	    var hmac = crypto.createHmac('sha' + bits, secret);
	    var sig = (hmac.update(thing), hmac.digest('base64'));
	    return fromBase64(sig);
	  }
	}

	function createHmacVerifier(bits) {
	  return function verify(thing, signature, secret) {
	    var computedSig = createHmacSigner(bits)(thing, secret);
	    return bufferEqual(Buffer$4.from(signature), Buffer$4.from(computedSig));
	  }
	}

	function createKeySigner(bits) {
	 return function sign(thing, privateKey) {
	    checkIsPrivateKey(privateKey);
	    thing = normalizeInput(thing);
	    // Even though we are specifying "RSA" here, this works with ECDSA
	    // keys as well.
	    var signer = crypto.createSign('RSA-SHA' + bits);
	    var sig = (signer.update(thing), signer.sign(privateKey, 'base64'));
	    return fromBase64(sig);
	  }
	}

	function createKeyVerifier(bits) {
	  return function verify(thing, signature, publicKey) {
	    checkIsPublicKey(publicKey);
	    thing = normalizeInput(thing);
	    signature = toBase64(signature);
	    var verifier = crypto.createVerify('RSA-SHA' + bits);
	    verifier.update(thing);
	    return verifier.verify(publicKey, signature, 'base64');
	  }
	}

	function createPSSKeySigner(bits) {
	  return function sign(thing, privateKey) {
	    checkIsPrivateKey(privateKey);
	    thing = normalizeInput(thing);
	    var signer = crypto.createSign('RSA-SHA' + bits);
	    var sig = (signer.update(thing), signer.sign({
	      key: privateKey,
	      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
	      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
	    }, 'base64'));
	    return fromBase64(sig);
	  }
	}

	function createPSSKeyVerifier(bits) {
	  return function verify(thing, signature, publicKey) {
	    checkIsPublicKey(publicKey);
	    thing = normalizeInput(thing);
	    signature = toBase64(signature);
	    var verifier = crypto.createVerify('RSA-SHA' + bits);
	    verifier.update(thing);
	    return verifier.verify({
	      key: publicKey,
	      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
	      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
	    }, signature, 'base64');
	  }
	}

	function createECDSASigner(bits) {
	  var inner = createKeySigner(bits);
	  return function sign() {
	    var signature = inner.apply(null, arguments);
	    signature = formatEcdsa.derToJose(signature, 'ES' + bits);
	    return signature;
	  };
	}

	function createECDSAVerifer(bits) {
	  var inner = createKeyVerifier(bits);
	  return function verify(thing, signature, publicKey) {
	    signature = formatEcdsa.joseToDer(signature, 'ES' + bits).toString('base64');
	    var result = inner(thing, signature, publicKey);
	    return result;
	  };
	}

	function createNoneSigner() {
	  return function sign() {
	    return '';
	  }
	}

	function createNoneVerifier() {
	  return function verify(thing, signature) {
	    return signature === '';
	  }
	}

	var jwa$2 = function jwa(algorithm) {
	  var signerFactories = {
	    hs: createHmacSigner,
	    rs: createKeySigner,
	    ps: createPSSKeySigner,
	    es: createECDSASigner,
	    none: createNoneSigner,
	  };
	  var verifierFactories = {
	    hs: createHmacVerifier,
	    rs: createKeyVerifier,
	    ps: createPSSKeyVerifier,
	    es: createECDSAVerifer,
	    none: createNoneVerifier,
	  };
	  var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/i);
	  if (!match)
	    throw typeError(MSG_INVALID_ALGORITHM, algorithm);
	  var algo = (match[1] || match[3]).toLowerCase();
	  var bits = match[2];

	  return {
	    sign: signerFactories[algo](bits),
	    verify: verifierFactories[algo](bits),
	  }
	};

	/*global module*/

	var Buffer$3 = require$$0.Buffer;

	var tostring = function toString(obj) {
	  if (typeof obj === 'string')
	    return obj;
	  if (typeof obj === 'number' || Buffer$3.isBuffer(obj))
	    return obj.toString();
	  return JSON.stringify(obj);
	};

	/*global module*/

	var Buffer$2 = safeBufferExports.Buffer;
	var DataStream$1 = dataStream;
	var jwa$1 = jwa$2;
	var Stream$1 = require$$3;
	var toString$1 = tostring;
	var util$1 = require$$5;

	function base64url(string, encoding) {
	  return Buffer$2
	    .from(string, encoding)
	    .toString('base64')
	    .replace(/=/g, '')
	    .replace(/\+/g, '-')
	    .replace(/\//g, '_');
	}

	function jwsSecuredInput(header, payload, encoding) {
	  encoding = encoding || 'utf8';
	  var encodedHeader = base64url(toString$1(header), 'binary');
	  var encodedPayload = base64url(toString$1(payload), encoding);
	  return util$1.format('%s.%s', encodedHeader, encodedPayload);
	}

	function jwsSign(opts) {
	  var header = opts.header;
	  var payload = opts.payload;
	  var secretOrKey = opts.secret || opts.privateKey;
	  var encoding = opts.encoding;
	  var algo = jwa$1(header.alg);
	  var securedInput = jwsSecuredInput(header, payload, encoding);
	  var signature = algo.sign(securedInput, secretOrKey);
	  return util$1.format('%s.%s', securedInput, signature);
	}

	function SignStream$1(opts) {
	  var secret = opts.secret||opts.privateKey||opts.key;
	  var secretStream = new DataStream$1(secret);
	  this.readable = true;
	  this.header = opts.header;
	  this.encoding = opts.encoding;
	  this.secret = this.privateKey = this.key = secretStream;
	  this.payload = new DataStream$1(opts.payload);
	  this.secret.once('close', function () {
	    if (!this.payload.writable && this.readable)
	      this.sign();
	  }.bind(this));

	  this.payload.once('close', function () {
	    if (!this.secret.writable && this.readable)
	      this.sign();
	  }.bind(this));
	}
	util$1.inherits(SignStream$1, Stream$1);

	SignStream$1.prototype.sign = function sign() {
	  try {
	    var signature = jwsSign({
	      header: this.header,
	      payload: this.payload.buffer,
	      secret: this.secret.buffer,
	      encoding: this.encoding
	    });
	    this.emit('done', signature);
	    this.emit('data', signature);
	    this.emit('end');
	    this.readable = false;
	    return signature;
	  } catch (e) {
	    this.readable = false;
	    this.emit('error', e);
	    this.emit('close');
	  }
	};

	SignStream$1.sign = jwsSign;

	var signStream = SignStream$1;

	/*global module*/

	var Buffer$1 = safeBufferExports.Buffer;
	var DataStream = dataStream;
	var jwa = jwa$2;
	var Stream = require$$3;
	var toString = tostring;
	var util = require$$5;
	var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

	function isObject$3(thing) {
	  return Object.prototype.toString.call(thing) === '[object Object]';
	}

	function safeJsonParse(thing) {
	  if (isObject$3(thing))
	    return thing;
	  try { return JSON.parse(thing); }
	  catch (e) { return undefined; }
	}

	function headerFromJWS(jwsSig) {
	  var encodedHeader = jwsSig.split('.', 1)[0];
	  return safeJsonParse(Buffer$1.from(encodedHeader, 'base64').toString('binary'));
	}

	function securedInputFromJWS(jwsSig) {
	  return jwsSig.split('.', 2).join('.');
	}

	function signatureFromJWS(jwsSig) {
	  return jwsSig.split('.')[2];
	}

	function payloadFromJWS(jwsSig, encoding) {
	  encoding = encoding || 'utf8';
	  var payload = jwsSig.split('.')[1];
	  return Buffer$1.from(payload, 'base64').toString(encoding);
	}

	function isValidJws(string) {
	  return JWS_REGEX.test(string) && !!headerFromJWS(string);
	}

	function jwsVerify(jwsSig, algorithm, secretOrKey) {
	  if (!algorithm) {
	    var err = new Error("Missing algorithm parameter for jws.verify");
	    err.code = "MISSING_ALGORITHM";
	    throw err;
	  }
	  jwsSig = toString(jwsSig);
	  var signature = signatureFromJWS(jwsSig);
	  var securedInput = securedInputFromJWS(jwsSig);
	  var algo = jwa(algorithm);
	  return algo.verify(securedInput, signature, secretOrKey);
	}

	function jwsDecode(jwsSig, opts) {
	  opts = opts || {};
	  jwsSig = toString(jwsSig);

	  if (!isValidJws(jwsSig))
	    return null;

	  var header = headerFromJWS(jwsSig);

	  if (!header)
	    return null;

	  var payload = payloadFromJWS(jwsSig);
	  if (header.typ === 'JWT' || opts.json)
	    payload = JSON.parse(payload, opts.encoding);

	  return {
	    header: header,
	    payload: payload,
	    signature: signatureFromJWS(jwsSig)
	  };
	}

	function VerifyStream$1(opts) {
	  opts = opts || {};
	  var secretOrKey = opts.secret||opts.publicKey||opts.key;
	  var secretStream = new DataStream(secretOrKey);
	  this.readable = true;
	  this.algorithm = opts.algorithm;
	  this.encoding = opts.encoding;
	  this.secret = this.publicKey = this.key = secretStream;
	  this.signature = new DataStream(opts.signature);
	  this.secret.once('close', function () {
	    if (!this.signature.writable && this.readable)
	      this.verify();
	  }.bind(this));

	  this.signature.once('close', function () {
	    if (!this.secret.writable && this.readable)
	      this.verify();
	  }.bind(this));
	}
	util.inherits(VerifyStream$1, Stream);
	VerifyStream$1.prototype.verify = function verify() {
	  try {
	    var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
	    var obj = jwsDecode(this.signature.buffer, this.encoding);
	    this.emit('done', valid, obj);
	    this.emit('data', valid);
	    this.emit('end');
	    this.readable = false;
	    return valid;
	  } catch (e) {
	    this.readable = false;
	    this.emit('error', e);
	    this.emit('close');
	  }
	};

	VerifyStream$1.decode = jwsDecode;
	VerifyStream$1.isValid = isValidJws;
	VerifyStream$1.verify = jwsVerify;

	var verifyStream = VerifyStream$1;

	/*global exports*/

	var SignStream = signStream;
	var VerifyStream = verifyStream;

	var ALGORITHMS = [
	  'HS256', 'HS384', 'HS512',
	  'RS256', 'RS384', 'RS512',
	  'PS256', 'PS384', 'PS512',
	  'ES256', 'ES384', 'ES512'
	];

	jws$3.ALGORITHMS = ALGORITHMS;
	jws$3.sign = SignStream.sign;
	jws$3.verify = VerifyStream.verify;
	jws$3.decode = VerifyStream.decode;
	jws$3.isValid = VerifyStream.isValid;
	jws$3.createSign = function createSign(opts) {
	  return new SignStream(opts);
	};
	jws$3.createVerify = function createVerify(opts) {
	  return new VerifyStream(opts);
	};

	var jws$2 = jws$3;

	var decode$1 = function (jwt, options) {
	  options = options || {};
	  var decoded = jws$2.decode(jwt, options);
	  if (!decoded) { return null; }
	  var payload = decoded.payload;

	  //try parse the payload
	  if(typeof payload === 'string') {
	    try {
	      var obj = JSON.parse(payload);
	      if(obj !== null && typeof obj === 'object') {
	        payload = obj;
	      }
	    } catch (e) { }
	  }

	  //return header if `complete` option is enabled.  header includes claims
	  //such as `kid` and `alg` used to select the key within a JWKS needed to
	  //verify the signature
	  if (options.complete === true) {
	    return {
	      header: decoded.header,
	      payload: payload,
	      signature: decoded.signature
	    };
	  }
	  return payload;
	};

	var JsonWebTokenError$3 = function (message, error) {
	  Error.call(this, message);
	  if(Error.captureStackTrace) {
	    Error.captureStackTrace(this, this.constructor);
	  }
	  this.name = 'JsonWebTokenError';
	  this.message = message;
	  if (error) this.inner = error;
	};

	JsonWebTokenError$3.prototype = Object.create(Error.prototype);
	JsonWebTokenError$3.prototype.constructor = JsonWebTokenError$3;

	var JsonWebTokenError_1 = JsonWebTokenError$3;

	var JsonWebTokenError$2 = JsonWebTokenError_1;

	var NotBeforeError$1 = function (message, date) {
	  JsonWebTokenError$2.call(this, message);
	  this.name = 'NotBeforeError';
	  this.date = date;
	};

	NotBeforeError$1.prototype = Object.create(JsonWebTokenError$2.prototype);

	NotBeforeError$1.prototype.constructor = NotBeforeError$1;

	var NotBeforeError_1 = NotBeforeError$1;

	var JsonWebTokenError$1 = JsonWebTokenError_1;

	var TokenExpiredError$1 = function (message, expiredAt) {
	  JsonWebTokenError$1.call(this, message);
	  this.name = 'TokenExpiredError';
	  this.expiredAt = expiredAt;
	};

	TokenExpiredError$1.prototype = Object.create(JsonWebTokenError$1.prototype);

	TokenExpiredError$1.prototype.constructor = TokenExpiredError$1;

	var TokenExpiredError_1 = TokenExpiredError$1;

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms$1 = function (val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse$7(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse$7(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}

	var ms = ms$1;

	var timespan$2 = function (time, iat) {
	  var timestamp = iat || Math.floor(Date.now() / 1000);

	  if (typeof time === 'string') {
	    var milliseconds = ms(time);
	    if (typeof milliseconds === 'undefined') {
	      return;
	    }
	    return Math.floor(timestamp + milliseconds / 1000);
	  } else if (typeof time === 'number') {
	    return timestamp + time;
	  } else {
	    return;
	  }

	};

	var re$2 = {exports: {}};

	// Note: this is the semver.org version of the spec that it implements
	// Not necessarily the package version of this code.
	const SEMVER_SPEC_VERSION = '2.0.0';

	const MAX_LENGTH$1 = 256;
	const MAX_SAFE_INTEGER$2 = Number.MAX_SAFE_INTEGER ||
	/* istanbul ignore next */ 9007199254740991;

	// Max safe segment length for coercion.
	const MAX_SAFE_COMPONENT_LENGTH = 16;

	// Max safe length for a build identifier. The max length minus 6 characters for
	// the shortest version with a build 0.0.0+BUILD.
	const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;

	const RELEASE_TYPES = [
	  'major',
	  'premajor',
	  'minor',
	  'preminor',
	  'patch',
	  'prepatch',
	  'prerelease',
	];

	var constants$1 = {
	  MAX_LENGTH: MAX_LENGTH$1,
	  MAX_SAFE_COMPONENT_LENGTH,
	  MAX_SAFE_BUILD_LENGTH,
	  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$2,
	  RELEASE_TYPES,
	  SEMVER_SPEC_VERSION,
	  FLAG_INCLUDE_PRERELEASE: 0b001,
	  FLAG_LOOSE: 0b010,
	};

	const debug$1 = (
	  typeof process === 'object' &&
	  process.env &&
	  process.env.NODE_DEBUG &&
	  /\bsemver\b/i.test(process.env.NODE_DEBUG)
	) ? (...args) => console.error('SEMVER', ...args)
	  : () => {};

	var debug_1 = debug$1;

	(function (module, exports) {
		const {
		  MAX_SAFE_COMPONENT_LENGTH,
		  MAX_SAFE_BUILD_LENGTH,
		  MAX_LENGTH,
		} = constants$1;
		const debug = debug_1;
		exports = module.exports = {};

		// The actual regexps go on exports.re
		const re = exports.re = [];
		const safeRe = exports.safeRe = [];
		const src = exports.src = [];
		const t = exports.t = {};
		let R = 0;

		const LETTERDASHNUMBER = '[a-zA-Z0-9-]';

		// Replace some greedy regex tokens to prevent regex dos issues. These regex are
		// used internally via the safeRe object since all inputs in this library get
		// normalized first to trim and collapse all extra whitespace. The original
		// regexes are exported for userland consumption and lower level usage. A
		// future breaking change could export the safer regex only with a note that
		// all input should have extra whitespace removed.
		const safeRegexReplacements = [
		  ['\\s', 1],
		  ['\\d', MAX_LENGTH],
		  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
		];

		const makeSafeRegex = (value) => {
		  for (const [token, max] of safeRegexReplacements) {
		    value = value
		      .split(`${token}*`).join(`${token}{0,${max}}`)
		      .split(`${token}+`).join(`${token}{1,${max}}`);
		  }
		  return value
		};

		const createToken = (name, value, isGlobal) => {
		  const safe = makeSafeRegex(value);
		  const index = R++;
		  debug(name, index, value);
		  t[name] = index;
		  src[index] = value;
		  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
		  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined);
		};

		// The following Regular Expressions can be used for tokenizing,
		// validating, and parsing SemVer version strings.

		// ## Numeric Identifier
		// A single `0`, or a non-zero digit followed by zero or more digits.

		createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
		createToken('NUMERICIDENTIFIERLOOSE', '\\d+');

		// ## Non-numeric Identifier
		// Zero or more digits, followed by a letter or hyphen, and then zero or
		// more letters, digits, or hyphens.

		createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);

		// ## Main Version
		// Three dot-separated numeric identifiers.

		createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
		                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
		                   `(${src[t.NUMERICIDENTIFIER]})`);

		createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
		                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

		// ## Pre-release Version Identifier
		// A numeric identifier, or a non-numeric identifier.

		createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
	}|${src[t.NONNUMERICIDENTIFIER]})`);

		createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
	}|${src[t.NONNUMERICIDENTIFIER]})`);

		// ## Pre-release Version
		// Hyphen, followed by one or more dot-separated pre-release version
		// identifiers.

		createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
	}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

		createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
	}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

		// ## Build Metadata Identifier
		// Any combination of digits, letters, or hyphens.

		createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`);

		// ## Build Metadata
		// Plus sign, followed by one or more period-separated build metadata
		// identifiers.

		createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
	}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

		// ## Full Version String
		// A main version, followed optionally by a pre-release version and
		// build metadata.

		// Note that the only major, minor, patch, and pre-release sections of
		// the version string are capturing groups.  The build metadata is not a
		// capturing group, because it should not ever be used in version
		// comparison.

		createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
	}${src[t.PRERELEASE]}?${
	  src[t.BUILD]}?`);

		createToken('FULL', `^${src[t.FULLPLAIN]}$`);

		// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
		// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
		// common in the npm registry.
		createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
	}${src[t.PRERELEASELOOSE]}?${
	  src[t.BUILD]}?`);

		createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

		createToken('GTLT', '((?:<|>)?=?)');

		// Something like "2.*" or "1.2.x".
		// Note that "x.x" is a valid xRange identifer, meaning "any version"
		// Only the first item is strictly required.
		createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
		createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

		createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
		                   `(?:${src[t.PRERELEASE]})?${
	                     src[t.BUILD]}?` +
		                   `)?)?`);

		createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
		                        `(?:${src[t.PRERELEASELOOSE]})?${
	                          src[t.BUILD]}?` +
		                        `)?)?`);

		createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
		createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

		// Coercion.
		// Extract anything that could conceivably be a part of a valid semver
		createToken('COERCEPLAIN', `${'(^|[^\\d])' +
	              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
		              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
		createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
		createToken('COERCEFULL', src[t.COERCEPLAIN] +
		              `(?:${src[t.PRERELEASE]})?` +
		              `(?:${src[t.BUILD]})?` +
		              `(?:$|[^\\d])`);
		createToken('COERCERTL', src[t.COERCE], true);
		createToken('COERCERTLFULL', src[t.COERCEFULL], true);

		// Tilde ranges.
		// Meaning is "reasonably at or greater than"
		createToken('LONETILDE', '(?:~>?)');

		createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
		exports.tildeTrimReplace = '$1~';

		createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
		createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

		// Caret ranges.
		// Meaning is "at least and backwards compatible with"
		createToken('LONECARET', '(?:\\^)');

		createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
		exports.caretTrimReplace = '$1^';

		createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
		createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

		// A simple gt/lt/eq thing, or just "" to indicate "any version"
		createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
		createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

		// An expression to strip any whitespace between the gtlt and the thing
		// it modifies, so that `> 1.2.3` ==> `>1.2.3`
		createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
	}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
		exports.comparatorTrimReplace = '$1$2$3';

		// Something like `1.2.3 - 1.2.4`
		// Note that these all use the loose form, because they'll be
		// checked against either the strict or loose comparator form
		// later.
		createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
		                   `\\s+-\\s+` +
		                   `(${src[t.XRANGEPLAIN]})` +
		                   `\\s*$`);

		createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
		                        `\\s+-\\s+` +
		                        `(${src[t.XRANGEPLAINLOOSE]})` +
		                        `\\s*$`);

		// Star ranges basically just allow anything at all.
		createToken('STAR', '(<|>)?=?\\s*\\*');
		// >=0.0.0 is like a star
		createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$');
		createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$'); 
	} (re$2, re$2.exports));

	var reExports = re$2.exports;

	// parse out just the options we care about
	const looseOption = Object.freeze({ loose: true });
	const emptyOpts = Object.freeze({ });
	const parseOptions$1 = options => {
	  if (!options) {
	    return emptyOpts
	  }

	  if (typeof options !== 'object') {
	    return looseOption
	  }

	  return options
	};
	var parseOptions_1 = parseOptions$1;

	const numeric = /^[0-9]+$/;
	const compareIdentifiers$1 = (a, b) => {
	  const anum = numeric.test(a);
	  const bnum = numeric.test(b);

	  if (anum && bnum) {
	    a = +a;
	    b = +b;
	  }

	  return a === b ? 0
	    : (anum && !bnum) ? -1
	    : (bnum && !anum) ? 1
	    : a < b ? -1
	    : 1
	};

	const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);

	var identifiers$1 = {
	  compareIdentifiers: compareIdentifiers$1,
	  rcompareIdentifiers,
	};

	const debug = debug_1;
	const { MAX_LENGTH, MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1 } = constants$1;
	const { safeRe: re$1, t: t$1 } = reExports;

	const parseOptions = parseOptions_1;
	const { compareIdentifiers } = identifiers$1;
	let SemVer$d = class SemVer {
	  constructor (version, options) {
	    options = parseOptions(options);

	    if (version instanceof SemVer) {
	      if (version.loose === !!options.loose &&
	          version.includePrerelease === !!options.includePrerelease) {
	        return version
	      } else {
	        version = version.version;
	      }
	    } else if (typeof version !== 'string') {
	      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
	    }

	    if (version.length > MAX_LENGTH) {
	      throw new TypeError(
	        `version is longer than ${MAX_LENGTH} characters`
	      )
	    }

	    debug('SemVer', version, options);
	    this.options = options;
	    this.loose = !!options.loose;
	    // this isn't actually relevant for versions, but keep it so that we
	    // don't run into trouble passing this.options around.
	    this.includePrerelease = !!options.includePrerelease;

	    const m = version.trim().match(options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);

	    if (!m) {
	      throw new TypeError(`Invalid Version: ${version}`)
	    }

	    this.raw = version;

	    // these are actually numbers
	    this.major = +m[1];
	    this.minor = +m[2];
	    this.patch = +m[3];

	    if (this.major > MAX_SAFE_INTEGER$1 || this.major < 0) {
	      throw new TypeError('Invalid major version')
	    }

	    if (this.minor > MAX_SAFE_INTEGER$1 || this.minor < 0) {
	      throw new TypeError('Invalid minor version')
	    }

	    if (this.patch > MAX_SAFE_INTEGER$1 || this.patch < 0) {
	      throw new TypeError('Invalid patch version')
	    }

	    // numberify any prerelease numeric ids
	    if (!m[4]) {
	      this.prerelease = [];
	    } else {
	      this.prerelease = m[4].split('.').map((id) => {
	        if (/^[0-9]+$/.test(id)) {
	          const num = +id;
	          if (num >= 0 && num < MAX_SAFE_INTEGER$1) {
	            return num
	          }
	        }
	        return id
	      });
	    }

	    this.build = m[5] ? m[5].split('.') : [];
	    this.format();
	  }

	  format () {
	    this.version = `${this.major}.${this.minor}.${this.patch}`;
	    if (this.prerelease.length) {
	      this.version += `-${this.prerelease.join('.')}`;
	    }
	    return this.version
	  }

	  toString () {
	    return this.version
	  }

	  compare (other) {
	    debug('SemVer.compare', this.version, this.options, other);
	    if (!(other instanceof SemVer)) {
	      if (typeof other === 'string' && other === this.version) {
	        return 0
	      }
	      other = new SemVer(other, this.options);
	    }

	    if (other.version === this.version) {
	      return 0
	    }

	    return this.compareMain(other) || this.comparePre(other)
	  }

	  compareMain (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    return (
	      compareIdentifiers(this.major, other.major) ||
	      compareIdentifiers(this.minor, other.minor) ||
	      compareIdentifiers(this.patch, other.patch)
	    )
	  }

	  comparePre (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    // NOT having a prerelease is > having one
	    if (this.prerelease.length && !other.prerelease.length) {
	      return -1
	    } else if (!this.prerelease.length && other.prerelease.length) {
	      return 1
	    } else if (!this.prerelease.length && !other.prerelease.length) {
	      return 0
	    }

	    let i = 0;
	    do {
	      const a = this.prerelease[i];
	      const b = other.prerelease[i];
	      debug('prerelease compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers(a, b)
	      }
	    } while (++i)
	  }

	  compareBuild (other) {
	    if (!(other instanceof SemVer)) {
	      other = new SemVer(other, this.options);
	    }

	    let i = 0;
	    do {
	      const a = this.build[i];
	      const b = other.build[i];
	      debug('prerelease compare', i, a, b);
	      if (a === undefined && b === undefined) {
	        return 0
	      } else if (b === undefined) {
	        return 1
	      } else if (a === undefined) {
	        return -1
	      } else if (a === b) {
	        continue
	      } else {
	        return compareIdentifiers(a, b)
	      }
	    } while (++i)
	  }

	  // preminor will bump the version up to the next minor release, and immediately
	  // down to pre-release. premajor and prepatch work the same way.
	  inc (release, identifier, identifierBase) {
	    switch (release) {
	      case 'premajor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor = 0;
	        this.major++;
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'preminor':
	        this.prerelease.length = 0;
	        this.patch = 0;
	        this.minor++;
	        this.inc('pre', identifier, identifierBase);
	        break
	      case 'prepatch':
	        // If this is already a prerelease, it will bump to the next version
	        // drop any prereleases that might already exist, since they are not
	        // relevant at this point.
	        this.prerelease.length = 0;
	        this.inc('patch', identifier, identifierBase);
	        this.inc('pre', identifier, identifierBase);
	        break
	      // If the input is a non-prerelease version, this acts the same as
	      // prepatch.
	      case 'prerelease':
	        if (this.prerelease.length === 0) {
	          this.inc('patch', identifier, identifierBase);
	        }
	        this.inc('pre', identifier, identifierBase);
	        break

	      case 'major':
	        // If this is a pre-major version, bump up to the same major version.
	        // Otherwise increment major.
	        // 1.0.0-5 bumps to 1.0.0
	        // 1.1.0 bumps to 2.0.0
	        if (
	          this.minor !== 0 ||
	          this.patch !== 0 ||
	          this.prerelease.length === 0
	        ) {
	          this.major++;
	        }
	        this.minor = 0;
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'minor':
	        // If this is a pre-minor version, bump up to the same minor version.
	        // Otherwise increment minor.
	        // 1.2.0-5 bumps to 1.2.0
	        // 1.2.1 bumps to 1.3.0
	        if (this.patch !== 0 || this.prerelease.length === 0) {
	          this.minor++;
	        }
	        this.patch = 0;
	        this.prerelease = [];
	        break
	      case 'patch':
	        // If this is not a pre-release version, it will increment the patch.
	        // If it is a pre-release it will bump up to the same patch version.
	        // 1.2.0-5 patches to 1.2.0
	        // 1.2.0 patches to 1.2.1
	        if (this.prerelease.length === 0) {
	          this.patch++;
	        }
	        this.prerelease = [];
	        break
	      // This probably shouldn't be used publicly.
	      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
	      case 'pre': {
	        const base = Number(identifierBase) ? 1 : 0;

	        if (!identifier && identifierBase === false) {
	          throw new Error('invalid increment argument: identifier is empty')
	        }

	        if (this.prerelease.length === 0) {
	          this.prerelease = [base];
	        } else {
	          let i = this.prerelease.length;
	          while (--i >= 0) {
	            if (typeof this.prerelease[i] === 'number') {
	              this.prerelease[i]++;
	              i = -2;
	            }
	          }
	          if (i === -1) {
	            // didn't increment anything
	            if (identifier === this.prerelease.join('.') && identifierBase === false) {
	              throw new Error('invalid increment argument: identifier already exists')
	            }
	            this.prerelease.push(base);
	          }
	        }
	        if (identifier) {
	          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
	          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
	          let prerelease = [identifier, base];
	          if (identifierBase === false) {
	            prerelease = [identifier];
	          }
	          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
	            if (isNaN(this.prerelease[1])) {
	              this.prerelease = prerelease;
	            }
	          } else {
	            this.prerelease = prerelease;
	          }
	        }
	        break
	      }
	      default:
	        throw new Error(`invalid increment argument: ${release}`)
	    }
	    this.raw = this.format();
	    if (this.build.length) {
	      this.raw += `+${this.build.join('.')}`;
	    }
	    return this
	  }
	};

	var semver$4 = SemVer$d;

	const SemVer$c = semver$4;
	const parse$6 = (version, options, throwErrors = false) => {
	  if (version instanceof SemVer$c) {
	    return version
	  }
	  try {
	    return new SemVer$c(version, options)
	  } catch (er) {
	    if (!throwErrors) {
	      return null
	    }
	    throw er
	  }
	};

	var parse_1 = parse$6;

	const parse$5 = parse_1;
	const valid$2 = (version, options) => {
	  const v = parse$5(version, options);
	  return v ? v.version : null
	};
	var valid_1 = valid$2;

	const parse$4 = parse_1;
	const clean$1 = (version, options) => {
	  const s = parse$4(version.trim().replace(/^[=v]+/, ''), options);
	  return s ? s.version : null
	};
	var clean_1 = clean$1;

	const SemVer$b = semver$4;

	const inc$1 = (version, release, options, identifier, identifierBase) => {
	  if (typeof (options) === 'string') {
	    identifierBase = identifier;
	    identifier = options;
	    options = undefined;
	  }

	  try {
	    return new SemVer$b(
	      version instanceof SemVer$b ? version.version : version,
	      options
	    ).inc(release, identifier, identifierBase).version
	  } catch (er) {
	    return null
	  }
	};
	var inc_1 = inc$1;

	const parse$3 = parse_1;

	const diff$1 = (version1, version2) => {
	  const v1 = parse$3(version1, null, true);
	  const v2 = parse$3(version2, null, true);
	  const comparison = v1.compare(v2);

	  if (comparison === 0) {
	    return null
	  }

	  const v1Higher = comparison > 0;
	  const highVersion = v1Higher ? v1 : v2;
	  const lowVersion = v1Higher ? v2 : v1;
	  const highHasPre = !!highVersion.prerelease.length;
	  const lowHasPre = !!lowVersion.prerelease.length;

	  if (lowHasPre && !highHasPre) {
	    // Going from prerelease -> no prerelease requires some special casing

	    // If the low version has only a major, then it will always be a major
	    // Some examples:
	    // 1.0.0-1 -> 1.0.0
	    // 1.0.0-1 -> 1.1.1
	    // 1.0.0-1 -> 2.0.0
	    if (!lowVersion.patch && !lowVersion.minor) {
	      return 'major'
	    }

	    // Otherwise it can be determined by checking the high version

	    if (highVersion.patch) {
	      // anything higher than a patch bump would result in the wrong version
	      return 'patch'
	    }

	    if (highVersion.minor) {
	      // anything higher than a minor bump would result in the wrong version
	      return 'minor'
	    }

	    // bumping major/minor/patch all have same result
	    return 'major'
	  }

	  // add the `pre` prefix if we are going to a prerelease version
	  const prefix = highHasPre ? 'pre' : '';

	  if (v1.major !== v2.major) {
	    return prefix + 'major'
	  }

	  if (v1.minor !== v2.minor) {
	    return prefix + 'minor'
	  }

	  if (v1.patch !== v2.patch) {
	    return prefix + 'patch'
	  }

	  // high and low are preleases
	  return 'prerelease'
	};

	var diff_1 = diff$1;

	const SemVer$a = semver$4;
	const major$1 = (a, loose) => new SemVer$a(a, loose).major;
	var major_1 = major$1;

	const SemVer$9 = semver$4;
	const minor$1 = (a, loose) => new SemVer$9(a, loose).minor;
	var minor_1 = minor$1;

	const SemVer$8 = semver$4;
	const patch$1 = (a, loose) => new SemVer$8(a, loose).patch;
	var patch_1 = patch$1;

	const parse$2 = parse_1;
	const prerelease$1 = (version, options) => {
	  const parsed = parse$2(version, options);
	  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
	};
	var prerelease_1 = prerelease$1;

	const SemVer$7 = semver$4;
	const compare$b = (a, b, loose) =>
	  new SemVer$7(a, loose).compare(new SemVer$7(b, loose));

	var compare_1 = compare$b;

	const compare$a = compare_1;
	const rcompare$1 = (a, b, loose) => compare$a(b, a, loose);
	var rcompare_1 = rcompare$1;

	const compare$9 = compare_1;
	const compareLoose$1 = (a, b) => compare$9(a, b, true);
	var compareLoose_1 = compareLoose$1;

	const SemVer$6 = semver$4;
	const compareBuild$3 = (a, b, loose) => {
	  const versionA = new SemVer$6(a, loose);
	  const versionB = new SemVer$6(b, loose);
	  return versionA.compare(versionB) || versionA.compareBuild(versionB)
	};
	var compareBuild_1 = compareBuild$3;

	const compareBuild$2 = compareBuild_1;
	const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$2(a, b, loose));
	var sort_1 = sort$1;

	const compareBuild$1 = compareBuild_1;
	const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$1(b, a, loose));
	var rsort_1 = rsort$1;

	const compare$8 = compare_1;
	const gt$4 = (a, b, loose) => compare$8(a, b, loose) > 0;
	var gt_1 = gt$4;

	const compare$7 = compare_1;
	const lt$3 = (a, b, loose) => compare$7(a, b, loose) < 0;
	var lt_1 = lt$3;

	const compare$6 = compare_1;
	const eq$2 = (a, b, loose) => compare$6(a, b, loose) === 0;
	var eq_1 = eq$2;

	const compare$5 = compare_1;
	const neq$2 = (a, b, loose) => compare$5(a, b, loose) !== 0;
	var neq_1 = neq$2;

	const compare$4 = compare_1;
	const gte$3 = (a, b, loose) => compare$4(a, b, loose) >= 0;
	var gte_1 = gte$3;

	const compare$3 = compare_1;
	const lte$3 = (a, b, loose) => compare$3(a, b, loose) <= 0;
	var lte_1 = lte$3;

	const eq$1 = eq_1;
	const neq$1 = neq_1;
	const gt$3 = gt_1;
	const gte$2 = gte_1;
	const lt$2 = lt_1;
	const lte$2 = lte_1;

	const cmp$1 = (a, op, b, loose) => {
	  switch (op) {
	    case '===':
	      if (typeof a === 'object') {
	        a = a.version;
	      }
	      if (typeof b === 'object') {
	        b = b.version;
	      }
	      return a === b

	    case '!==':
	      if (typeof a === 'object') {
	        a = a.version;
	      }
	      if (typeof b === 'object') {
	        b = b.version;
	      }
	      return a !== b

	    case '':
	    case '=':
	    case '==':
	      return eq$1(a, b, loose)

	    case '!=':
	      return neq$1(a, b, loose)

	    case '>':
	      return gt$3(a, b, loose)

	    case '>=':
	      return gte$2(a, b, loose)

	    case '<':
	      return lt$2(a, b, loose)

	    case '<=':
	      return lte$2(a, b, loose)

	    default:
	      throw new TypeError(`Invalid operator: ${op}`)
	  }
	};
	var cmp_1 = cmp$1;

	const SemVer$5 = semver$4;
	const parse$1 = parse_1;
	const { safeRe: re, t } = reExports;

	const coerce$1 = (version, options) => {
	  if (version instanceof SemVer$5) {
	    return version
	  }

	  if (typeof version === 'number') {
	    version = String(version);
	  }

	  if (typeof version !== 'string') {
	    return null
	  }

	  options = options || {};

	  let match = null;
	  if (!options.rtl) {
	    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
	  } else {
	    // Find the right-most coercible string that does not share
	    // a terminus with a more left-ward coercible string.
	    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
	    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
	    //
	    // Walk through the string checking with a /g regexp
	    // Manually set the index so as to pick up overlapping matches.
	    // Stop when we get a match that ends at the string end, since no
	    // coercible string can be more right-ward without the same terminus.
	    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
	    let next;
	    while ((next = coerceRtlRegex.exec(version)) &&
	        (!match || match.index + match[0].length !== version.length)
	    ) {
	      if (!match ||
	            next.index + next[0].length !== match.index + match[0].length) {
	        match = next;
	      }
	      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
	    }
	    // leave it in a clean state
	    coerceRtlRegex.lastIndex = -1;
	  }

	  if (match === null) {
	    return null
	  }

	  const major = match[2];
	  const minor = match[3] || '0';
	  const patch = match[4] || '0';
	  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : '';
	  const build = options.includePrerelease && match[6] ? `+${match[6]}` : '';

	  return parse$1(`${major}.${minor}.${patch}${prerelease}${build}`, options)
	};
	var coerce_1 = coerce$1;

	var iterator;
	var hasRequiredIterator;

	function requireIterator () {
		if (hasRequiredIterator) return iterator;
		hasRequiredIterator = 1;
		iterator = function (Yallist) {
		  Yallist.prototype[Symbol.iterator] = function* () {
		    for (let walker = this.head; walker; walker = walker.next) {
		      yield walker.value;
		    }
		  };
		};
		return iterator;
	}

	var yallist;
	var hasRequiredYallist;

	function requireYallist () {
		if (hasRequiredYallist) return yallist;
		hasRequiredYallist = 1;
		yallist = Yallist;

		Yallist.Node = Node;
		Yallist.create = Yallist;

		function Yallist (list) {
		  var self = this;
		  if (!(self instanceof Yallist)) {
		    self = new Yallist();
		  }

		  self.tail = null;
		  self.head = null;
		  self.length = 0;

		  if (list && typeof list.forEach === 'function') {
		    list.forEach(function (item) {
		      self.push(item);
		    });
		  } else if (arguments.length > 0) {
		    for (var i = 0, l = arguments.length; i < l; i++) {
		      self.push(arguments[i]);
		    }
		  }

		  return self
		}

		Yallist.prototype.removeNode = function (node) {
		  if (node.list !== this) {
		    throw new Error('removing node which does not belong to this list')
		  }

		  var next = node.next;
		  var prev = node.prev;

		  if (next) {
		    next.prev = prev;
		  }

		  if (prev) {
		    prev.next = next;
		  }

		  if (node === this.head) {
		    this.head = next;
		  }
		  if (node === this.tail) {
		    this.tail = prev;
		  }

		  node.list.length--;
		  node.next = null;
		  node.prev = null;
		  node.list = null;

		  return next
		};

		Yallist.prototype.unshiftNode = function (node) {
		  if (node === this.head) {
		    return
		  }

		  if (node.list) {
		    node.list.removeNode(node);
		  }

		  var head = this.head;
		  node.list = this;
		  node.next = head;
		  if (head) {
		    head.prev = node;
		  }

		  this.head = node;
		  if (!this.tail) {
		    this.tail = node;
		  }
		  this.length++;
		};

		Yallist.prototype.pushNode = function (node) {
		  if (node === this.tail) {
		    return
		  }

		  if (node.list) {
		    node.list.removeNode(node);
		  }

		  var tail = this.tail;
		  node.list = this;
		  node.prev = tail;
		  if (tail) {
		    tail.next = node;
		  }

		  this.tail = node;
		  if (!this.head) {
		    this.head = node;
		  }
		  this.length++;
		};

		Yallist.prototype.push = function () {
		  for (var i = 0, l = arguments.length; i < l; i++) {
		    push(this, arguments[i]);
		  }
		  return this.length
		};

		Yallist.prototype.unshift = function () {
		  for (var i = 0, l = arguments.length; i < l; i++) {
		    unshift(this, arguments[i]);
		  }
		  return this.length
		};

		Yallist.prototype.pop = function () {
		  if (!this.tail) {
		    return undefined
		  }

		  var res = this.tail.value;
		  this.tail = this.tail.prev;
		  if (this.tail) {
		    this.tail.next = null;
		  } else {
		    this.head = null;
		  }
		  this.length--;
		  return res
		};

		Yallist.prototype.shift = function () {
		  if (!this.head) {
		    return undefined
		  }

		  var res = this.head.value;
		  this.head = this.head.next;
		  if (this.head) {
		    this.head.prev = null;
		  } else {
		    this.tail = null;
		  }
		  this.length--;
		  return res
		};

		Yallist.prototype.forEach = function (fn, thisp) {
		  thisp = thisp || this;
		  for (var walker = this.head, i = 0; walker !== null; i++) {
		    fn.call(thisp, walker.value, i, this);
		    walker = walker.next;
		  }
		};

		Yallist.prototype.forEachReverse = function (fn, thisp) {
		  thisp = thisp || this;
		  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
		    fn.call(thisp, walker.value, i, this);
		    walker = walker.prev;
		  }
		};

		Yallist.prototype.get = function (n) {
		  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
		    // abort out of the list early if we hit a cycle
		    walker = walker.next;
		  }
		  if (i === n && walker !== null) {
		    return walker.value
		  }
		};

		Yallist.prototype.getReverse = function (n) {
		  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
		    // abort out of the list early if we hit a cycle
		    walker = walker.prev;
		  }
		  if (i === n && walker !== null) {
		    return walker.value
		  }
		};

		Yallist.prototype.map = function (fn, thisp) {
		  thisp = thisp || this;
		  var res = new Yallist();
		  for (var walker = this.head; walker !== null;) {
		    res.push(fn.call(thisp, walker.value, this));
		    walker = walker.next;
		  }
		  return res
		};

		Yallist.prototype.mapReverse = function (fn, thisp) {
		  thisp = thisp || this;
		  var res = new Yallist();
		  for (var walker = this.tail; walker !== null;) {
		    res.push(fn.call(thisp, walker.value, this));
		    walker = walker.prev;
		  }
		  return res
		};

		Yallist.prototype.reduce = function (fn, initial) {
		  var acc;
		  var walker = this.head;
		  if (arguments.length > 1) {
		    acc = initial;
		  } else if (this.head) {
		    walker = this.head.next;
		    acc = this.head.value;
		  } else {
		    throw new TypeError('Reduce of empty list with no initial value')
		  }

		  for (var i = 0; walker !== null; i++) {
		    acc = fn(acc, walker.value, i);
		    walker = walker.next;
		  }

		  return acc
		};

		Yallist.prototype.reduceReverse = function (fn, initial) {
		  var acc;
		  var walker = this.tail;
		  if (arguments.length > 1) {
		    acc = initial;
		  } else if (this.tail) {
		    walker = this.tail.prev;
		    acc = this.tail.value;
		  } else {
		    throw new TypeError('Reduce of empty list with no initial value')
		  }

		  for (var i = this.length - 1; walker !== null; i--) {
		    acc = fn(acc, walker.value, i);
		    walker = walker.prev;
		  }

		  return acc
		};

		Yallist.prototype.toArray = function () {
		  var arr = new Array(this.length);
		  for (var i = 0, walker = this.head; walker !== null; i++) {
		    arr[i] = walker.value;
		    walker = walker.next;
		  }
		  return arr
		};

		Yallist.prototype.toArrayReverse = function () {
		  var arr = new Array(this.length);
		  for (var i = 0, walker = this.tail; walker !== null; i++) {
		    arr[i] = walker.value;
		    walker = walker.prev;
		  }
		  return arr
		};

		Yallist.prototype.slice = function (from, to) {
		  to = to || this.length;
		  if (to < 0) {
		    to += this.length;
		  }
		  from = from || 0;
		  if (from < 0) {
		    from += this.length;
		  }
		  var ret = new Yallist();
		  if (to < from || to < 0) {
		    return ret
		  }
		  if (from < 0) {
		    from = 0;
		  }
		  if (to > this.length) {
		    to = this.length;
		  }
		  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
		    walker = walker.next;
		  }
		  for (; walker !== null && i < to; i++, walker = walker.next) {
		    ret.push(walker.value);
		  }
		  return ret
		};

		Yallist.prototype.sliceReverse = function (from, to) {
		  to = to || this.length;
		  if (to < 0) {
		    to += this.length;
		  }
		  from = from || 0;
		  if (from < 0) {
		    from += this.length;
		  }
		  var ret = new Yallist();
		  if (to < from || to < 0) {
		    return ret
		  }
		  if (from < 0) {
		    from = 0;
		  }
		  if (to > this.length) {
		    to = this.length;
		  }
		  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
		    walker = walker.prev;
		  }
		  for (; walker !== null && i > from; i--, walker = walker.prev) {
		    ret.push(walker.value);
		  }
		  return ret
		};

		Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
		  if (start > this.length) {
		    start = this.length - 1;
		  }
		  if (start < 0) {
		    start = this.length + start;
		  }

		  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
		    walker = walker.next;
		  }

		  var ret = [];
		  for (var i = 0; walker && i < deleteCount; i++) {
		    ret.push(walker.value);
		    walker = this.removeNode(walker);
		  }
		  if (walker === null) {
		    walker = this.tail;
		  }

		  if (walker !== this.head && walker !== this.tail) {
		    walker = walker.prev;
		  }

		  for (var i = 0; i < nodes.length; i++) {
		    walker = insert(this, walker, nodes[i]);
		  }
		  return ret;
		};

		Yallist.prototype.reverse = function () {
		  var head = this.head;
		  var tail = this.tail;
		  for (var walker = head; walker !== null; walker = walker.prev) {
		    var p = walker.prev;
		    walker.prev = walker.next;
		    walker.next = p;
		  }
		  this.head = tail;
		  this.tail = head;
		  return this
		};

		function insert (self, node, value) {
		  var inserted = node === self.head ?
		    new Node(value, null, node, self) :
		    new Node(value, node, node.next, self);

		  if (inserted.next === null) {
		    self.tail = inserted;
		  }
		  if (inserted.prev === null) {
		    self.head = inserted;
		  }

		  self.length++;

		  return inserted
		}

		function push (self, item) {
		  self.tail = new Node(item, self.tail, null, self);
		  if (!self.head) {
		    self.head = self.tail;
		  }
		  self.length++;
		}

		function unshift (self, item) {
		  self.head = new Node(item, null, self.head, self);
		  if (!self.tail) {
		    self.tail = self.head;
		  }
		  self.length++;
		}

		function Node (value, prev, next, list) {
		  if (!(this instanceof Node)) {
		    return new Node(value, prev, next, list)
		  }

		  this.list = list;
		  this.value = value;

		  if (prev) {
		    prev.next = this;
		    this.prev = prev;
		  } else {
		    this.prev = null;
		  }

		  if (next) {
		    next.prev = this;
		    this.next = next;
		  } else {
		    this.next = null;
		  }
		}

		try {
		  // add if support for Symbol.iterator is present
		  requireIterator()(Yallist);
		} catch (er) {}
		return yallist;
	}

	var lruCache;
	var hasRequiredLruCache;

	function requireLruCache () {
		if (hasRequiredLruCache) return lruCache;
		hasRequiredLruCache = 1;

		// A linked list to keep track of recently-used-ness
		const Yallist = requireYallist();

		const MAX = Symbol('max');
		const LENGTH = Symbol('length');
		const LENGTH_CALCULATOR = Symbol('lengthCalculator');
		const ALLOW_STALE = Symbol('allowStale');
		const MAX_AGE = Symbol('maxAge');
		const DISPOSE = Symbol('dispose');
		const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
		const LRU_LIST = Symbol('lruList');
		const CACHE = Symbol('cache');
		const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

		const naiveLength = () => 1;

		// lruList is a yallist where the head is the youngest
		// item, and the tail is the oldest.  the list contains the Hit
		// objects as the entries.
		// Each Hit object has a reference to its Yallist.Node.  This
		// never changes.
		//
		// cache is a Map (or PseudoMap) that matches the keys to
		// the Yallist.Node object.
		class LRUCache {
		  constructor (options) {
		    if (typeof options === 'number')
		      options = { max: options };

		    if (!options)
		      options = {};

		    if (options.max && (typeof options.max !== 'number' || options.max < 0))
		      throw new TypeError('max must be a non-negative number')
		    // Kind of weird to have a default max of Infinity, but oh well.
		    this[MAX] = options.max || Infinity;

		    const lc = options.length || naiveLength;
		    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
		    this[ALLOW_STALE] = options.stale || false;
		    if (options.maxAge && typeof options.maxAge !== 'number')
		      throw new TypeError('maxAge must be a number')
		    this[MAX_AGE] = options.maxAge || 0;
		    this[DISPOSE] = options.dispose;
		    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
		    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
		    this.reset();
		  }

		  // resize the cache when the max changes.
		  set max (mL) {
		    if (typeof mL !== 'number' || mL < 0)
		      throw new TypeError('max must be a non-negative number')

		    this[MAX] = mL || Infinity;
		    trim(this);
		  }
		  get max () {
		    return this[MAX]
		  }

		  set allowStale (allowStale) {
		    this[ALLOW_STALE] = !!allowStale;
		  }
		  get allowStale () {
		    return this[ALLOW_STALE]
		  }

		  set maxAge (mA) {
		    if (typeof mA !== 'number')
		      throw new TypeError('maxAge must be a non-negative number')

		    this[MAX_AGE] = mA;
		    trim(this);
		  }
		  get maxAge () {
		    return this[MAX_AGE]
		  }

		  // resize the cache when the lengthCalculator changes.
		  set lengthCalculator (lC) {
		    if (typeof lC !== 'function')
		      lC = naiveLength;

		    if (lC !== this[LENGTH_CALCULATOR]) {
		      this[LENGTH_CALCULATOR] = lC;
		      this[LENGTH] = 0;
		      this[LRU_LIST].forEach(hit => {
		        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
		        this[LENGTH] += hit.length;
		      });
		    }
		    trim(this);
		  }
		  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

		  get length () { return this[LENGTH] }
		  get itemCount () { return this[LRU_LIST].length }

		  rforEach (fn, thisp) {
		    thisp = thisp || this;
		    for (let walker = this[LRU_LIST].tail; walker !== null;) {
		      const prev = walker.prev;
		      forEachStep(this, fn, walker, thisp);
		      walker = prev;
		    }
		  }

		  forEach (fn, thisp) {
		    thisp = thisp || this;
		    for (let walker = this[LRU_LIST].head; walker !== null;) {
		      const next = walker.next;
		      forEachStep(this, fn, walker, thisp);
		      walker = next;
		    }
		  }

		  keys () {
		    return this[LRU_LIST].toArray().map(k => k.key)
		  }

		  values () {
		    return this[LRU_LIST].toArray().map(k => k.value)
		  }

		  reset () {
		    if (this[DISPOSE] &&
		        this[LRU_LIST] &&
		        this[LRU_LIST].length) {
		      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
		    }

		    this[CACHE] = new Map(); // hash of items by key
		    this[LRU_LIST] = new Yallist(); // list of items in order of use recency
		    this[LENGTH] = 0; // length of items in the list
		  }

		  dump () {
		    return this[LRU_LIST].map(hit =>
		      isStale(this, hit) ? false : {
		        k: hit.key,
		        v: hit.value,
		        e: hit.now + (hit.maxAge || 0)
		      }).toArray().filter(h => h)
		  }

		  dumpLru () {
		    return this[LRU_LIST]
		  }

		  set (key, value, maxAge) {
		    maxAge = maxAge || this[MAX_AGE];

		    if (maxAge && typeof maxAge !== 'number')
		      throw new TypeError('maxAge must be a number')

		    const now = maxAge ? Date.now() : 0;
		    const len = this[LENGTH_CALCULATOR](value, key);

		    if (this[CACHE].has(key)) {
		      if (len > this[MAX]) {
		        del(this, this[CACHE].get(key));
		        return false
		      }

		      const node = this[CACHE].get(key);
		      const item = node.value;

		      // dispose of the old one before overwriting
		      // split out into 2 ifs for better coverage tracking
		      if (this[DISPOSE]) {
		        if (!this[NO_DISPOSE_ON_SET])
		          this[DISPOSE](key, item.value);
		      }

		      item.now = now;
		      item.maxAge = maxAge;
		      item.value = value;
		      this[LENGTH] += len - item.length;
		      item.length = len;
		      this.get(key);
		      trim(this);
		      return true
		    }

		    const hit = new Entry(key, value, len, now, maxAge);

		    // oversized objects fall out of cache automatically.
		    if (hit.length > this[MAX]) {
		      if (this[DISPOSE])
		        this[DISPOSE](key, value);

		      return false
		    }

		    this[LENGTH] += hit.length;
		    this[LRU_LIST].unshift(hit);
		    this[CACHE].set(key, this[LRU_LIST].head);
		    trim(this);
		    return true
		  }

		  has (key) {
		    if (!this[CACHE].has(key)) return false
		    const hit = this[CACHE].get(key).value;
		    return !isStale(this, hit)
		  }

		  get (key) {
		    return get(this, key, true)
		  }

		  peek (key) {
		    return get(this, key, false)
		  }

		  pop () {
		    const node = this[LRU_LIST].tail;
		    if (!node)
		      return null

		    del(this, node);
		    return node.value
		  }

		  del (key) {
		    del(this, this[CACHE].get(key));
		  }

		  load (arr) {
		    // reset the cache
		    this.reset();

		    const now = Date.now();
		    // A previous serialized cache has the most recent items first
		    for (let l = arr.length - 1; l >= 0; l--) {
		      const hit = arr[l];
		      const expiresAt = hit.e || 0;
		      if (expiresAt === 0)
		        // the item was created without expiration in a non aged cache
		        this.set(hit.k, hit.v);
		      else {
		        const maxAge = expiresAt - now;
		        // dont add already expired items
		        if (maxAge > 0) {
		          this.set(hit.k, hit.v, maxAge);
		        }
		      }
		    }
		  }

		  prune () {
		    this[CACHE].forEach((value, key) => get(this, key, false));
		  }
		}

		const get = (self, key, doUse) => {
		  const node = self[CACHE].get(key);
		  if (node) {
		    const hit = node.value;
		    if (isStale(self, hit)) {
		      del(self, node);
		      if (!self[ALLOW_STALE])
		        return undefined
		    } else {
		      if (doUse) {
		        if (self[UPDATE_AGE_ON_GET])
		          node.value.now = Date.now();
		        self[LRU_LIST].unshiftNode(node);
		      }
		    }
		    return hit.value
		  }
		};

		const isStale = (self, hit) => {
		  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
		    return false

		  const diff = Date.now() - hit.now;
		  return hit.maxAge ? diff > hit.maxAge
		    : self[MAX_AGE] && (diff > self[MAX_AGE])
		};

		const trim = self => {
		  if (self[LENGTH] > self[MAX]) {
		    for (let walker = self[LRU_LIST].tail;
		      self[LENGTH] > self[MAX] && walker !== null;) {
		      // We know that we're about to delete this one, and also
		      // what the next least recently used key will be, so just
		      // go ahead and set it now.
		      const prev = walker.prev;
		      del(self, walker);
		      walker = prev;
		    }
		  }
		};

		const del = (self, node) => {
		  if (node) {
		    const hit = node.value;
		    if (self[DISPOSE])
		      self[DISPOSE](hit.key, hit.value);

		    self[LENGTH] -= hit.length;
		    self[CACHE].delete(hit.key);
		    self[LRU_LIST].removeNode(node);
		  }
		};

		class Entry {
		  constructor (key, value, length, now, maxAge) {
		    this.key = key;
		    this.value = value;
		    this.length = length;
		    this.now = now;
		    this.maxAge = maxAge || 0;
		  }
		}

		const forEachStep = (self, fn, node, thisp) => {
		  let hit = node.value;
		  if (isStale(self, hit)) {
		    del(self, node);
		    if (!self[ALLOW_STALE])
		      hit = undefined;
		  }
		  if (hit)
		    fn.call(thisp, hit.value, hit.key, self);
		};

		lruCache = LRUCache;
		return lruCache;
	}

	var range;
	var hasRequiredRange;

	function requireRange () {
		if (hasRequiredRange) return range;
		hasRequiredRange = 1;
		// hoisted class for cyclic dependency
		class Range {
		  constructor (range, options) {
		    options = parseOptions(options);

		    if (range instanceof Range) {
		      if (
		        range.loose === !!options.loose &&
		        range.includePrerelease === !!options.includePrerelease
		      ) {
		        return range
		      } else {
		        return new Range(range.raw, options)
		      }
		    }

		    if (range instanceof Comparator) {
		      // just put it in the set and return
		      this.raw = range.value;
		      this.set = [[range]];
		      this.format();
		      return this
		    }

		    this.options = options;
		    this.loose = !!options.loose;
		    this.includePrerelease = !!options.includePrerelease;

		    // First reduce all whitespace as much as possible so we do not have to rely
		    // on potentially slow regexes like \s*. This is then stored and used for
		    // future error messages as well.
		    this.raw = range
		      .trim()
		      .split(/\s+/)
		      .join(' ');

		    // First, split on ||
		    this.set = this.raw
		      .split('||')
		      // map the range to a 2d array of comparators
		      .map(r => this.parseRange(r.trim()))
		      // throw out any comparator lists that are empty
		      // this generally means that it was not a valid range, which is allowed
		      // in loose mode, but will still throw if the WHOLE range is invalid.
		      .filter(c => c.length);

		    if (!this.set.length) {
		      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
		    }

		    // if we have any that are not the null set, throw out null sets.
		    if (this.set.length > 1) {
		      // keep the first one, in case they're all null sets
		      const first = this.set[0];
		      this.set = this.set.filter(c => !isNullSet(c[0]));
		      if (this.set.length === 0) {
		        this.set = [first];
		      } else if (this.set.length > 1) {
		        // if we have any that are *, then the range is just *
		        for (const c of this.set) {
		          if (c.length === 1 && isAny(c[0])) {
		            this.set = [c];
		            break
		          }
		        }
		      }
		    }

		    this.format();
		  }

		  format () {
		    this.range = this.set
		      .map((comps) => comps.join(' ').trim())
		      .join('||')
		      .trim();
		    return this.range
		  }

		  toString () {
		    return this.range
		  }

		  parseRange (range) {
		    // memoize range parsing for performance.
		    // this is a very hot path, and fully deterministic.
		    const memoOpts =
		      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
		      (this.options.loose && FLAG_LOOSE);
		    const memoKey = memoOpts + ':' + range;
		    const cached = cache.get(memoKey);
		    if (cached) {
		      return cached
		    }

		    const loose = this.options.loose;
		    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
		    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
		    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
		    debug('hyphen replace', range);

		    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
		    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
		    debug('comparator trim', range);

		    // `~ 1.2.3` => `~1.2.3`
		    range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
		    debug('tilde trim', range);

		    // `^ 1.2.3` => `^1.2.3`
		    range = range.replace(re[t.CARETTRIM], caretTrimReplace);
		    debug('caret trim', range);

		    // At this point, the range is completely trimmed and
		    // ready to be split into comparators.

		    let rangeList = range
		      .split(' ')
		      .map(comp => parseComparator(comp, this.options))
		      .join(' ')
		      .split(/\s+/)
		      // >=0.0.0 is equivalent to *
		      .map(comp => replaceGTE0(comp, this.options));

		    if (loose) {
		      // in loose mode, throw out any that are not valid comparators
		      rangeList = rangeList.filter(comp => {
		        debug('loose invalid filter', comp, this.options);
		        return !!comp.match(re[t.COMPARATORLOOSE])
		      });
		    }
		    debug('range list', rangeList);

		    // if any comparators are the null set, then replace with JUST null set
		    // if more than one comparator, remove any * comparators
		    // also, don't include the same comparator more than once
		    const rangeMap = new Map();
		    const comparators = rangeList.map(comp => new Comparator(comp, this.options));
		    for (const comp of comparators) {
		      if (isNullSet(comp)) {
		        return [comp]
		      }
		      rangeMap.set(comp.value, comp);
		    }
		    if (rangeMap.size > 1 && rangeMap.has('')) {
		      rangeMap.delete('');
		    }

		    const result = [...rangeMap.values()];
		    cache.set(memoKey, result);
		    return result
		  }

		  intersects (range, options) {
		    if (!(range instanceof Range)) {
		      throw new TypeError('a Range is required')
		    }

		    return this.set.some((thisComparators) => {
		      return (
		        isSatisfiable(thisComparators, options) &&
		        range.set.some((rangeComparators) => {
		          return (
		            isSatisfiable(rangeComparators, options) &&
		            thisComparators.every((thisComparator) => {
		              return rangeComparators.every((rangeComparator) => {
		                return thisComparator.intersects(rangeComparator, options)
		              })
		            })
		          )
		        })
		      )
		    })
		  }

		  // if ANY of the sets match ALL of its comparators, then pass
		  test (version) {
		    if (!version) {
		      return false
		    }

		    if (typeof version === 'string') {
		      try {
		        version = new SemVer(version, this.options);
		      } catch (er) {
		        return false
		      }
		    }

		    for (let i = 0; i < this.set.length; i++) {
		      if (testSet(this.set[i], version, this.options)) {
		        return true
		      }
		    }
		    return false
		  }
		}

		range = Range;

		const LRU = requireLruCache();
		const cache = new LRU({ max: 1000 });

		const parseOptions = parseOptions_1;
		const Comparator = requireComparator();
		const debug = debug_1;
		const SemVer = semver$4;
		const {
		  safeRe: re,
		  t,
		  comparatorTrimReplace,
		  tildeTrimReplace,
		  caretTrimReplace,
		} = reExports;
		const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = constants$1;

		const isNullSet = c => c.value === '<0.0.0-0';
		const isAny = c => c.value === '';

		// take a set of comparators and determine whether there
		// exists a version which can satisfy it
		const isSatisfiable = (comparators, options) => {
		  let result = true;
		  const remainingComparators = comparators.slice();
		  let testComparator = remainingComparators.pop();

		  while (result && remainingComparators.length) {
		    result = remainingComparators.every((otherComparator) => {
		      return testComparator.intersects(otherComparator, options)
		    });

		    testComparator = remainingComparators.pop();
		  }

		  return result
		};

		// comprised of xranges, tildes, stars, and gtlt's at this point.
		// already replaced the hyphen ranges
		// turn into a set of JUST comparators.
		const parseComparator = (comp, options) => {
		  debug('comp', comp, options);
		  comp = replaceCarets(comp, options);
		  debug('caret', comp);
		  comp = replaceTildes(comp, options);
		  debug('tildes', comp);
		  comp = replaceXRanges(comp, options);
		  debug('xrange', comp);
		  comp = replaceStars(comp, options);
		  debug('stars', comp);
		  return comp
		};

		const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

		// ~, ~> --> * (any, kinda silly)
		// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
		// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
		// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
		// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
		// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
		// ~0.0.1 --> >=0.0.1 <0.1.0-0
		const replaceTildes = (comp, options) => {
		  return comp
		    .trim()
		    .split(/\s+/)
		    .map((c) => replaceTilde(c, options))
		    .join(' ')
		};

		const replaceTilde = (comp, options) => {
		  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
		  return comp.replace(r, (_, M, m, p, pr) => {
		    debug('tilde', comp, _, M, m, p, pr);
		    let ret;

		    if (isX(M)) {
		      ret = '';
		    } else if (isX(m)) {
		      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
		    } else if (isX(p)) {
		      // ~1.2 == >=1.2.0 <1.3.0-0
		      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
		    } else if (pr) {
		      debug('replaceTilde pr', pr);
		      ret = `>=${M}.${m}.${p}-${pr
	      } <${M}.${+m + 1}.0-0`;
		    } else {
		      // ~1.2.3 == >=1.2.3 <1.3.0-0
		      ret = `>=${M}.${m}.${p
	      } <${M}.${+m + 1}.0-0`;
		    }

		    debug('tilde return', ret);
		    return ret
		  })
		};

		// ^ --> * (any, kinda silly)
		// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
		// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
		// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
		// ^1.2.3 --> >=1.2.3 <2.0.0-0
		// ^1.2.0 --> >=1.2.0 <2.0.0-0
		// ^0.0.1 --> >=0.0.1 <0.0.2-0
		// ^0.1.0 --> >=0.1.0 <0.2.0-0
		const replaceCarets = (comp, options) => {
		  return comp
		    .trim()
		    .split(/\s+/)
		    .map((c) => replaceCaret(c, options))
		    .join(' ')
		};

		const replaceCaret = (comp, options) => {
		  debug('caret', comp, options);
		  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
		  const z = options.includePrerelease ? '-0' : '';
		  return comp.replace(r, (_, M, m, p, pr) => {
		    debug('caret', comp, _, M, m, p, pr);
		    let ret;

		    if (isX(M)) {
		      ret = '';
		    } else if (isX(m)) {
		      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
		    } else if (isX(p)) {
		      if (M === '0') {
		        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
		      } else {
		        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
		      }
		    } else if (pr) {
		      debug('replaceCaret pr', pr);
		      if (M === '0') {
		        if (m === '0') {
		          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${m}.${+p + 1}-0`;
		        } else {
		          ret = `>=${M}.${m}.${p}-${pr
	          } <${M}.${+m + 1}.0-0`;
		        }
		      } else {
		        ret = `>=${M}.${m}.${p}-${pr
	        } <${+M + 1}.0.0-0`;
		      }
		    } else {
		      debug('no pr');
		      if (M === '0') {
		        if (m === '0') {
		          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${m}.${+p + 1}-0`;
		        } else {
		          ret = `>=${M}.${m}.${p
	          }${z} <${M}.${+m + 1}.0-0`;
		        }
		      } else {
		        ret = `>=${M}.${m}.${p
	        } <${+M + 1}.0.0-0`;
		      }
		    }

		    debug('caret return', ret);
		    return ret
		  })
		};

		const replaceXRanges = (comp, options) => {
		  debug('replaceXRanges', comp, options);
		  return comp
		    .split(/\s+/)
		    .map((c) => replaceXRange(c, options))
		    .join(' ')
		};

		const replaceXRange = (comp, options) => {
		  comp = comp.trim();
		  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
		  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
		    debug('xRange', comp, ret, gtlt, M, m, p, pr);
		    const xM = isX(M);
		    const xm = xM || isX(m);
		    const xp = xm || isX(p);
		    const anyX = xp;

		    if (gtlt === '=' && anyX) {
		      gtlt = '';
		    }

		    // if we're including prereleases in the match, then we need
		    // to fix this to -0, the lowest possible prerelease value
		    pr = options.includePrerelease ? '-0' : '';

		    if (xM) {
		      if (gtlt === '>' || gtlt === '<') {
		        // nothing is allowed
		        ret = '<0.0.0-0';
		      } else {
		        // nothing is forbidden
		        ret = '*';
		      }
		    } else if (gtlt && anyX) {
		      // we know patch is an x, because we have any x at all.
		      // replace X with 0
		      if (xm) {
		        m = 0;
		      }
		      p = 0;

		      if (gtlt === '>') {
		        // >1 => >=2.0.0
		        // >1.2 => >=1.3.0
		        gtlt = '>=';
		        if (xm) {
		          M = +M + 1;
		          m = 0;
		          p = 0;
		        } else {
		          m = +m + 1;
		          p = 0;
		        }
		      } else if (gtlt === '<=') {
		        // <=0.7.x is actually <0.8.0, since any 0.7.x should
		        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
		        gtlt = '<';
		        if (xm) {
		          M = +M + 1;
		        } else {
		          m = +m + 1;
		        }
		      }

		      if (gtlt === '<') {
		        pr = '-0';
		      }

		      ret = `${gtlt + M}.${m}.${p}${pr}`;
		    } else if (xm) {
		      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
		    } else if (xp) {
		      ret = `>=${M}.${m}.0${pr
	      } <${M}.${+m + 1}.0-0`;
		    }

		    debug('xRange return', ret);

		    return ret
		  })
		};

		// Because * is AND-ed with everything else in the comparator,
		// and '' means "any version", just remove the *s entirely.
		const replaceStars = (comp, options) => {
		  debug('replaceStars', comp, options);
		  // Looseness is ignored here.  star is always as loose as it gets!
		  return comp
		    .trim()
		    .replace(re[t.STAR], '')
		};

		const replaceGTE0 = (comp, options) => {
		  debug('replaceGTE0', comp, options);
		  return comp
		    .trim()
		    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
		};

		// This function is passed to string.replace(re[t.HYPHENRANGE])
		// M, m, patch, prerelease, build
		// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
		// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
		// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
		const hyphenReplace = incPr => ($0,
		  from, fM, fm, fp, fpr, fb,
		  to, tM, tm, tp, tpr, tb) => {
		  if (isX(fM)) {
		    from = '';
		  } else if (isX(fm)) {
		    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
		  } else if (isX(fp)) {
		    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
		  } else if (fpr) {
		    from = `>=${from}`;
		  } else {
		    from = `>=${from}${incPr ? '-0' : ''}`;
		  }

		  if (isX(tM)) {
		    to = '';
		  } else if (isX(tm)) {
		    to = `<${+tM + 1}.0.0-0`;
		  } else if (isX(tp)) {
		    to = `<${tM}.${+tm + 1}.0-0`;
		  } else if (tpr) {
		    to = `<=${tM}.${tm}.${tp}-${tpr}`;
		  } else if (incPr) {
		    to = `<${tM}.${tm}.${+tp + 1}-0`;
		  } else {
		    to = `<=${to}`;
		  }

		  return `${from} ${to}`.trim()
		};

		const testSet = (set, version, options) => {
		  for (let i = 0; i < set.length; i++) {
		    if (!set[i].test(version)) {
		      return false
		    }
		  }

		  if (version.prerelease.length && !options.includePrerelease) {
		    // Find the set of versions that are allowed to have prereleases
		    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
		    // That should allow `1.2.3-pr.2` to pass.
		    // However, `1.2.4-alpha.notready` should NOT be allowed,
		    // even though it's within the range set by the comparators.
		    for (let i = 0; i < set.length; i++) {
		      debug(set[i].semver);
		      if (set[i].semver === Comparator.ANY) {
		        continue
		      }

		      if (set[i].semver.prerelease.length > 0) {
		        const allowed = set[i].semver;
		        if (allowed.major === version.major &&
		            allowed.minor === version.minor &&
		            allowed.patch === version.patch) {
		          return true
		        }
		      }
		    }

		    // Version has a -pre, but it's not one of the ones we like.
		    return false
		  }

		  return true
		};
		return range;
	}

	var comparator;
	var hasRequiredComparator;

	function requireComparator () {
		if (hasRequiredComparator) return comparator;
		hasRequiredComparator = 1;
		const ANY = Symbol('SemVer ANY');
		// hoisted class for cyclic dependency
		class Comparator {
		  static get ANY () {
		    return ANY
		  }

		  constructor (comp, options) {
		    options = parseOptions(options);

		    if (comp instanceof Comparator) {
		      if (comp.loose === !!options.loose) {
		        return comp
		      } else {
		        comp = comp.value;
		      }
		    }

		    comp = comp.trim().split(/\s+/).join(' ');
		    debug('comparator', comp, options);
		    this.options = options;
		    this.loose = !!options.loose;
		    this.parse(comp);

		    if (this.semver === ANY) {
		      this.value = '';
		    } else {
		      this.value = this.operator + this.semver.version;
		    }

		    debug('comp', this);
		  }

		  parse (comp) {
		    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
		    const m = comp.match(r);

		    if (!m) {
		      throw new TypeError(`Invalid comparator: ${comp}`)
		    }

		    this.operator = m[1] !== undefined ? m[1] : '';
		    if (this.operator === '=') {
		      this.operator = '';
		    }

		    // if it literally is just '>' or '' then allow anything.
		    if (!m[2]) {
		      this.semver = ANY;
		    } else {
		      this.semver = new SemVer(m[2], this.options.loose);
		    }
		  }

		  toString () {
		    return this.value
		  }

		  test (version) {
		    debug('Comparator.test', version, this.options.loose);

		    if (this.semver === ANY || version === ANY) {
		      return true
		    }

		    if (typeof version === 'string') {
		      try {
		        version = new SemVer(version, this.options);
		      } catch (er) {
		        return false
		      }
		    }

		    return cmp(version, this.operator, this.semver, this.options)
		  }

		  intersects (comp, options) {
		    if (!(comp instanceof Comparator)) {
		      throw new TypeError('a Comparator is required')
		    }

		    if (this.operator === '') {
		      if (this.value === '') {
		        return true
		      }
		      return new Range(comp.value, options).test(this.value)
		    } else if (comp.operator === '') {
		      if (comp.value === '') {
		        return true
		      }
		      return new Range(this.value, options).test(comp.semver)
		    }

		    options = parseOptions(options);

		    // Special cases where nothing can possibly be lower
		    if (options.includePrerelease &&
		      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
		      return false
		    }
		    if (!options.includePrerelease &&
		      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
		      return false
		    }

		    // Same direction increasing (> or >=)
		    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
		      return true
		    }
		    // Same direction decreasing (< or <=)
		    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
		      return true
		    }
		    // same SemVer and both sides are inclusive (<= or >=)
		    if (
		      (this.semver.version === comp.semver.version) &&
		      this.operator.includes('=') && comp.operator.includes('=')) {
		      return true
		    }
		    // opposite directions less than
		    if (cmp(this.semver, '<', comp.semver, options) &&
		      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
		      return true
		    }
		    // opposite directions greater than
		    if (cmp(this.semver, '>', comp.semver, options) &&
		      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
		      return true
		    }
		    return false
		  }
		}

		comparator = Comparator;

		const parseOptions = parseOptions_1;
		const { safeRe: re, t } = reExports;
		const cmp = cmp_1;
		const debug = debug_1;
		const SemVer = semver$4;
		const Range = requireRange();
		return comparator;
	}

	const Range$9 = requireRange();
	const satisfies$4 = (version, range, options) => {
	  try {
	    range = new Range$9(range, options);
	  } catch (er) {
	    return false
	  }
	  return range.test(version)
	};
	var satisfies_1 = satisfies$4;

	const Range$8 = requireRange();

	// Mostly just for testing and legacy API reasons
	const toComparators$1 = (range, options) =>
	  new Range$8(range, options).set
	    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

	var toComparators_1 = toComparators$1;

	const SemVer$4 = semver$4;
	const Range$7 = requireRange();

	const maxSatisfying$1 = (versions, range, options) => {
	  let max = null;
	  let maxSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new Range$7(range, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!max || maxSV.compare(v) === -1) {
	        // compare(max, v, true)
	        max = v;
	        maxSV = new SemVer$4(max, options);
	      }
	    }
	  });
	  return max
	};
	var maxSatisfying_1 = maxSatisfying$1;

	const SemVer$3 = semver$4;
	const Range$6 = requireRange();
	const minSatisfying$1 = (versions, range, options) => {
	  let min = null;
	  let minSV = null;
	  let rangeObj = null;
	  try {
	    rangeObj = new Range$6(range, options);
	  } catch (er) {
	    return null
	  }
	  versions.forEach((v) => {
	    if (rangeObj.test(v)) {
	      // satisfies(v, range, options)
	      if (!min || minSV.compare(v) === 1) {
	        // compare(min, v, true)
	        min = v;
	        minSV = new SemVer$3(min, options);
	      }
	    }
	  });
	  return min
	};
	var minSatisfying_1 = minSatisfying$1;

	const SemVer$2 = semver$4;
	const Range$5 = requireRange();
	const gt$2 = gt_1;

	const minVersion$1 = (range, loose) => {
	  range = new Range$5(range, loose);

	  let minver = new SemVer$2('0.0.0');
	  if (range.test(minver)) {
	    return minver
	  }

	  minver = new SemVer$2('0.0.0-0');
	  if (range.test(minver)) {
	    return minver
	  }

	  minver = null;
	  for (let i = 0; i < range.set.length; ++i) {
	    const comparators = range.set[i];

	    let setMin = null;
	    comparators.forEach((comparator) => {
	      // Clone to avoid manipulating the comparator's semver object.
	      const compver = new SemVer$2(comparator.semver.version);
	      switch (comparator.operator) {
	        case '>':
	          if (compver.prerelease.length === 0) {
	            compver.patch++;
	          } else {
	            compver.prerelease.push(0);
	          }
	          compver.raw = compver.format();
	          /* fallthrough */
	        case '':
	        case '>=':
	          if (!setMin || gt$2(compver, setMin)) {
	            setMin = compver;
	          }
	          break
	        case '<':
	        case '<=':
	          /* Ignore maximum versions */
	          break
	        /* istanbul ignore next */
	        default:
	          throw new Error(`Unexpected operation: ${comparator.operator}`)
	      }
	    });
	    if (setMin && (!minver || gt$2(minver, setMin))) {
	      minver = setMin;
	    }
	  }

	  if (minver && range.test(minver)) {
	    return minver
	  }

	  return null
	};
	var minVersion_1 = minVersion$1;

	const Range$4 = requireRange();
	const validRange$1 = (range, options) => {
	  try {
	    // Return '*' instead of '' so that truthiness works.
	    // This will throw if it's invalid anyway
	    return new Range$4(range, options).range || '*'
	  } catch (er) {
	    return null
	  }
	};
	var valid$1 = validRange$1;

	const SemVer$1 = semver$4;
	const Comparator$2 = requireComparator();
	const { ANY: ANY$1 } = Comparator$2;
	const Range$3 = requireRange();
	const satisfies$3 = satisfies_1;
	const gt$1 = gt_1;
	const lt$1 = lt_1;
	const lte$1 = lte_1;
	const gte$1 = gte_1;

	const outside$3 = (version, range, hilo, options) => {
	  version = new SemVer$1(version, options);
	  range = new Range$3(range, options);

	  let gtfn, ltefn, ltfn, comp, ecomp;
	  switch (hilo) {
	    case '>':
	      gtfn = gt$1;
	      ltefn = lte$1;
	      ltfn = lt$1;
	      comp = '>';
	      ecomp = '>=';
	      break
	    case '<':
	      gtfn = lt$1;
	      ltefn = gte$1;
	      ltfn = gt$1;
	      comp = '<';
	      ecomp = '<=';
	      break
	    default:
	      throw new TypeError('Must provide a hilo val of "<" or ">"')
	  }

	  // If it satisfies the range it is not outside
	  if (satisfies$3(version, range, options)) {
	    return false
	  }

	  // From now on, variable terms are as if we're in "gtr" mode.
	  // but note that everything is flipped for the "ltr" function.

	  for (let i = 0; i < range.set.length; ++i) {
	    const comparators = range.set[i];

	    let high = null;
	    let low = null;

	    comparators.forEach((comparator) => {
	      if (comparator.semver === ANY$1) {
	        comparator = new Comparator$2('>=0.0.0');
	      }
	      high = high || comparator;
	      low = low || comparator;
	      if (gtfn(comparator.semver, high.semver, options)) {
	        high = comparator;
	      } else if (ltfn(comparator.semver, low.semver, options)) {
	        low = comparator;
	      }
	    });

	    // If the edge version comparator has a operator then our version
	    // isn't outside it
	    if (high.operator === comp || high.operator === ecomp) {
	      return false
	    }

	    // If the lowest version comparator has an operator and our version
	    // is less than it then it isn't higher than the range
	    if ((!low.operator || low.operator === comp) &&
	        ltefn(version, low.semver)) {
	      return false
	    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
	      return false
	    }
	  }
	  return true
	};

	var outside_1 = outside$3;

	// Determine if version is greater than all the versions possible in the range.
	const outside$2 = outside_1;
	const gtr$1 = (version, range, options) => outside$2(version, range, '>', options);
	var gtr_1 = gtr$1;

	const outside$1 = outside_1;
	// Determine if version is less than all the versions possible in the range
	const ltr$1 = (version, range, options) => outside$1(version, range, '<', options);
	var ltr_1 = ltr$1;

	const Range$2 = requireRange();
	const intersects$1 = (r1, r2, options) => {
	  r1 = new Range$2(r1, options);
	  r2 = new Range$2(r2, options);
	  return r1.intersects(r2, options)
	};
	var intersects_1 = intersects$1;

	// given a set of versions and a range, create a "simplified" range
	// that includes the same versions that the original range does
	// If the original range is shorter than the simplified one, return that.
	const satisfies$2 = satisfies_1;
	const compare$2 = compare_1;
	var simplify = (versions, range, options) => {
	  const set = [];
	  let first = null;
	  let prev = null;
	  const v = versions.sort((a, b) => compare$2(a, b, options));
	  for (const version of v) {
	    const included = satisfies$2(version, range, options);
	    if (included) {
	      prev = version;
	      if (!first) {
	        first = version;
	      }
	    } else {
	      if (prev) {
	        set.push([first, prev]);
	      }
	      prev = null;
	      first = null;
	    }
	  }
	  if (first) {
	    set.push([first, null]);
	  }

	  const ranges = [];
	  for (const [min, max] of set) {
	    if (min === max) {
	      ranges.push(min);
	    } else if (!max && min === v[0]) {
	      ranges.push('*');
	    } else if (!max) {
	      ranges.push(`>=${min}`);
	    } else if (min === v[0]) {
	      ranges.push(`<=${max}`);
	    } else {
	      ranges.push(`${min} - ${max}`);
	    }
	  }
	  const simplified = ranges.join(' || ');
	  const original = typeof range.raw === 'string' ? range.raw : String(range);
	  return simplified.length < original.length ? simplified : range
	};

	const Range$1 = requireRange();
	const Comparator$1 = requireComparator();
	const { ANY } = Comparator$1;
	const satisfies$1 = satisfies_1;
	const compare$1 = compare_1;

	// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
	// - Every simple range `r1, r2, ...` is a null set, OR
	// - Every simple range `r1, r2, ...` which is not a null set is a subset of
	//   some `R1, R2, ...`
	//
	// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
	// - If c is only the ANY comparator
	//   - If C is only the ANY comparator, return true
	//   - Else if in prerelease mode, return false
	//   - else replace c with `[>=0.0.0]`
	// - If C is only the ANY comparator
	//   - if in prerelease mode, return true
	//   - else replace C with `[>=0.0.0]`
	// - Let EQ be the set of = comparators in c
	// - If EQ is more than one, return true (null set)
	// - Let GT be the highest > or >= comparator in c
	// - Let LT be the lowest < or <= comparator in c
	// - If GT and LT, and GT.semver > LT.semver, return true (null set)
	// - If any C is a = range, and GT or LT are set, return false
	// - If EQ
	//   - If GT, and EQ does not satisfy GT, return true (null set)
	//   - If LT, and EQ does not satisfy LT, return true (null set)
	//   - If EQ satisfies every C, return true
	//   - Else return false
	// - If GT
	//   - If GT.semver is lower than any > or >= comp in C, return false
	//   - If GT is >=, and GT.semver does not satisfy every C, return false
	//   - If GT.semver has a prerelease, and not in prerelease mode
	//     - If no C has a prerelease and the GT.semver tuple, return false
	// - If LT
	//   - If LT.semver is greater than any < or <= comp in C, return false
	//   - If LT is <=, and LT.semver does not satisfy every C, return false
	//   - If GT.semver has a prerelease, and not in prerelease mode
	//     - If no C has a prerelease and the LT.semver tuple, return false
	// - Else return true

	const subset$1 = (sub, dom, options = {}) => {
	  if (sub === dom) {
	    return true
	  }

	  sub = new Range$1(sub, options);
	  dom = new Range$1(dom, options);
	  let sawNonNull = false;

	  OUTER: for (const simpleSub of sub.set) {
	    for (const simpleDom of dom.set) {
	      const isSub = simpleSubset(simpleSub, simpleDom, options);
	      sawNonNull = sawNonNull || isSub !== null;
	      if (isSub) {
	        continue OUTER
	      }
	    }
	    // the null set is a subset of everything, but null simple ranges in
	    // a complex range should be ignored.  so if we saw a non-null range,
	    // then we know this isn't a subset, but if EVERY simple range was null,
	    // then it is a subset.
	    if (sawNonNull) {
	      return false
	    }
	  }
	  return true
	};

	const minimumVersionWithPreRelease = [new Comparator$1('>=0.0.0-0')];
	const minimumVersion = [new Comparator$1('>=0.0.0')];

	const simpleSubset = (sub, dom, options) => {
	  if (sub === dom) {
	    return true
	  }

	  if (sub.length === 1 && sub[0].semver === ANY) {
	    if (dom.length === 1 && dom[0].semver === ANY) {
	      return true
	    } else if (options.includePrerelease) {
	      sub = minimumVersionWithPreRelease;
	    } else {
	      sub = minimumVersion;
	    }
	  }

	  if (dom.length === 1 && dom[0].semver === ANY) {
	    if (options.includePrerelease) {
	      return true
	    } else {
	      dom = minimumVersion;
	    }
	  }

	  const eqSet = new Set();
	  let gt, lt;
	  for (const c of sub) {
	    if (c.operator === '>' || c.operator === '>=') {
	      gt = higherGT(gt, c, options);
	    } else if (c.operator === '<' || c.operator === '<=') {
	      lt = lowerLT(lt, c, options);
	    } else {
	      eqSet.add(c.semver);
	    }
	  }

	  if (eqSet.size > 1) {
	    return null
	  }

	  let gtltComp;
	  if (gt && lt) {
	    gtltComp = compare$1(gt.semver, lt.semver, options);
	    if (gtltComp > 0) {
	      return null
	    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
	      return null
	    }
	  }

	  // will iterate one or zero times
	  for (const eq of eqSet) {
	    if (gt && !satisfies$1(eq, String(gt), options)) {
	      return null
	    }

	    if (lt && !satisfies$1(eq, String(lt), options)) {
	      return null
	    }

	    for (const c of dom) {
	      if (!satisfies$1(eq, String(c), options)) {
	        return false
	      }
	    }

	    return true
	  }

	  let higher, lower;
	  let hasDomLT, hasDomGT;
	  // if the subset has a prerelease, we need a comparator in the superset
	  // with the same tuple and a prerelease, or it's not a subset
	  let needDomLTPre = lt &&
	    !options.includePrerelease &&
	    lt.semver.prerelease.length ? lt.semver : false;
	  let needDomGTPre = gt &&
	    !options.includePrerelease &&
	    gt.semver.prerelease.length ? gt.semver : false;
	  // exception: <1.2.3-0 is the same as <1.2.3
	  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
	      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
	    needDomLTPre = false;
	  }

	  for (const c of dom) {
	    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
	    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
	    if (gt) {
	      if (needDomGTPre) {
	        if (c.semver.prerelease && c.semver.prerelease.length &&
	            c.semver.major === needDomGTPre.major &&
	            c.semver.minor === needDomGTPre.minor &&
	            c.semver.patch === needDomGTPre.patch) {
	          needDomGTPre = false;
	        }
	      }
	      if (c.operator === '>' || c.operator === '>=') {
	        higher = higherGT(gt, c, options);
	        if (higher === c && higher !== gt) {
	          return false
	        }
	      } else if (gt.operator === '>=' && !satisfies$1(gt.semver, String(c), options)) {
	        return false
	      }
	    }
	    if (lt) {
	      if (needDomLTPre) {
	        if (c.semver.prerelease && c.semver.prerelease.length &&
	            c.semver.major === needDomLTPre.major &&
	            c.semver.minor === needDomLTPre.minor &&
	            c.semver.patch === needDomLTPre.patch) {
	          needDomLTPre = false;
	        }
	      }
	      if (c.operator === '<' || c.operator === '<=') {
	        lower = lowerLT(lt, c, options);
	        if (lower === c && lower !== lt) {
	          return false
	        }
	      } else if (lt.operator === '<=' && !satisfies$1(lt.semver, String(c), options)) {
	        return false
	      }
	    }
	    if (!c.operator && (lt || gt) && gtltComp !== 0) {
	      return false
	    }
	  }

	  // if there was a < or >, and nothing in the dom, then must be false
	  // UNLESS it was limited by another range in the other direction.
	  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
	  if (gt && hasDomLT && !lt && gtltComp !== 0) {
	    return false
	  }

	  if (lt && hasDomGT && !gt && gtltComp !== 0) {
	    return false
	  }

	  // we needed a prerelease range in a specific tuple, but didn't get one
	  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
	  // because it includes prereleases in the 1.2.3 tuple
	  if (needDomGTPre || needDomLTPre) {
	    return false
	  }

	  return true
	};

	// >=1.2.3 is lower than >1.2.3
	const higherGT = (a, b, options) => {
	  if (!a) {
	    return b
	  }
	  const comp = compare$1(a.semver, b.semver, options);
	  return comp > 0 ? a
	    : comp < 0 ? b
	    : b.operator === '>' && a.operator === '>=' ? b
	    : a
	};

	// <=1.2.3 is higher than <1.2.3
	const lowerLT = (a, b, options) => {
	  if (!a) {
	    return b
	  }
	  const comp = compare$1(a.semver, b.semver, options);
	  return comp < 0 ? a
	    : comp > 0 ? b
	    : b.operator === '<' && a.operator === '<=' ? b
	    : a
	};

	var subset_1 = subset$1;

	// just pre-load all the stuff that index.js lazily exports
	const internalRe = reExports;
	const constants = constants$1;
	const SemVer = semver$4;
	const identifiers = identifiers$1;
	const parse = parse_1;
	const valid = valid_1;
	const clean = clean_1;
	const inc = inc_1;
	const diff = diff_1;
	const major = major_1;
	const minor = minor_1;
	const patch = patch_1;
	const prerelease = prerelease_1;
	const compare = compare_1;
	const rcompare = rcompare_1;
	const compareLoose = compareLoose_1;
	const compareBuild = compareBuild_1;
	const sort = sort_1;
	const rsort = rsort_1;
	const gt = gt_1;
	const lt = lt_1;
	const eq = eq_1;
	const neq = neq_1;
	const gte = gte_1;
	const lte = lte_1;
	const cmp = cmp_1;
	const coerce = coerce_1;
	const Comparator = requireComparator();
	const Range = requireRange();
	const satisfies = satisfies_1;
	const toComparators = toComparators_1;
	const maxSatisfying = maxSatisfying_1;
	const minSatisfying = minSatisfying_1;
	const minVersion = minVersion_1;
	const validRange = valid$1;
	const outside = outside_1;
	const gtr = gtr_1;
	const ltr = ltr_1;
	const intersects = intersects_1;
	const simplifyRange = simplify;
	const subset = subset_1;
	var semver$3 = {
	  parse,
	  valid,
	  clean,
	  inc,
	  diff,
	  major,
	  minor,
	  patch,
	  prerelease,
	  compare,
	  rcompare,
	  compareLoose,
	  compareBuild,
	  sort,
	  rsort,
	  gt,
	  lt,
	  eq,
	  neq,
	  gte,
	  lte,
	  cmp,
	  coerce,
	  Comparator,
	  Range,
	  satisfies,
	  toComparators,
	  maxSatisfying,
	  minSatisfying,
	  minVersion,
	  validRange,
	  outside,
	  gtr,
	  ltr,
	  intersects,
	  simplifyRange,
	  subset,
	  SemVer,
	  re: internalRe.re,
	  src: internalRe.src,
	  tokens: internalRe.t,
	  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
	  RELEASE_TYPES: constants.RELEASE_TYPES,
	  compareIdentifiers: identifiers.compareIdentifiers,
	  rcompareIdentifiers: identifiers.rcompareIdentifiers,
	};

	const semver$2 = semver$3;

	var asymmetricKeyDetailsSupported = semver$2.satisfies(process.version, '>=15.7.0');

	const semver$1 = semver$3;

	var rsaPssKeyDetailsSupported = semver$1.satisfies(process.version, '>=16.9.0');

	const ASYMMETRIC_KEY_DETAILS_SUPPORTED = asymmetricKeyDetailsSupported;
	const RSA_PSS_KEY_DETAILS_SUPPORTED = rsaPssKeyDetailsSupported;

	const allowedAlgorithmsForKeys = {
	  'ec': ['ES256', 'ES384', 'ES512'],
	  'rsa': ['RS256', 'PS256', 'RS384', 'PS384', 'RS512', 'PS512'],
	  'rsa-pss': ['PS256', 'PS384', 'PS512']
	};

	const allowedCurves = {
	  ES256: 'prime256v1',
	  ES384: 'secp384r1',
	  ES512: 'secp521r1',
	};

	var validateAsymmetricKey$2 = function(algorithm, key) {
	  if (!algorithm || !key) return;

	  const keyType = key.asymmetricKeyType;
	  if (!keyType) return;

	  const allowedAlgorithms = allowedAlgorithmsForKeys[keyType];

	  if (!allowedAlgorithms) {
	    throw new Error(`Unknown key type "${keyType}".`);
	  }

	  if (!allowedAlgorithms.includes(algorithm)) {
	    throw new Error(`"alg" parameter for "${keyType}" key type must be one of: ${allowedAlgorithms.join(', ')}.`)
	  }

	  /*
	   * Ignore the next block from test coverage because it gets executed
	   * conditionally depending on the Node version. Not ignoring it would
	   * prevent us from reaching the target % of coverage for versions of
	   * Node under 15.7.0.
	   */
	  /* istanbul ignore next */
	  if (ASYMMETRIC_KEY_DETAILS_SUPPORTED) {
	    switch (keyType) {
	    case 'ec':
	      const keyCurve = key.asymmetricKeyDetails.namedCurve;
	      const allowedCurve = allowedCurves[algorithm];

	      if (keyCurve !== allowedCurve) {
	        throw new Error(`"alg" parameter "${algorithm}" requires curve "${allowedCurve}".`);
	      }
	      break;

	    case 'rsa-pss':
	      if (RSA_PSS_KEY_DETAILS_SUPPORTED) {
	        const length = parseInt(algorithm.slice(-3), 10);
	        const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = key.asymmetricKeyDetails;

	        if (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm) {
	          throw new Error(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${algorithm}.`);
	        }

	        if (saltLength !== undefined && saltLength > length >> 3) {
	          throw new Error(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${algorithm}.`)
	        }
	      }
	      break;
	    }
	  }
	};

	var semver = semver$3;

	var psSupported = semver.satisfies(process.version, '^6.12.0 || >=8.0.0');

	const JsonWebTokenError = JsonWebTokenError_1;
	const NotBeforeError = NotBeforeError_1;
	const TokenExpiredError = TokenExpiredError_1;
	const decode = decode$1;
	const timespan$1 = timespan$2;
	const validateAsymmetricKey$1 = validateAsymmetricKey$2;
	const PS_SUPPORTED$1 = psSupported;
	const jws$1 = jws$3;
	const {KeyObject: KeyObject$1, createSecretKey: createSecretKey$1, createPublicKey} = require$$2;

	const PUB_KEY_ALGS = ['RS256', 'RS384', 'RS512'];
	const EC_KEY_ALGS = ['ES256', 'ES384', 'ES512'];
	const RSA_KEY_ALGS = ['RS256', 'RS384', 'RS512'];
	const HS_ALGS = ['HS256', 'HS384', 'HS512'];

	if (PS_SUPPORTED$1) {
	  PUB_KEY_ALGS.splice(PUB_KEY_ALGS.length, 0, 'PS256', 'PS384', 'PS512');
	  RSA_KEY_ALGS.splice(RSA_KEY_ALGS.length, 0, 'PS256', 'PS384', 'PS512');
	}

	var verify = function (jwtString, secretOrPublicKey, options, callback) {
	  if ((typeof options === 'function') && !callback) {
	    callback = options;
	    options = {};
	  }

	  if (!options) {
	    options = {};
	  }

	  //clone this object since we are going to mutate it.
	  options = Object.assign({}, options);

	  let done;

	  if (callback) {
	    done = callback;
	  } else {
	    done = function(err, data) {
	      if (err) throw err;
	      return data;
	    };
	  }

	  if (options.clockTimestamp && typeof options.clockTimestamp !== 'number') {
	    return done(new JsonWebTokenError('clockTimestamp must be a number'));
	  }

	  if (options.nonce !== undefined && (typeof options.nonce !== 'string' || options.nonce.trim() === '')) {
	    return done(new JsonWebTokenError('nonce must be a non-empty string'));
	  }

	  if (options.allowInvalidAsymmetricKeyTypes !== undefined && typeof options.allowInvalidAsymmetricKeyTypes !== 'boolean') {
	    return done(new JsonWebTokenError('allowInvalidAsymmetricKeyTypes must be a boolean'));
	  }

	  const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1000);

	  if (!jwtString){
	    return done(new JsonWebTokenError('jwt must be provided'));
	  }

	  if (typeof jwtString !== 'string') {
	    return done(new JsonWebTokenError('jwt must be a string'));
	  }

	  const parts = jwtString.split('.');

	  if (parts.length !== 3){
	    return done(new JsonWebTokenError('jwt malformed'));
	  }

	  let decodedToken;

	  try {
	    decodedToken = decode(jwtString, { complete: true });
	  } catch(err) {
	    return done(err);
	  }

	  if (!decodedToken) {
	    return done(new JsonWebTokenError('invalid token'));
	  }

	  const header = decodedToken.header;
	  let getSecret;

	  if(typeof secretOrPublicKey === 'function') {
	    if(!callback) {
	      return done(new JsonWebTokenError('verify must be called asynchronous if secret or public key is provided as a callback'));
	    }

	    getSecret = secretOrPublicKey;
	  }
	  else {
	    getSecret = function(header, secretCallback) {
	      return secretCallback(null, secretOrPublicKey);
	    };
	  }

	  return getSecret(header, function(err, secretOrPublicKey) {
	    if(err) {
	      return done(new JsonWebTokenError('error in secret or public key callback: ' + err.message));
	    }

	    const hasSignature = parts[2].trim() !== '';

	    if (!hasSignature && secretOrPublicKey){
	      return done(new JsonWebTokenError('jwt signature is required'));
	    }

	    if (hasSignature && !secretOrPublicKey) {
	      return done(new JsonWebTokenError('secret or public key must be provided'));
	    }

	    if (!hasSignature && !options.algorithms) {
	      return done(new JsonWebTokenError('please specify "none" in "algorithms" to verify unsigned tokens'));
	    }

	    if (secretOrPublicKey != null && !(secretOrPublicKey instanceof KeyObject$1)) {
	      try {
	        secretOrPublicKey = createPublicKey(secretOrPublicKey);
	      } catch (_) {
	        try {
	          secretOrPublicKey = createSecretKey$1(typeof secretOrPublicKey === 'string' ? Buffer.from(secretOrPublicKey) : secretOrPublicKey);
	        } catch (_) {
	          return done(new JsonWebTokenError('secretOrPublicKey is not valid key material'))
	        }
	      }
	    }

	    if (!options.algorithms) {
	      if (secretOrPublicKey.type === 'secret') {
	        options.algorithms = HS_ALGS;
	      } else if (['rsa', 'rsa-pss'].includes(secretOrPublicKey.asymmetricKeyType)) {
	        options.algorithms = RSA_KEY_ALGS;
	      } else if (secretOrPublicKey.asymmetricKeyType === 'ec') {
	        options.algorithms = EC_KEY_ALGS;
	      } else {
	        options.algorithms = PUB_KEY_ALGS;
	      }
	    }

	    if (options.algorithms.indexOf(decodedToken.header.alg) === -1) {
	      return done(new JsonWebTokenError('invalid algorithm'));
	    }

	    if (header.alg.startsWith('HS') && secretOrPublicKey.type !== 'secret') {
	      return done(new JsonWebTokenError((`secretOrPublicKey must be a symmetric key when using ${header.alg}`)))
	    } else if (/^(?:RS|PS|ES)/.test(header.alg) && secretOrPublicKey.type !== 'public') {
	      return done(new JsonWebTokenError((`secretOrPublicKey must be an asymmetric key when using ${header.alg}`)))
	    }

	    if (!options.allowInvalidAsymmetricKeyTypes) {
	      try {
	        validateAsymmetricKey$1(header.alg, secretOrPublicKey);
	      } catch (e) {
	        return done(e);
	      }
	    }

	    let valid;

	    try {
	      valid = jws$1.verify(jwtString, decodedToken.header.alg, secretOrPublicKey);
	    } catch (e) {
	      return done(e);
	    }

	    if (!valid) {
	      return done(new JsonWebTokenError('invalid signature'));
	    }

	    const payload = decodedToken.payload;

	    if (typeof payload.nbf !== 'undefined' && !options.ignoreNotBefore) {
	      if (typeof payload.nbf !== 'number') {
	        return done(new JsonWebTokenError('invalid nbf value'));
	      }
	      if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
	        return done(new NotBeforeError('jwt not active', new Date(payload.nbf * 1000)));
	      }
	    }

	    if (typeof payload.exp !== 'undefined' && !options.ignoreExpiration) {
	      if (typeof payload.exp !== 'number') {
	        return done(new JsonWebTokenError('invalid exp value'));
	      }
	      if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
	        return done(new TokenExpiredError('jwt expired', new Date(payload.exp * 1000)));
	      }
	    }

	    if (options.audience) {
	      const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
	      const target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

	      const match = target.some(function (targetAudience) {
	        return audiences.some(function (audience) {
	          return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
	        });
	      });

	      if (!match) {
	        return done(new JsonWebTokenError('jwt audience invalid. expected: ' + audiences.join(' or ')));
	      }
	    }

	    if (options.issuer) {
	      const invalid_issuer =
	              (typeof options.issuer === 'string' && payload.iss !== options.issuer) ||
	              (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

	      if (invalid_issuer) {
	        return done(new JsonWebTokenError('jwt issuer invalid. expected: ' + options.issuer));
	      }
	    }

	    if (options.subject) {
	      if (payload.sub !== options.subject) {
	        return done(new JsonWebTokenError('jwt subject invalid. expected: ' + options.subject));
	      }
	    }

	    if (options.jwtid) {
	      if (payload.jti !== options.jwtid) {
	        return done(new JsonWebTokenError('jwt jwtid invalid. expected: ' + options.jwtid));
	      }
	    }

	    if (options.nonce) {
	      if (payload.nonce !== options.nonce) {
	        return done(new JsonWebTokenError('jwt nonce invalid. expected: ' + options.nonce));
	      }
	    }

	    if (options.maxAge) {
	      if (typeof payload.iat !== 'number') {
	        return done(new JsonWebTokenError('iat required when maxAge is specified'));
	      }

	      const maxAgeTimestamp = timespan$1(options.maxAge, payload.iat);
	      if (typeof maxAgeTimestamp === 'undefined') {
	        return done(new JsonWebTokenError('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
	      }
	      if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
	        return done(new TokenExpiredError('maxAge exceeded', new Date(maxAgeTimestamp * 1000)));
	      }
	    }

	    if (options.complete === true) {
	      const signature = decodedToken.signature;

	      return done(null, {
	        header: header,
	        payload: payload,
	        signature: signature
	      });
	    }

	    return done(null, payload);
	  });
	};

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as references for various `Number` constants. */
	var INFINITY$2 = 1 / 0,
	    MAX_SAFE_INTEGER = 9007199254740991,
	    MAX_INTEGER$2 = 1.7976931348623157e+308,
	    NAN$2 = 0 / 0;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    stringTag$1 = '[object String]',
	    symbolTag$2 = '[object Symbol]';

	/** Used to match leading and trailing whitespace. */
	var reTrim$2 = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex$2 = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary$2 = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal$2 = /^0o[0-7]+$/i;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt$2 = parseInt;

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array ? array.length : 0,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 1 : -1);

	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return baseFindIndex(array, baseIsNaN, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;

	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.isNaN` without support for number objects.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	 */
	function baseIsNaN(value) {
	  return value !== value;
	}

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.values` and `_.valuesIn` which creates an
	 * array of `object` property values corresponding to the property names
	 * of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the array of property values.
	 */
	function baseValues(object, props) {
	  return arrayMap(props, function(key) {
	    return object[key];
	  });
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg$1(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/** Used for built-in method references. */
	var objectProto$6 = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto$6.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$6 = objectProto$6.toString;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg$1(Object.keys, Object),
	    nativeMax = Math.max;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  // Safari 9 makes `arguments.length` enumerable in strict mode.
	  var result = (isArray$1(value) || isArguments(value))
	    ? baseTimes(value.length, String)
	    : [];

	  var length = result.length,
	      skipIndexes = !!length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty$1.call(value, key)) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty$1.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$6;

	  return value === proto;
	}

	/**
	 * Checks if `value` is in `collection`. If `collection` is a string, it's
	 * checked for a substring of `value`, otherwise
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * is used for equality comparisons. If `fromIndex` is negative, it's used as
	 * the offset from the end of `collection`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @param {*} value The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	 * @returns {boolean} Returns `true` if `value` is found, else `false`.
	 * @example
	 *
	 * _.includes([1, 2, 3], 1);
	 * // => true
	 *
	 * _.includes([1, 2, 3], 1, 2);
	 * // => false
	 *
	 * _.includes({ 'a': 1, 'b': 2 }, 1);
	 * // => true
	 *
	 * _.includes('abcd', 'bc');
	 * // => true
	 */
	function includes$1(collection, value, fromIndex, guard) {
	  collection = isArrayLike(collection) ? collection : values(collection);
	  fromIndex = (fromIndex && !guard) ? toInteger$2(fromIndex) : 0;

	  var length = collection.length;
	  if (fromIndex < 0) {
	    fromIndex = nativeMax(length + fromIndex, 0);
	  }
	  return isString$2(collection)
	    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
	    : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty$1.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString$6.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray$1 = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike$6(value) && isArrayLike(value);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject$2(value) ? objectToString$6.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject$2(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$6(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString$2(value) {
	  return typeof value == 'string' ||
	    (!isArray$1(value) && isObjectLike$6(value) && objectToString$6.call(value) == stringTag$1);
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol$2(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike$6(value) && objectToString$6.call(value) == symbolTag$2);
	}

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite$2(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber$2(value);
	  if (value === INFINITY$2 || value === -INFINITY$2) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER$2;
	  }
	  return value === value ? value : 0;
	}

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger$2(value) {
	  var result = toFinite$2(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber$2(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol$2(value)) {
	    return NAN$2;
	  }
	  if (isObject$2(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject$2(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim$2, '');
	  var isBinary = reIsBinary$2.test(value);
	  return (isBinary || reIsOctal$2.test(value))
	    ? freeParseInt$2(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex$2.test(value) ? NAN$2 : +value);
	}

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	/**
	 * Creates an array of the own enumerable string keyed property values of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property values.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.values(new Foo);
	 * // => [1, 2] (iteration order is not guaranteed)
	 *
	 * _.values('hi');
	 * // => ['h', 'i']
	 */
	function values(object) {
	  return object ? baseValues(object, keys(object)) : [];
	}

	var lodash_includes = includes$1;

	/**
	 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]';

	/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$5 = objectProto$5.toString;

	/**
	 * Checks if `value` is classified as a boolean primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isBoolean(false);
	 * // => true
	 *
	 * _.isBoolean(null);
	 * // => false
	 */
	function isBoolean$1(value) {
	  return value === true || value === false ||
	    (isObjectLike$5(value) && objectToString$5.call(value) == boolTag);
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$5(value) {
	  return !!value && typeof value == 'object';
	}

	var lodash_isboolean = isBoolean$1;

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as references for various `Number` constants. */
	var INFINITY$1 = 1 / 0,
	    MAX_INTEGER$1 = 1.7976931348623157e+308,
	    NAN$1 = 0 / 0;

	/** `Object#toString` result references. */
	var symbolTag$1 = '[object Symbol]';

	/** Used to match leading and trailing whitespace. */
	var reTrim$1 = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex$1 = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary$1 = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal$1 = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt$1 = parseInt;

	/** Used for built-in method references. */
	var objectProto$4 = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$4 = objectProto$4.toString;

	/**
	 * Checks if `value` is an integer.
	 *
	 * **Note:** This method is based on
	 * [`Number.isInteger`](https://mdn.io/Number/isInteger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
	 * @example
	 *
	 * _.isInteger(3);
	 * // => true
	 *
	 * _.isInteger(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isInteger(Infinity);
	 * // => false
	 *
	 * _.isInteger('3');
	 * // => false
	 */
	function isInteger$1(value) {
	  return typeof value == 'number' && value == toInteger$1(value);
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject$1(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$4(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol$1(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike$4(value) && objectToString$4.call(value) == symbolTag$1);
	}

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite$1(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber$1(value);
	  if (value === INFINITY$1 || value === -INFINITY$1) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER$1;
	  }
	  return value === value ? value : 0;
	}

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger$1(value) {
	  var result = toFinite$1(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber$1(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol$1(value)) {
	    return NAN$1;
	  }
	  if (isObject$1(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject$1(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim$1, '');
	  var isBinary = reIsBinary$1.test(value);
	  return (isBinary || reIsOctal$1.test(value))
	    ? freeParseInt$1(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex$1.test(value) ? NAN$1 : +value);
	}

	var lodash_isinteger = isInteger$1;

	/**
	 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** `Object#toString` result references. */
	var numberTag = '[object Number]';

	/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$3 = objectProto$3.toString;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$3(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Number` primitive or object.
	 *
	 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
	 * as numbers, use the `_.isFinite` method.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isNumber(3);
	 * // => true
	 *
	 * _.isNumber(Number.MIN_VALUE);
	 * // => true
	 *
	 * _.isNumber(Infinity);
	 * // => true
	 *
	 * _.isNumber('3');
	 * // => false
	 */
	function isNumber$1(value) {
	  return typeof value == 'number' ||
	    (isObjectLike$3(value) && objectToString$3.call(value) == numberTag);
	}

	var lodash_isnumber = isNumber$1;

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** `Object#toString` result references. */
	var objectTag = '[object Object]';

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto$2 = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto$2.hasOwnProperty;

	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$2 = objectProto$2.toString;

	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$2(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject$1(value) {
	  if (!isObjectLike$2(value) ||
	      objectToString$2.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}

	var lodash_isplainobject = isPlainObject$1;

	/**
	 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/** Used for built-in method references. */
	var objectProto$1 = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString$1 = objectProto$1.toString;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @type Function
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike$1(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString$1(value) {
	  return typeof value == 'string' ||
	    (!isArray(value) && isObjectLike$1(value) && objectToString$1.call(value) == stringTag);
	}

	var lodash_isstring = isString$1;

	/**
	 * lodash (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
	 * Released under MIT license <https://lodash.com/license>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 */

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308,
	    NAN = 0 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/**
	 * Creates a function that invokes `func`, with the `this` binding and arguments
	 * of the created function, while it's called less than `n` times. Subsequent
	 * calls to the created function return the result of the last `func` invocation.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Function
	 * @param {number} n The number of calls at which `func` is no longer invoked.
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new restricted function.
	 * @example
	 *
	 * jQuery(element).on('click', _.before(5, addContactToList));
	 * // => Allows adding up to 4 contacts to the list.
	 */
	function before(n, func) {
	  var result;
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  n = toInteger(n);
	  return function() {
	    if (--n > 0) {
	      result = func.apply(this, arguments);
	    }
	    if (n <= 1) {
	      func = undefined;
	    }
	    return result;
	  };
	}

	/**
	 * Creates a function that is restricted to invoking `func` once. Repeat calls
	 * to the function return the value of the first invocation. The `func` is
	 * invoked with the `this` binding and arguments of the created function.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to restrict.
	 * @returns {Function} Returns the new restricted function.
	 * @example
	 *
	 * var initialize = _.once(createApplication);
	 * initialize();
	 * initialize();
	 * // => `createApplication` is invoked once
	 */
	function once$1(func) {
	  return before(2, func);
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	var lodash_once = once$1;

	const timespan = timespan$2;
	const PS_SUPPORTED = psSupported;
	const validateAsymmetricKey = validateAsymmetricKey$2;
	const jws = jws$3;
	const includes = lodash_includes;
	const isBoolean = lodash_isboolean;
	const isInteger = lodash_isinteger;
	const isNumber = lodash_isnumber;
	const isPlainObject = lodash_isplainobject;
	const isString = lodash_isstring;
	const once = lodash_once;
	const { KeyObject, createSecretKey, createPrivateKey } = require$$2;

	const SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512', 'none'];
	if (PS_SUPPORTED) {
	  SUPPORTED_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
	}

	const sign_options_schema = {
	  expiresIn: { isValid: function(value) { return isInteger(value) || (isString(value) && value); }, message: '"expiresIn" should be a number of seconds or string representing a timespan' },
	  notBefore: { isValid: function(value) { return isInteger(value) || (isString(value) && value); }, message: '"notBefore" should be a number of seconds or string representing a timespan' },
	  audience: { isValid: function(value) { return isString(value) || Array.isArray(value); }, message: '"audience" must be a string or array' },
	  algorithm: { isValid: includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
	  header: { isValid: isPlainObject, message: '"header" must be an object' },
	  encoding: { isValid: isString, message: '"encoding" must be a string' },
	  issuer: { isValid: isString, message: '"issuer" must be a string' },
	  subject: { isValid: isString, message: '"subject" must be a string' },
	  jwtid: { isValid: isString, message: '"jwtid" must be a string' },
	  noTimestamp: { isValid: isBoolean, message: '"noTimestamp" must be a boolean' },
	  keyid: { isValid: isString, message: '"keyid" must be a string' },
	  mutatePayload: { isValid: isBoolean, message: '"mutatePayload" must be a boolean' },
	  allowInsecureKeySizes: { isValid: isBoolean, message: '"allowInsecureKeySizes" must be a boolean'},
	  allowInvalidAsymmetricKeyTypes: { isValid: isBoolean, message: '"allowInvalidAsymmetricKeyTypes" must be a boolean'}
	};

	const registered_claims_schema = {
	  iat: { isValid: isNumber, message: '"iat" should be a number of seconds' },
	  exp: { isValid: isNumber, message: '"exp" should be a number of seconds' },
	  nbf: { isValid: isNumber, message: '"nbf" should be a number of seconds' }
	};

	function validate(schema, allowUnknown, object, parameterName) {
	  if (!isPlainObject(object)) {
	    throw new Error('Expected "' + parameterName + '" to be a plain object.');
	  }
	  Object.keys(object)
	    .forEach(function(key) {
	      const validator = schema[key];
	      if (!validator) {
	        if (!allowUnknown) {
	          throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
	        }
	        return;
	      }
	      if (!validator.isValid(object[key])) {
	        throw new Error(validator.message);
	      }
	    });
	}

	function validateOptions(options) {
	  return validate(sign_options_schema, false, options, 'options');
	}

	function validatePayload(payload) {
	  return validate(registered_claims_schema, true, payload, 'payload');
	}

	const options_to_payload = {
	  'audience': 'aud',
	  'issuer': 'iss',
	  'subject': 'sub',
	  'jwtid': 'jti'
	};

	const options_for_objects = [
	  'expiresIn',
	  'notBefore',
	  'noTimestamp',
	  'audience',
	  'issuer',
	  'subject',
	  'jwtid',
	];

	var sign = function (payload, secretOrPrivateKey, options, callback) {
	  if (typeof options === 'function') {
	    callback = options;
	    options = {};
	  } else {
	    options = options || {};
	  }

	  const isObjectPayload = typeof payload === 'object' &&
	                        !Buffer.isBuffer(payload);

	  const header = Object.assign({
	    alg: options.algorithm || 'HS256',
	    typ: isObjectPayload ? 'JWT' : undefined,
	    kid: options.keyid
	  }, options.header);

	  function failure(err) {
	    if (callback) {
	      return callback(err);
	    }
	    throw err;
	  }

	  if (!secretOrPrivateKey && options.algorithm !== 'none') {
	    return failure(new Error('secretOrPrivateKey must have a value'));
	  }

	  if (secretOrPrivateKey != null && !(secretOrPrivateKey instanceof KeyObject)) {
	    try {
	      secretOrPrivateKey = createPrivateKey(secretOrPrivateKey);
	    } catch (_) {
	      try {
	        secretOrPrivateKey = createSecretKey(typeof secretOrPrivateKey === 'string' ? Buffer.from(secretOrPrivateKey) : secretOrPrivateKey);
	      } catch (_) {
	        return failure(new Error('secretOrPrivateKey is not valid key material'));
	      }
	    }
	  }

	  if (header.alg.startsWith('HS') && secretOrPrivateKey.type !== 'secret') {
	    return failure(new Error((`secretOrPrivateKey must be a symmetric key when using ${header.alg}`)))
	  } else if (/^(?:RS|PS|ES)/.test(header.alg)) {
	    if (secretOrPrivateKey.type !== 'private') {
	      return failure(new Error((`secretOrPrivateKey must be an asymmetric key when using ${header.alg}`)))
	    }
	    if (!options.allowInsecureKeySizes &&
	      !header.alg.startsWith('ES') &&
	      secretOrPrivateKey.asymmetricKeyDetails !== undefined && //KeyObject.asymmetricKeyDetails is supported in Node 15+
	      secretOrPrivateKey.asymmetricKeyDetails.modulusLength < 2048) {
	      return failure(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
	    }
	  }

	  if (typeof payload === 'undefined') {
	    return failure(new Error('payload is required'));
	  } else if (isObjectPayload) {
	    try {
	      validatePayload(payload);
	    }
	    catch (error) {
	      return failure(error);
	    }
	    if (!options.mutatePayload) {
	      payload = Object.assign({},payload);
	    }
	  } else {
	    const invalid_options = options_for_objects.filter(function (opt) {
	      return typeof options[opt] !== 'undefined';
	    });

	    if (invalid_options.length > 0) {
	      return failure(new Error('invalid ' + invalid_options.join(',') + ' option for ' + (typeof payload ) + ' payload'));
	    }
	  }

	  if (typeof payload.exp !== 'undefined' && typeof options.expiresIn !== 'undefined') {
	    return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
	  }

	  if (typeof payload.nbf !== 'undefined' && typeof options.notBefore !== 'undefined') {
	    return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
	  }

	  try {
	    validateOptions(options);
	  }
	  catch (error) {
	    return failure(error);
	  }

	  if (!options.allowInvalidAsymmetricKeyTypes) {
	    try {
	      validateAsymmetricKey(header.alg, secretOrPrivateKey);
	    } catch (error) {
	      return failure(error);
	    }
	  }

	  const timestamp = payload.iat || Math.floor(Date.now() / 1000);

	  if (options.noTimestamp) {
	    delete payload.iat;
	  } else if (isObjectPayload) {
	    payload.iat = timestamp;
	  }

	  if (typeof options.notBefore !== 'undefined') {
	    try {
	      payload.nbf = timespan(options.notBefore, timestamp);
	    }
	    catch (err) {
	      return failure(err);
	    }
	    if (typeof payload.nbf === 'undefined') {
	      return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
	    }
	  }

	  if (typeof options.expiresIn !== 'undefined' && typeof payload === 'object') {
	    try {
	      payload.exp = timespan(options.expiresIn, timestamp);
	    }
	    catch (err) {
	      return failure(err);
	    }
	    if (typeof payload.exp === 'undefined') {
	      return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
	    }
	  }

	  Object.keys(options_to_payload).forEach(function (key) {
	    const claim = options_to_payload[key];
	    if (typeof options[key] !== 'undefined') {
	      if (typeof payload[claim] !== 'undefined') {
	        return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
	      }
	      payload[claim] = options[key];
	    }
	  });

	  const encoding = options.encoding || 'utf8';

	  if (typeof callback === 'function') {
	    callback = callback && once(callback);

	    jws.createSign({
	      header: header,
	      privateKey: secretOrPrivateKey,
	      payload: payload,
	      encoding: encoding
	    }).once('error', callback)
	      .once('done', function (signature) {
	        // TODO: Remove in favor of the modulus length check before signing once node 15+ is the minimum supported version
	        if(!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
	          return callback(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`))
	        }
	        callback(null, signature);
	      });
	  } else {
	    let signature = jws.sign({header: header, payload: payload, secret: secretOrPrivateKey, encoding: encoding});
	    // TODO: Remove in favor of the modulus length check before signing once node 15+ is the minimum supported version
	    if(!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
	      throw new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`)
	    }
	    return signature
	  }
	};

	var jsonwebtoken = {
	  decode: decode$1,
	  verify: verify,
	  sign: sign,
	  JsonWebTokenError: JsonWebTokenError_1,
	  NotBeforeError: NotBeforeError_1,
	  TokenExpiredError: TokenExpiredError_1,
	};

	var jwt = /*@__PURE__*/getDefaultExportFromCjs(jsonwebtoken);

	class Token {
	    static isValid(token) {
	        if (!token) {
	            return false;
	        }
	        try {
	            jwt.verify(token, arrowyEnv.env('JWT_SECRET_KEY'));
	        }
	        catch (error) {
	            return false;
	        }
	        return true;
	    }
	    static create(payload) {
	        return jwt.sign(payload, arrowyEnv.env('JWT_SECRET_KEY'), {
	            expiresIn: arrowyEnv.env('JWT_EXPIRES_IN', '2h')
	        });
	    }
	}

	const verifyTokenMiddleware = (request, response, next) => {
	    const token = request.headers.authorization;
	    if (!token) {
	        return response.status(403).json({
	            message: 'There is no token provided'
	        });
	    }
	    if (!Token.isValid(token)) {
	        return response.status(403).json({
	            message: 'Invalid token'
	        });
	    }
	    next();
	};

	exports.Token = Token;
	exports.verifyTokenMiddleware = verifyTokenMiddleware;

}));
