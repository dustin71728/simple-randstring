"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
var index_1 = require("./index");
require("should");
var isFinite = require('lodash.isfinite');
var Statistics = (function () {
    function Statistics() {
        this.elements = {};
    }
    Statistics.prototype.standardDeviationRatio = function (arr) {
        var total = arr.reduce(function (pre, cur) { return pre + cur; }, 0);
        var average = 0;
        average = total / arr.length;
        var variation = 0;
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var value = arr_1[_i];
            variation += Math.pow(value - average, 2);
        }
        return Math.sqrt(variation / arr.length) / average;
    };
    Statistics.prototype.setElements = function (charset) {
        for (var _i = 0, _a = charset.split(''); _i < _a.length; _i++) {
            var char = _a[_i];
            if (!this.elements[char]) {
                this.elements[char] = 1;
            }
            else {
                this.elements[char]++;
            }
        }
    };
    Statistics.prototype.getResult = function () {
        var arr = [];
        for (var _i = 0, _a = Object.keys(this.elements); _i < _a.length; _i++) {
            var element = _a[_i];
            arr.push(this.elements[element]);
        }
        return this.standardDeviationRatio(arr);
    };
    return Statistics;
}());
describe('Test setRandCharset', function () {
    it('should return correct number of default characters', function () {
        var base = index_1._TestGetCharset().base;
        base.should.be.equal(62, 'default collection');
    });
    it('should return the number of characters specified by the argument', function () {
        index_1.setRandCharset('0123456789');
        var base = index_1._TestGetCharset().base;
        base.should.be.equal(10, 'collection: [0-9]');
    });
});
describe('Test estimatedPoolSize', function () {
    it('should return correct length when characters are equal to [0-9]', function () {
        index_1.setRandCharset('0123456789');
        index_1._TestEstimatedPoolSize(16, false).should.be.equal(2, 'strongCrypto=false');
        index_1._TestEstimatedPoolSize(16, true).should.be.equal(4, 'strongCrypto=true');
    });
    it('should return correct length when characters are default collection', function () {
        index_1.setRandCharset('');
        index_1._TestEstimatedPoolSize(20, false).should.be.equal(3, 'strongCrypto=false');
        index_1._TestEstimatedPoolSize(20, true).should.be.equal(5, 'strongCrypto=true');
    });
    it('should return maximum length', function () {
        index_1.setRandCharset('');
        index_1._TestEstimatedPoolSize(5000, false)
            .should.be.equal(index_1.MAXIMUM_POOL_SIZE, 'strongCrypto=false');
        index_1._TestEstimatedPoolSize(1000, true)
            .should.be.equal(index_1.MAXIMUM_POOL_SIZE, 'strongCrypto=true');
    });
});
describe('Test getRandomIntPool', function () {
    it('should return an array and it\'s length is the same as _TestEstimatedPoolSize', function () {
        index_1._TestGetRandomIntPool(10, false).filter(function (value) { return isFinite(value); }).length
            .should.be.equal(index_1._TestEstimatedPoolSize(10, false));
        index_1._TestGetRandomIntPool(10, true).filter(function (value) { return isFinite(value); }).length
            .should.be.equal(index_1._TestEstimatedPoolSize(10, true));
        index_1._TestGetRandomIntPool(1000, false).filter(function (value) { return isFinite(value); }).length
            .should.be.equal(index_1._TestEstimatedPoolSize(1000, false));
        index_1._TestGetRandomIntPool(1000, true).filter(function (value) { return isFinite(value); }).length
            .should.be.equal(index_1._TestEstimatedPoolSize(1000, true));
    });
});
describe('Test randomString', function () {
    it('should return string that the length is specified by the argument', function () {
        index_1.default(10, false).length.should.be.equal(10);
        index_1.default(10, true).length.should.be.equal(10);
        index_1.default(50, false).length.should.be.equal(50);
        index_1.default(50, true).length.should.be.equal(50);
        index_1.default(1000, false).length.should.be.equal(1000);
        index_1.default(1000, true).length.should.be.equal(1000);
        index_1.default(10000, false).length.should.be.equal(10000);
        index_1.default(10000, true).length.should.be.equal(10000);
    });
});
describe('Examine random string', function () {
    it('should return deviation ratio less than 0.02 when strongCrypto is on', function () {
        var Statistics1 = new Statistics();
        for (var i = 0; i < 10000; ++i) {
            Statistics1.setElements(index_1.default(30, true));
        }
        Statistics1.getResult().should.below(0.02);
    });
    it('should return deviation ratio less than 0.16 when strongCrypto is off', function () {
        var Statistics1 = new Statistics();
        for (var i = 0; i < 10000; ++i) {
            Statistics1.setElements(index_1.default(30, false));
        }
        Statistics1.getResult().should.below(0.16);
    });
});
