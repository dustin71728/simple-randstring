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
const ALIGNED_SIZE = 256

export const MAXIMUM_POOL_SIZE: number = 200

export interface LetterInfo {
    letters: string
    base: number
}

let customLetters: string = ''
let alignedLetters: string = LETTERS.repeat( Math.floor( ALIGNED_SIZE / LETTERS.length ) )

function _getLetters(): LetterInfo {
    const letters: string = ( isString( customLetters ) && customLetters.length )
        ? customLetters: LETTERS
    const base: number = letters.length
    return { letters, base }
}

export function setRandLetters( argLetters: string ): void {
    customLetters = argLetters
    const { letters, base } = _getLetters()
    alignedLetters = letters.repeat( Math.floor( ALIGNED_SIZE / base ) )
    if( !alignedLetters.length ) {
        alignedLetters = letters.substr( 0, ALIGNED_SIZE )
    }
}

export function _TestGetLetters(): LetterInfo {
    return _getLetters()
}

function _estimatedPoolSize(
    base: number,
    randStrSize: number,
    strongCrypto: boolean ): number
{
    let poolSize = 0
    if( strongCrypto ) {
        poolSize = Math.ceil( randStrSize / 4 )
    }
    else {
        poolSize = Math.ceil( randStrSize * Math.log2( base ) / 53 )
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

function _strongCryptoSupported(): boolean {
    if( _isWindow( global ) ) {
        return !!( _getCrypto( global ) && _getCrypto( global ).getRandomValues )
    }
    else {
        return true
    }
}

function _getRandomList( size: number, strongCrypto: boolean ): RandomIntList {
    const randList = new Array( size )
    if( strongCrypto && _strongCryptoSupported() ) {
        if( _isWindow( global ) ) {
            const tempList = new Uint32Array( size )
            _getCrypto( global ).getRandomValues( tempList )
            tempList.forEach( ( value, index ) => {
                randList[index] = value
            } )
            return randList
        }
        else {
            const buffer: Buffer = crypto.randomBytes( size * 4 )
            for( let i=0; i<size; ++i ) {
                randList[i] = buffer.readUInt32LE( i * 4 )
            }
            return randList
        }
    }
    else {
        let randList: number[] = []
        for( let i=0; i<size; ++i ) {
            randList[i] = Math.floor( Math.random() * MAX_INTEGER )
        }
        return randList
    }
}

function _getRandomIntPool(
    base: number,
    randStrSize: number,
    strongCrypto: boolean ): RandomIntList
{
    const canStrongCrypto = strongCrypto && _strongCryptoSupported()
    const poolSize: number = _estimatedPoolSize( base, randStrSize, canStrongCrypto )
    return _getRandomList( poolSize, canStrongCrypto )
}

export function _TestGetRandomIntPool(
    randStrSize: number,
    strongCrypto: boolean ): RandomIntList
{
    const { base } = _getLetters()
    return _getRandomIntPool( base, randStrSize, strongCrypto )
}

function _getAlignedLetters( strongCrypto: boolean ): LetterInfo {
    const { base, letters } = _getLetters()
    let newLetters: string = alignedLetters

    const remain: number = ALIGNED_SIZE % base
    if( !remain ) {
        return { base: ALIGNED_SIZE, letters: newLetters }
    }

    let randList = _getRandomList( remain, strongCrypto )
    for( let index = 0; index < remain; ++index ) {
        newLetters += letters[ randList[index] % base ]
    }
    return { base: ALIGNED_SIZE, letters: newLetters }
}

export default function randomString(
    strLength: number,
    strongCrypto: boolean = false): string
{
    if ( !isFinite( strLength ) ) return ''
    let result: string = ''
    let randNum: number = 0
    let letterPosition: number = 0

    if( strongCrypto && _strongCryptoSupported() ) {
        const { base, letters } = _getAlignedLetters( strongCrypto )
        let randomNumbers = _getRandomIntPool( base, strLength, strongCrypto )

        while ( result.length < strLength ) {
            if( !randomNumbers.length ) {
                randomNumbers = _getRandomIntPool( base, strLength - result.length, strongCrypto )
            }
            randNum = <number>randomNumbers.pop()
            for( let byteOrder = 0; byteOrder < 4; ++byteOrder ) {
                result += letters[ randNum & 0x000000FF ]
                randNum = randNum >> 8
                if( result.length === strLength ) break;
            }
        }
    }
    else {
        const { base, letters } = _getLetters()
        let randomNumbers = _getRandomIntPool( base, strLength, strongCrypto )

        while ( result.length < strLength ) {
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
    }
    return result
}
