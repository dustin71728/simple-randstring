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
exports.MAXIMUM_POOL_SIZE = 100;
var customLetters = '';
function _getLetters() {
    var letters = (isString(customLetters) && customLetters.length)
        ? customLetters : LETTERS;
    var base = letters.length;
    return { letters: letters, base: base };
}
function setRandLetters(letters) {
    customLetters = letters;
}
exports.setRandLetters = setRandLetters;
function _TestGetLetters() {
    return _getLetters();
}
exports._TestGetLetters = _TestGetLetters;
function _estimatedPoolSize(base, randStrSize, strongCrypto) {
    var base2Multiplier = Math.log2(base);
    var poolSize = 0;
    if (strongCrypto) {
        poolSize = Math.ceil(randStrSize * base2Multiplier / 32);
    }
    else {
        poolSize = Math.ceil(randStrSize * base2Multiplier / 53);
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
function _getRandomIntPool(base, randStrSize, strongCrypto) {
    var poolSize = _estimatedPoolSize(base, randStrSize, strongCrypto);
    function weakCrypto() {
        var randList = [];
        for (var i = 0; i < poolSize; ++i) {
            randList[i] = Math.floor(Math.random() * MAX_INTEGER);
        }
        return randList;
    }
    if (strongCrypto) {
        var randList_1 = new Array(poolSize);
        if (_isWindow(global)) {
            if (_getCrypto(global) && _getCrypto(global).getRandomValues) {
                var tempList = new Uint32Array(poolSize);
                _getCrypto(global).getRandomValues(tempList);
                tempList.forEach(function (value, index) {
                    randList_1[index] = value;
                });
                return randList_1;
            }
            else {
                console.error('Browser is not capable of generating secure random number, fall back to use random()');
                return weakCrypto();
            }
        }
        else {
            for (var i = 0; i < poolSize; ++i) {
                randList_1[i] = crypto.randomBytes(32).readUInt32LE(0);
            }
            return randList_1;
        }
    }
    else {
        return weakCrypto();
    }
}
function _TestGetRandomIntPool(randStrSize, strongCrypto) {
    var base = _getLetters().base;
    return _getRandomIntPool(base, randStrSize, strongCrypto);
}
exports._TestGetRandomIntPool = _TestGetRandomIntPool;
function randomString(strLength, strongCrypto) {
    if (strongCrypto === void 0) { strongCrypto = false; }
    if (!isFinite(strLength))
        return '';
    var result = '';
    var randNum = 0;
    var letterPosition = 0;
    var _a = _getLetters(), base = _a.base, letters = _a.letters;
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
    return result;
}
exports.default = randomString;
