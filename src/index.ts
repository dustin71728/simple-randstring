/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

try {
    require('babel-polyfill')
}
catch(e) {
    console.warn(e.message)
}
const isFinite = require('lodash.isfinite')
const isString = require('lodash.isstring')
const crypto = require('crypto-browserify') 

const LETTERS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_INTEGER: number = Number.MAX_SAFE_INTEGER

let customLetters: string = ''
export function setRandLetters(letters: string): void {
    customLetters = letters
}

type RandomIntList = number[] | Uint32Array

export function _getRandomIntPool(
    base: number,
    randStrSize: number, 
    strongCrypto: boolean
): RandomIntList {
    const poolSize: number = _estimatedPoolSize( base, randStrSize, strongCrypto )
    if( strongCrypto ) {
        const randList = new Uint32Array( poolSize )
        if( window.crypto && window.crypto.getRandomValues ) {
            window.crypto.getRandomValues( randList )
            return randList
        }
        else {
            for( let i=0; i<poolSize; ++i ) {
                randList[i] = crypto.randomBytes(32).readUInt32LE()
            }
            return randList
        }
    }
    else {
        let randList: number[] = []
        for( let i=0; i<poolSize; ++i ) {
            randList[i] = Math.floor( Math.random() * MAX_INTEGER )
        }
        return randList
    }
}

export function _estimatedPoolSize(
    base: number, 
    randStrSize: number, 
    strongCrypto: boolean
): number {
    const base2Multiplier = Math.log2(base)
    let poolSize = 0
    if( strongCrypto ) {
        poolSize = Math.ceil( randStrSize * base2Multiplier / 32 )        
    }
    else {
        poolSize = Math.ceil( randStrSize * base2Multiplier / 1023 )
    }
    return poolSize > 100 ? 100 : poolSize
}

export default function randomString(strLength: number, strongCrypto: boolean = false): string {
    if (!isFinite(strLength)) return ''
    let result: string = ''
    let randNum: number = 0
    let letterPosition: number = 0

    const letters: string = ( isString( customLetters ) && customLetters.length )
        ? customLetters: LETTERS
    const base: number = letters.length

    let randomNumbers = _getRandomIntPool( base, strLength, strongCrypto )
    let randIndex = 0

    while (result.length < strLength) {
        if (randNum < 1) {
            if( randIndex >= randomNumbers.length ) {
                randIndex = 0
                randomNumbers = _getRandomIntPool( base, strLength - result.length, strongCrypto )
            }
            randNum = randomNumbers[randIndex++]
        }
        letterPosition = randNum % base
        randNum = Math.floor(randNum / base)
        result += letters.charAt(letterPosition)
    }
    return result
}
