import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import EnumUtil from '../src/enum.util.ts';

const Color = { Red: 'Red', Blue: 'Blue' } as const;

describe('EnumUtil', () => {
  it('generateBitVector', () => assert.equal(EnumUtil.generateBitVector(Color, 'Red', 'Blue'), 3));
  it('generateBitVectors', () => assert.deepEqual(EnumUtil.generateBitVectors(Color, 'Blue'), [2]));
  it('getEnum', () => assert.equal(EnumUtil.getEnum(Color, 'Red'), 'Red'));
  it('getEnumIgnoreCase', () => assert.equal(EnumUtil.getEnumIgnoreCase(Color, 'blue'), 'Blue'));
  it('getEnumList', () => assert.deepEqual(EnumUtil.getEnumList(Color), ['Red', 'Blue']));
  it('getEnumMap', () =>
    assert.deepEqual(Array.from(EnumUtil.getEnumMap(Color)), [
      ['Red', 'Red'],
      ['Blue', 'Blue'],
    ]));
  it('getEnumSystemProperty', () => {
    process.env.TEST_ENUM_VALUE = 'Red';
    assert.equal(EnumUtil.getEnumSystemProperty(Color, 'TEST_ENUM_VALUE'), 'Red');
    delete process.env.TEST_ENUM_VALUE;
  });
  it('getFirstEnum', () =>
    assert.equal(
      EnumUtil.getFirstEnum(Color, 3, (value) => value.length),
      'Red',
    ));
  it('getFirstEnumIgnoreCase', () => assert.equal(EnumUtil.getFirstEnumIgnoreCase(Color, 'blue', String), 'Blue'));
  it('isValidEnum', () => assert.equal(EnumUtil.isValidEnum(Color, 'Red'), true));
  it('isValidEnumIgnoreCase', () => assert.equal(EnumUtil.isValidEnumIgnoreCase(Color, 'red'), true));
  it('processBitVector', () => assert.deepEqual(EnumUtil.processBitVector(Color, 3), ['Red', 'Blue']));
  it('processBitVectors', () => assert.deepEqual(EnumUtil.processBitVectors(Color, 3), ['Red', 'Blue']));
  it('stream', () => assert.deepEqual(EnumUtil.stream(Color), ['Red', 'Blue']));
});
