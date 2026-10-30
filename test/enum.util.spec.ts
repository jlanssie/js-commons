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
  it('handles arrays, value providers, defaults, and errors', () => {
    const values = ['Red', 'Blue'] as const;
    const provider = { values: () => values };
    assert.deepEqual(EnumUtil.stream(values), ['Red', 'Blue']);
    assert.deepEqual(EnumUtil.stream(provider), ['Red', 'Blue']);
    assert.equal(EnumUtil.getEnum(values, 'Red'), 'Red');
    assert.equal(EnumUtil.getEnum(Color, 'missing', 'fallback'), 'fallback');
    assert.equal(EnumUtil.getEnumIgnoreCase(Color, 'missing', 'fallback'), 'fallback');
    assert.deepEqual(EnumUtil.getEnumList(values), ['Red', 'Blue']);
    assert.equal(EnumUtil.getEnum(provider, 'Red'), 'Red');
    assert.deepEqual(Array.from(EnumUtil.getEnumMap(null as never)), []);
    assert.equal(EnumUtil.generateBitVector(Color, ['Red', 'Blue'] as never), 3);
    assert.deepEqual(EnumUtil.getEnumList({ 0: 'Red', 1: 'Blue', Red: 0, Blue: 1 }), [0, 1]);
    assert.equal(EnumUtil.getEnumMap({ 0: 'Red', 1: 'Blue', Red: 0, Blue: 1 }).get('Red'), 0);
    assert.equal(EnumUtil.getEnum(null, 'missing', 'fallback'), 'fallback');
    assert.equal(EnumUtil.getEnumIgnoreCase(null, 'missing', 'fallback'), 'fallback');
    assert.equal(EnumUtil.getEnum(Color, null, 'fallback'), 'fallback');
    assert.equal(
      EnumUtil.getFirstEnum(null, 1, () => 1, 'fallback'),
      'fallback',
    );
    assert.equal(EnumUtil.getFirstEnumIgnoreCase(Color, null, String, 'fallback'), 'fallback');
    assert.equal(EnumUtil.getEnumSystemProperty(Color, 'MISSING', 'fallback'), 'fallback');
    assert.equal(EnumUtil.getEnumSystemProperty(Color, null, 'fallback'), 'fallback');
    assert.equal(EnumUtil.getEnumMap(Color, (value) => value.length).get(4), 'Blue');
    assert.equal(EnumUtil.getFirstEnumIgnoreCase(Color, 'missing', String, 'fallback'), 'fallback');
    assert.deepEqual(EnumUtil.processBitVectors(Color, [3]), ['Red', 'Blue']);
    assert.throws(() => EnumUtil.generateBitVector(Color, 'missing' as never));
    assert.throws(() => EnumUtil.generateBitVectors(Color, 'missing' as never));
    assert.throws(() => EnumUtil.generateBitVector(new Array(65).fill('x'), 'x'));
  });
});
