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
var LETTERS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var MAX_INTEGER = Number.MAX_SAFE_INTEGER;
var ALIGNED_SIZE = 256;
exports.MAXIMUM_POOL_SIZE = 200;
var customLetters = '';
var alignedLetters = LETTERS.repeat(Math.floor(ALIGNED_SIZE / LETTERS.length));
function _getLetters() {
    var letters = (isString(customLetters) && customLetters.length)
        ? customLetters : LETTERS;
    var base = letters.length;
    return { letters: letters, base: base };
}
function setRandLetters(argLetters) {
    customLetters = argLetters;
    var _a = _getLetters(), letters = _a.letters, base = _a.base;
    alignedLetters = letters.repeat(Math.floor(ALIGNED_SIZE / base));
    if (!alignedLetters.length) {
        alignedLetters = letters.substr(0, ALIGNED_SIZE);
    }
}
exports.setRandLetters = setRandLetters;
function _TestGetLetters() {
    return _getLetters();
}
exports._TestGetLetters = _TestGetLetters;
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
    var base = _getLetters().base;
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
    var base = _getLetters().base;
    return _getRandomIntPool(base, randStrSize, strongCrypto);
}
exports._TestGetRandomIntPool = _TestGetRandomIntPool;
function _getAlignedLetters(strongCrypto) {
    var _a = _getLetters(), base = _a.base, letters = _a.letters;
    var newLetters = alignedLetters;
    var remain = ALIGNED_SIZE % base;
    if (!remain) {
        return { base: ALIGNED_SIZE, letters: newLetters };
    }
    var randList = _getRandomList(remain, strongCrypto);
    for (var index = 0; index < remain; ++index) {
        newLetters += letters[randList[index] % base];
    }
    return { base: ALIGNED_SIZE, letters: newLetters };
}
function randomString(strLength, strongCrypto) {
    if (strongCrypto === void 0) { strongCrypto = false; }
    if (!isFinite(strLength))
        return '';
    var result = '';
    var randNum = 0;
    var letterPosition = 0;
    if (strongCrypto && _strongCryptoSupported()) {
        var _a = _getAlignedLetters(strongCrypto), base = _a.base, letters = _a.letters;
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
        var _b = _getLetters(), base = _b.base, letters = _b.letters;
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
