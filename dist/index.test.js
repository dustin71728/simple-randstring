"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var index_1 = require("./index");
var assert = require("assert");
var isFinite = require('lodash.isfinite');
var Statistics = (function () {
    function Statistics() {
        this.elements = {};
    }
    Statistics.prototype.standardDeviation = function (arr) {
        var total = arr.reduce(function (pre, cur) { return pre + cur; }, 0);
        var average = 0;
        average = total / arr.length;
        var variation = 0;
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var value = arr_1[_i];
            variation += Math.pow(value - average, 2);
        }
        return Math.sqrt(variation / arr.length);
    };
    Statistics.prototype.setElements = function (letters) {
        for (var _i = 0, _a = letters.split(''); _i < _a.length; _i++) {
            var letter = _a[_i];
            if (!this.elements[letter]) {
                this.elements[letter] = 1;
            }
            else {
                this.elements[letter]++;
            }
        }
    };
    Statistics.prototype.getResult = function () {
        var arr = [];
        for (var _i = 0, _a = Object.keys(this.elements); _i < _a.length; _i++) {
            var element = _a[_i];
            arr.push(this.elements[element]);
        }
        return this.standardDeviation(arr);
    };
    return Statistics;
}());
describe('Random string unit test', function () {
    describe('setRandLetters', function () {
        it('should have right number of letters', function () {
            var base = index_1._TestGetLetters().base;
            assert.equal(62, base, 'default collection');
        });
        it('should have the same number as the argument passed to setRandLetters', function () {
            index_1.setRandLetters('0123456789');
            var base = index_1._TestGetLetters().base;
            assert.equal(10, base, 'collection: [0-9]');
        });
    });
    describe('_estimatedPoolSize', function () {
        it('should return right pool size when letters are [0-9]', function () {
            index_1.setRandLetters('0123456789');
            assert.equal(2, index_1._TestEstimatedPoolSize(16, false), 'strongCrypto=false');
            assert.equal(4, index_1._TestEstimatedPoolSize(16, true), 'strongCrypto=true');
        });
        it('should return right pool size when letters are default collection', function () {
            index_1.setRandLetters('');
            assert.equal(3, index_1._TestEstimatedPoolSize(20, false));
            assert.equal(5, index_1._TestEstimatedPoolSize(20, true));
        });
        it('should return maximum pool size', function () {
            index_1.setRandLetters('');
            assert.equal(index_1.MAXIMUM_POOL_SIZE, index_1._TestEstimatedPoolSize(5000, false));
            assert.equal(index_1.MAXIMUM_POOL_SIZE, index_1._TestEstimatedPoolSize(1000, true));
        });
    });
    describe('_getRandomIntPool', function () {
        it('should return an array and it\'s size is the same as _TestEstimatedPoolSize', function () {
            assert.equal(index_1._TestEstimatedPoolSize(10, false), index_1._TestGetRandomIntPool(10, false).filter(function (value) { return isFinite(value); }).length);
            assert.equal(index_1._TestEstimatedPoolSize(10, true), index_1._TestGetRandomIntPool(10, true).filter(function (value) { return isFinite(value); }).length);
            assert.equal(index_1._TestEstimatedPoolSize(1000, false), index_1._TestGetRandomIntPool(1000, false).filter(function (value) { return isFinite(value); }).length);
            assert.equal(index_1._TestEstimatedPoolSize(1000, true), index_1._TestGetRandomIntPool(1000, true).filter(function (value) { return isFinite(value); }).length);
        });
    });
    describe('randomString', function () {
        it('should return string that the length is specified by the argument', function () {
            assert.equal(10, index_1.default(10, false).length);
            assert.equal(10, index_1.default(10, true).length);
            assert.equal(50, index_1.default(50, false).length);
            assert.equal(50, index_1.default(50, true).length);
            assert.equal(1000, index_1.default(1000, false).length);
            assert.equal(1000, index_1.default(1000, true).length);
            assert.equal(10000, index_1.default(10000, false).length);
            assert.equal(10000, index_1.default(10000, true).length);
        });
    });
    describe('statistics', function () {
        it('should return standard deviation less than 80 when strongCrypto is on', function () {
            var Statistics1 = new Statistics();
            for (var i = 0; i < 10000; ++i) {
                Statistics1.setElements(index_1.default(30, true));
            }
            assert.equal(true, Statistics1.getResult() < 80);
        });
        it('should return standard deviation less than 800 when strongCrypto is off', function () {
            var Statistics1 = new Statistics();
            for (var i = 0; i < 10000; ++i) {
                Statistics1.setElements(index_1.default(30, false));
            }
            assert.equal(true, Statistics1.getResult() < 800);
        });
    });
});
