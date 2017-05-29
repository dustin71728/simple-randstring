/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

try {
    require('babel-polyfill')
}
catch(e) {
    console.warn(e.message)
}

import * as crypto from 'crypto'
const isFinite = require('lodash.isfinite')
const isString = require('lodash.isstring')

const LETTERS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_INTEGER: number = Number.MAX_SAFE_INTEGER

export const MAXIMUM_POOL_SIZE: number = 100

export interface LetterInfo {
    letters: string
    base: number
}

let customLetters: string = ''

function _getLetters(): LetterInfo {
    const letters: string = ( isString( customLetters ) && customLetters.length )
        ? customLetters: LETTERS
    const base: number = letters.length
    return { letters, base }
}

export function setRandLetters(letters: string): void {
    customLetters = letters
}

export function _TestGetLetters(): LetterInfo {
    return _getLetters()
}

function _estimatedPoolSize(
    base: number,
    randStrSize: number,
    strongCrypto: boolean ): number
{
    const base2Multiplier = Math.log2(base)
    let poolSize = 0
    if( strongCrypto ) {
        poolSize = Math.ceil( randStrSize * base2Multiplier / 32 )
    }
    else {
        poolSize = Math.ceil( randStrSize * base2Multiplier / 53 )
    }
    return poolSize > MAXIMUM_POOL_SIZE ? MAXIMUM_POOL_SIZE : poolSize
}

export function _TestEstimatedPoolSize(
    randStrSize: number,
    strongCrypto: boolean ): number
{
    const { base } = _getLetters()
    return _estimatedPoolSize( base, randStrSize, strongCrypto )
}

export type RandomIntList = number[]

function _isWindow( obj: Object ): obj is Window {
    return !!(<Window>obj).document
}

interface MSWindow extends Window {
    msCrypto: Pick<Window, 'crypto'>
}

function _getCrypto( obj: Window ): Crypto {
    return obj.crypto || (<MSWindow>obj).msCrypto
}

function _getRandomIntPool(
    base: number,
    randStrSize: number,
    strongCrypto: boolean ): RandomIntList
{
    const poolSize: number = _estimatedPoolSize( base, randStrSize, strongCrypto )
    function weakCrypto(): number[] {
        let randList: number[] = []
        for( let i=0; i<poolSize; ++i ) {
            randList[i] = Math.floor( Math.random() * MAX_INTEGER )
        }
        return randList
    }
    if( strongCrypto ) {
        const randList = new Array( poolSize )
        if( _isWindow( global ) ) {
            if( _getCrypto( global ) && _getCrypto( global ).getRandomValues ) {
                const tempList = new Uint32Array( poolSize )
                _getCrypto( global ).getRandomValues( tempList )
                tempList.forEach( ( value, index ) => {
                    randList[index] = value
                } )
                return randList
            }
            else {
                console.error('Browser is not capable of generating secure random number, fall back to use random()')
                return weakCrypto()
            }
        }
        else {
            for( let i=0; i<poolSize; ++i ) {
                randList[i] = crypto.randomBytes(32).readUInt32LE(0)
            }
            return randList
        }
    }
    else {
        return weakCrypto()
    }
}

export function _TestGetRandomIntPool(
    randStrSize: number,
    strongCrypto: boolean ): RandomIntList
{
    const { base } = _getLetters()
    return _getRandomIntPool( base, randStrSize, strongCrypto )
}

export default function randomString(
    strLength: number,
    strongCrypto: boolean = false): string
{
    if (!isFinite(strLength)) return ''
    let result: string = ''
    let randNum: number = 0
    let letterPosition: number = 0

    const { base, letters } = _getLetters()

    let randomNumbers = _getRandomIntPool( base, strLength, strongCrypto )

    while (result.length < strLength) {
        if (randNum < 1) {
            if( !randomNumbers.length ) {
                randomNumbers = _getRandomIntPool( base, strLength - result.length, strongCrypto )
            }
            randNum = <number>randomNumbers.pop()
        }
        letterPosition = randNum % base
        randNum = Math.floor(randNum / base)
        result += letters.charAt(letterPosition)
    }
    return result
}
