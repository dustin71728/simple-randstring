"use strict";
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
try {
    require('babel-polyfill');
}
catch (e) {
    console.warn(e.message);
}
var crypto = require("crypto");
var isFinite = require('lodash.isfinite');
var isString = require('lodash.isstring');
var CHARACTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var MAX_INTEGER = Number.MAX_SAFE_INTEGER;
var ALIGNED_SIZE = 256;
exports.MAXIMUM_POOL_SIZE = 200;
var customCharset = '';
var alignedCharset = CHARACTERS.repeat(Math.floor(ALIGNED_SIZE / CHARACTERS.length));
function _getCharset() {
    var letters = (isString(customCharset) && customCharset.length)
        ? customCharset : CHARACTERS;
    var base = letters.length;
    return { letters: letters, base: base };
}
function setRandCharset(argCharset) {
    customCharset = argCharset;
    var _a = _getCharset(), letters = _a.letters, base = _a.base;
    alignedCharset = letters.repeat(Math.floor(ALIGNED_SIZE / base));
    if (!alignedCharset.length) {
        alignedCharset = letters.substr(0, ALIGNED_SIZE);
    }
}
exports.setRandCharset = setRandCharset;
function _TestGetCharset() {
    return _getCharset();
}
exports._TestGetCharset = _TestGetCharset;
function _estimatedPoolSize(base, randStrSize, strongCrypto) {
    var poolSize = 0;
    if (strongCrypto) {
        poolSize = Math.ceil(randStrSize / 4);
    }
    else {
        poolSize = Math.ceil(randStrSize * Math.log2(base) / 53);
    }
    return poolSize > exports.MAXIMUM_POOL_SIZE ? exports.MAXIMUM_POOL_SIZE : poolSize;
}
function _TestEstimatedPoolSize(randStrSize, strongCrypto) {
    var base = _getCharset().base;
    return _estimatedPoolSize(base, randStrSize, strongCrypto);
}
exports._TestEstimatedPoolSize = _TestEstimatedPoolSize;
function _isWindow(obj) {
    return !!obj.document;
}
function _getCrypto(obj) {
    return obj.crypto || obj.msCrypto;
}
function _strongCryptoSupported() {
    if (_isWindow(global)) {
        return !!(_getCrypto(global) && _getCrypto(global).getRandomValues);
    }
    else {
        return true;
    }
}
function _getRandomList(size, strongCrypto) {
    var randList = new Array(size);
    if (strongCrypto && _strongCryptoSupported()) {
        if (_isWindow(global)) {
            var tempList = new Uint32Array(size);
            _getCrypto(global).getRandomValues(tempList);
            tempList.forEach(function (value, index) {
                randList[index] = value;
            });
            return randList;
        }
        else {
            var buffer = crypto.randomBytes(size * 4);
            for (var i = 0; i < size; ++i) {
                randList[i] = buffer.readUInt32LE(i * 4);
            }
            return randList;
        }
    }
    else {
        var randList_1 = [];
        for (var i = 0; i < size; ++i) {
            randList_1[i] = Math.floor(Math.random() * MAX_INTEGER);
        }
        return randList_1;
    }
}
function _getRandomIntPool(base, randStrSize, strongCrypto) {
    var canStrongCrypto = strongCrypto && _strongCryptoSupported();
    var poolSize = _estimatedPoolSize(base, randStrSize, canStrongCrypto);
    return _getRandomList(poolSize, canStrongCrypto);
}
function _TestGetRandomIntPool(randStrSize, strongCrypto) {
    var base = _getCharset().base;
    return _getRandomIntPool(base, randStrSize, strongCrypto);
}
exports._TestGetRandomIntPool = _TestGetRandomIntPool;
function _getAlignedCharset(strongCrypto) {
    var _a = _getCharset(), base = _a.base, letters = _a.letters;
    var newCharset = alignedCharset;
    var remain = ALIGNED_SIZE % base;
    if (!remain) {
        return { base: ALIGNED_SIZE, letters: newCharset };
    }
    var randList = _getRandomList(remain, strongCrypto);
    for (var index = 0; index < remain; ++index) {
        newCharset += letters[randList[index] % base];
    }
    return { base: ALIGNED_SIZE, letters: newCharset };
}
function randomString(strLength, strongCrypto) {
    if (strongCrypto === void 0) { strongCrypto = false; }
    if (!isFinite(strLength))
        return '';
    var result = '';
    var randNum = 0;
    var letterPosition = 0;
    if (strongCrypto && _strongCryptoSupported()) {
        var _a = _getAlignedCharset(strongCrypto), base = _a.base, letters = _a.letters;
        var randomNumbers = _getRandomIntPool(base, strLength, strongCrypto);
        while (result.length < strLength) {
            if (!randomNumbers.length) {
                randomNumbers = _getRandomIntPool(base, strLength - result.length, strongCrypto);
            }
            randNum = randomNumbers.pop();
            for (var byteOrder = 0; byteOrder < 4; ++byteOrder) {
                result += letters[randNum & 0x000000FF];
                randNum = randNum >> 8;
                if (result.length === strLength)
                    break;
            }
        }
    }
    else {
        var _b = _getCharset(), base = _b.base, letters = _b.letters;
        var randomNumbers = _getRandomIntPool(base, strLength, strongCrypto);
        while (result.length < strLength) {
            if (randNum < 1) {
                if (!randomNumbers.length) {
                    randomNumbers = _getRandomIntPool(base, strLength - result.length, strongCrypto);
                }
                randNum = randomNumbers.pop();
            }
            letterPosition = randNum % base;
            randNum = Math.floor(randNum / base);
            result += letters.charAt(letterPosition);
        }
    }
    return result;
}
exports.default = randomString;
