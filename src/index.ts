/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

try {
  require('babel-polyfill')
}
catch (e) {
  console.warn(e.message)
}

import * as crypto from 'crypto'
import { CharsetInfo, RandomIntList } from './interface'
const isFinite = require('lodash.isfinite')
const isString = require('lodash.isstring')

const CHARACTERS: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MAX_INTEGER: number = Number.MAX_SAFE_INTEGER
const ALIGNED_SIZE = 256

const MAXIMUM_POOL_SIZE: number = 16384

let customCharset: string = ''
let alignedCharset: string = CHARACTERS.repeat(Math.floor(ALIGNED_SIZE / CHARACTERS.length))

function _getCharset(): CharsetInfo {
  const charset: string = (isString(customCharset) && customCharset.length > 1)
    ? customCharset : CHARACTERS
  const base: number = charset.length
  return { charset, base }
}

function setRandCharset(argCharset: string): void {
  customCharset = argCharset.trim()
  const { charset, base } = _getCharset()
  alignedCharset = charset.repeat(Math.floor(ALIGNED_SIZE / base))
  if (!alignedCharset.length) {
    alignedCharset = charset.substr(0, ALIGNED_SIZE)
  }
}

function _TestGetCharset(): CharsetInfo {
  return _getCharset()
}

function _estimatedPoolSize(
  base: number,
  randStrSize: number,
  strongCrypto: boolean): number {
  if (strongCrypto) {
    const poolSize = Math.ceil(randStrSize / 4)
    return poolSize > MAXIMUM_POOL_SIZE ? MAXIMUM_POOL_SIZE : poolSize
  }
  else {
    return Math.ceil(randStrSize * Math.log2(base) / 53)
  }
}

function _TestEstimatedPoolSize(
  randStrSize: number,
  strongCrypto: boolean): number {
  const { base } = _getCharset()
  return _estimatedPoolSize(base, randStrSize, strongCrypto)
}

function _isWindow(obj: Object): obj is Window {
  return !!(<Window>obj).document
}

interface MSWindow extends Window {
  msCrypto: Pick<Window, 'crypto'>
}

function _getCrypto(obj: Window): Crypto {
  return obj.crypto || (<MSWindow>obj).msCrypto
}

function _strongCryptoSupported(): boolean {
  if (_isWindow(global)) {
    return !!(_getCrypto(global) && _getCrypto(global).getRandomValues)
  }
  else {
    return true
  }
}

function _getRandomList(size: number, strongCrypto: boolean): RandomIntList {
  const randList = new Array(size)
  if (strongCrypto && _strongCryptoSupported()) {
    if (_isWindow(global)) {
      const tempList = new Uint32Array(size)
      _getCrypto(global).getRandomValues(tempList)
      tempList.forEach((value, index) => {
        randList[index] = value
      })
      return randList
    }
    else {
      const buffer: Buffer = crypto.randomBytes(size * 4)
      for (let i = 0; i < size; ++i) {
        randList[i] = buffer.readUInt32LE(i * 4)
      }
      return randList
    }
  }
  else {
    let randList: number[] = []
    for (let i = 0; i < size; ++i) {
      randList[i] = Math.floor(Math.random() * MAX_INTEGER)
    }
    return randList
  }
}

function _getRandomIntPool(
  base: number,
  randStrSize: number,
  strongCrypto: boolean): RandomIntList {
  const canStrongCrypto = strongCrypto && _strongCryptoSupported()
  const poolSize: number = _estimatedPoolSize(base, randStrSize, canStrongCrypto)
  return _getRandomList(poolSize, canStrongCrypto)
}

function _TestGetRandomIntPool(
  randStrSize: number,
  strongCrypto: boolean): RandomIntList {
  const { base } = _getCharset()
  return _getRandomIntPool(base, randStrSize, strongCrypto)
}

function _getAlignedCharset(strongCrypto: boolean): CharsetInfo {
  const { base, charset } = _getCharset()
  let newCharset: string = alignedCharset

  const remain: number = ALIGNED_SIZE % base
  if (!remain) {
    return { base: ALIGNED_SIZE, charset: newCharset }
  }

  let randList = _getRandomList(remain, strongCrypto)
  for (let index = 0; index < remain; ++index) {
    newCharset += charset[randList[index] % base]
  }
  return { base: ALIGNED_SIZE, charset: newCharset }
}

function randomString(
  strLength: number,
  strongCrypto: boolean = false): string {
  if (!isFinite(strLength)) return ''
  let result: string = ''
  let randNum: number = 0
  let charPosition: number = 0

  if (strongCrypto && _strongCryptoSupported()) {
    const { base, charset } = _getAlignedCharset(strongCrypto)
    let randomNumbers = _getRandomIntPool(base, strLength, strongCrypto)

    while (result.length < strLength) {
      if (!randomNumbers.length) {
        randomNumbers = _getRandomIntPool(base, strLength - result.length, strongCrypto)
      }
      randNum = <number>randomNumbers.pop()
      for (let byteOrder = 0; byteOrder < 4; ++byteOrder) {
        result += charset[randNum & 0x000000FF]
        randNum = randNum >> 8
        if (result.length === strLength) break;
      }
    }
  }
  else {
    const { base, charset } = _getCharset()
    let randomNumbers = _getRandomIntPool(base, strLength, strongCrypto)

    while (result.length < strLength) {
      if (randNum < 1) {
        if (!randomNumbers.length) {
          randomNumbers = _getRandomIntPool(base, strLength - result.length, strongCrypto)
        }
        randNum = <number>randomNumbers.pop()
      }
      charPosition = randNum % base
      randNum = (randNum - charPosition) / base
      result += charset[charPosition]
    }
  }
  return result
}

const output = {
  MAXIMUM_POOL_SIZE,
  setRandCharset,
  _TestGetCharset,
  _TestEstimatedPoolSize,
  _TestGetRandomIntPool,
  randomString
}

export = output
