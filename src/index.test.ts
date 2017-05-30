/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
import randomString, {
    _TestEstimatedPoolSize,
    setRandLetters,
    LetterInfo,
    _TestGetLetters,
    _TestGetRandomIntPool,
    MAXIMUM_POOL_SIZE
} from './index'
import * as assert from 'assert'
const isFinite = require('lodash.isfinite')

interface Elements {
    [element: string]: number
}

class Statistics {
    private elements: Elements
    constructor() {
        this.elements = {}
    }
    public standardDeviation( arr: number[] ) {
        let total = arr.reduce( ( pre, cur ) => pre + cur, 0 )
        let average = 0
        average = total / arr.length
        let variation = 0
        for( let value of arr ) {
            variation += Math.pow( value - average, 2 )
        }
        return Math.sqrt( variation / arr.length )
    }
    public setElements( letters: string ) {
        for( const letter of letters.split('') ) {
            if( !this.elements[ letter ] ) {
                this.elements[ letter ] = 1
            }
            else {
                this.elements[ letter ]++
            }
        }
    }
    public getResult(): number {
        let arr: number[] = []
        for( const element of Object.keys( this.elements ) ) {
            arr.push( this.elements[ element ] )
        }
        return this.standardDeviation( arr )
    }
}

describe('Random string unit test', function() {

    describe('setRandLetters', function() {
        it('should have right number of letters', function() {
            const { base } = _TestGetLetters()
            assert.equal( 62, base, 'default collection' )
        })
        it('should have the same number as the argument passed to setRandLetters', function() {
            setRandLetters('0123456789')
            const { base } = _TestGetLetters()
            assert.equal( 10, base, 'collection: [0-9]' )
        })
    })

    describe('_estimatedPoolSize', function() {
        it('should return right pool size when letters are [0-9]', function() {
            setRandLetters('0123456789')
            assert.equal(2, _TestEstimatedPoolSize( 16, false ), 'strongCrypto=false' )
            assert.equal(4, _TestEstimatedPoolSize( 16, true ), 'strongCrypto=true' )
        })
        it('should return right pool size when letters are default collection', function() {
            setRandLetters('')
            assert.equal(3, _TestEstimatedPoolSize( 20, false ) )
            assert.equal(5, _TestEstimatedPoolSize( 20, true ) )
        })
        it('should return maximum pool size', function() {
            setRandLetters('')
            assert.equal(MAXIMUM_POOL_SIZE, _TestEstimatedPoolSize( 5000, false ) )
            assert.equal(MAXIMUM_POOL_SIZE, _TestEstimatedPoolSize( 1000, true ) )
        })
    })

    describe('_getRandomIntPool', function() {
        it('should return an array and it\'s size is the same as _TestEstimatedPoolSize', function() {
            assert.equal(
                _TestEstimatedPoolSize( 10, false ),
                _TestGetRandomIntPool( 10, false ).filter( value => isFinite( value ) ).length
            )
            assert.equal(
                _TestEstimatedPoolSize( 10, true ),
                _TestGetRandomIntPool( 10, true ).filter( value => isFinite( value ) ).length
            )
            assert.equal(
                _TestEstimatedPoolSize( 1000, false ),
                _TestGetRandomIntPool( 1000, false ).filter( value => isFinite( value ) ).length
            )
            assert.equal(
                _TestEstimatedPoolSize( 1000, true ),
                _TestGetRandomIntPool( 1000, true ).filter( value => isFinite( value ) ).length
            )
        })
    })

    describe('randomString', function() {
        it('should return string that the length is specified by the argument', function() {
            assert.equal( 10, randomString( 10, false ).length )
            assert.equal( 10, randomString( 10, true ).length )
            assert.equal( 50, randomString( 50, false ).length )
            assert.equal( 50, randomString( 50, true ).length )
            assert.equal( 1000, randomString( 1000, false ).length )
            assert.equal( 1000, randomString( 1000, true ).length )
            assert.equal( 10000, randomString( 10000, false ).length )
            assert.equal( 10000, randomString( 10000, true ).length )
        })
    })

    describe('statistics', function() {
        it('should return standard deviation less than 80 when strongCrypto is on', function() {
            const Statistics1 = new Statistics()
            for( let i=0; i<10000; ++i ) {
                Statistics1.setElements( randomString( 30, true ) )
            }
            assert.equal( true, Statistics1.getResult() < 80 )
        })
        it('should return standard deviation less than 800 when strongCrypto is off', function() {
            const Statistics1 = new Statistics()
            for( let i=0; i<10000; ++i ) {
                Statistics1.setElements( randomString( 30, false ) )
            }
            assert.equal( true, Statistics1.getResult() < 800 )
        })
    })
})