/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import {
  randomString,
  _TestEstimatedPoolSize,
  setRandCharset,
  _TestGetCharset,
  _TestGetRandomIntPool,
  MAXIMUM_POOL_SIZE
} from './index'
import 'should'

const isFinite = require('lodash.isfinite')

interface Elements {
  [element: string]: number
}

class Statistics {
  private elements: Elements
  constructor() {
    this.elements = {}
  }
  public standardDeviationRatio(arr: number[]) {
    let total = arr.reduce((pre, cur) => pre + cur, 0)
    let average = 0
    average = total / arr.length
    let variation = 0
    for (let value of arr) {
      variation += Math.pow(value - average, 2)
    }
    return Math.sqrt(variation / arr.length) / average
  }
  public setElements(charset: string) {
    for (const char of charset.split('')) {
      if (!this.elements[char]) {
        this.elements[char] = 1
      }
      else {
        this.elements[char]++
      }
    }
  }
  public getResult(): number {
    let arr: number[] = []
    for (const element of Object.keys(this.elements)) {
      arr.push(this.elements[element])
    }
    return this.standardDeviationRatio(arr)
  }
}

describe('Test setRandCharset', function () {
  it('should return correct number of default characters', function () {
    const { base } = _TestGetCharset()
    base.should.be.equal(62, 'default collection')
  })
  it('should return the number of characters specified by the argument', function () {
    setRandCharset('0123456789')
    const { base } = _TestGetCharset()
    base.should.be.equal(10, 'collection: [0-9]')
  })
})

describe('Test estimatedPoolSize', function () {
  it('should return correct length when characters are equal to [0-9]', function () {
    setRandCharset('0123456789')

    _TestEstimatedPoolSize(16, false).should.be.equal(2, 'strongCrypto=false')
    _TestEstimatedPoolSize(16, true).should.be.equal(4, 'strongCrypto=true')
  })
  it('should return correct length when characters are default collection', function () {
    setRandCharset('')

    _TestEstimatedPoolSize(20, false).should.be.equal(3, 'strongCrypto=false')
    _TestEstimatedPoolSize(20, true).should.be.equal(5, 'strongCrypto=true')
  })
  it('should return maximum length', function () {
    setRandCharset('')
    _TestEstimatedPoolSize(100000, true).should.be.equal(MAXIMUM_POOL_SIZE)
  })
})

describe('Test getRandomIntPool', function () {
  it('should return an array and it\'s length is the same as _TestEstimatedPoolSize', function () {
    _TestGetRandomIntPool(10, false).filter(value => isFinite(value)).length
      .should.be.equal(_TestEstimatedPoolSize(10, false))

    _TestGetRandomIntPool(10, true).filter(value => isFinite(value)).length
      .should.be.equal(_TestEstimatedPoolSize(10, true))

    _TestGetRandomIntPool(1000, false).filter(value => isFinite(value)).length
      .should.be.equal(_TestEstimatedPoolSize(1000, false))

    _TestGetRandomIntPool(1000, true).filter(value => isFinite(value)).length
      .should.be.equal(_TestEstimatedPoolSize(1000, true))
  })
})

describe('Test randomString', function () {
  it('should return string that the length is specified by the argument', function () {
    randomString(10, false).length.should.be.equal(10)
    randomString(10, true).length.should.be.equal(10)
    randomString(50, false).length.should.be.equal(50)
    randomString(50, true).length.should.be.equal(50)
    randomString(1000, false).length.should.be.equal(1000)
    randomString(1000, true).length.should.be.equal(1000)
    randomString(10000, false).length.should.be.equal(10000)
    randomString(10000, true).length.should.be.equal(10000)
  })
})

describe('Test long randomString', function () {
  this.timeout(10000)
  it('should return string which length is 1e7(crypto is on)', function () {
    randomString(10e6, true).length.should.be.equal(1e7)
  })
  it('should return string which length is 1e7(crypto is off)', function () {
    randomString(10e6, false).length.should.be.equal(1e7)
  })
})

describe('Examine random string', function () {
  it('should return deviation ratio less than 0.02 when strongCrypto is on', function () {
    const Statistics1 = new Statistics()
    for (let i = 0; i < 10000; ++i) {
      Statistics1.setElements(randomString(30, true))
    }
    Statistics1.getResult().should.below(0.02)
  })
  it('should return deviation ratio less than 0.16 when strongCrypto is off', function () {
    const Statistics1 = new Statistics()
    for (let i = 0; i < 10000; ++i) {
      Statistics1.setElements(randomString(30, false))
    }
    Statistics1.getResult().should.below(0.16)
  })
})