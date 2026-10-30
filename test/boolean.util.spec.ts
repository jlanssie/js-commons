import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import BooleanUtil from '../src/boolean.util.ts';

describe('BooleanUtil', () => {
  it('and', () => assert.equal(BooleanUtil.and(true, true), true));
  it('booleanValues', () => assert.deepEqual(BooleanUtil.booleanValues(), [false, true]));
  it('compare', () => {
    assert.equal(BooleanUtil.compare(false, true), -1);
    assert.equal(BooleanUtil.compare(true, false), 1);
    assert.equal(BooleanUtil.compare(true, true), 0);
  });
  it('forEach', () => {
    const values: boolean[] = [];
    BooleanUtil.forEach((value) => values.push(value));
    assert.deepEqual(values, [false, true]);
  });
  it('isFalse', () => assert.equal(BooleanUtil.isFalse(false), true));
  it('isNotFalse', () => assert.equal(BooleanUtil.isNotFalse(true), true));
  it('isNotTrue', () => assert.equal(BooleanUtil.isNotTrue(false), true));
  it('isTrue', () => assert.equal(BooleanUtil.isTrue(true), true));
  it('negate', () => {
    assert.equal(BooleanUtil.negate(true), false);
    assert.equal(BooleanUtil.negate(null), null);
  });
  it('oneHot', () => assert.equal(BooleanUtil.oneHot(false, true, false), true));
  it('or', () => assert.equal(BooleanUtil.or(false, true), true));
  it('primitiveValues', () => assert.deepEqual(BooleanUtil.primitiveValues(), [false, true]));
  it('toBoolean', () => {
    assert.equal(BooleanUtil.toBoolean('YES'), true);
    assert.equal(BooleanUtil.toBoolean(0), false);
    assert.equal(BooleanUtil.toBoolean('yes', 'yes', 'no'), true);
    assert.equal(BooleanUtil.toBoolean('on'), true);
    assert.equal(BooleanUtil.toBoolean('y'), true);
    assert.equal(BooleanUtil.toBoolean('t'), true);
    assert.equal(BooleanUtil.toBoolean('1'), true);
    assert.equal(BooleanUtil.toBoolean('off'), false);
    assert.equal(BooleanUtil.toBoolean('n'), false);
    assert.equal(BooleanUtil.toBoolean('f'), false);
    assert.equal(BooleanUtil.toBoolean('0'), false);
  });
  it('toBooleanDefaultIfNull', () => assert.equal(BooleanUtil.toBooleanDefaultIfNull(null, true), true));
  it('toBooleanObject', () => {
    assert.equal(BooleanUtil.toBooleanObject('unknown'), null);
    assert.equal(BooleanUtil.toBooleanObject(1), true);
    assert.equal(BooleanUtil.toBooleanObject(2, 2, 1, 0), true);
  });
  it('toBooleanObjectWithValues', () => assert.equal(BooleanUtil.toBooleanObjectWithValues('yes', 'yes', 'no', null), true));
  it('toInteger', () => {
    assert.equal(BooleanUtil.toInteger(null, 1, 0, 9), 9);
    assert.equal(BooleanUtil.toInteger(true, 1, 0, 9), 1);
    assert.equal(BooleanUtil.toInteger(false, 1, 0, 9), 0);
  });
  it('toIntegerObject', () => {
    assert.equal(BooleanUtil.toIntegerObject(null), null);
    assert.equal(BooleanUtil.toIntegerObject(true, 1, 0, null), 1);
    assert.equal(BooleanUtil.toIntegerObject(false, 1, 0, null), 0);
  });
  it('toString', () => {
    assert.equal(BooleanUtil.toString(true, 'yes', 'no'), 'yes');
    assert.equal(BooleanUtil.toString(false, 'yes', 'no'), 'no');
    assert.equal(BooleanUtil.toString(null, 'yes', 'no', 'unknown'), 'unknown');
  });
  it('toStringOnOff', () => assert.equal(BooleanUtil.toStringOnOff(false), 'off'));
  it('toStringTrueFalse', () => assert.equal(BooleanUtil.toStringTrueFalse(true), 'true'));
  it('toStringYesNo', () => assert.equal(BooleanUtil.toStringYesNo(false), 'no'));
  it('values', () => assert.deepEqual(BooleanUtil.values(), [false, true]));
  it('xor', () => assert.equal(BooleanUtil.xor(true, false), true));
  it('handles null, nested, and invalid conversion paths', () => {
    assert.throws(() => BooleanUtil.and(), /must not be empty/);
    assert.equal(BooleanUtil.and([true, true] as never), true);
    assert.equal(BooleanUtil.toBoolean(null), false);
    assert.equal(BooleanUtil.toBooleanDefaultIfNull(false, true), false);
    assert.equal(BooleanUtil.toBoolean('unknown'), false);
    assert.equal(BooleanUtil.toBoolean('no', 'yes', 'no'), false);
    assert.throws(() => BooleanUtil.toBoolean('maybe', 'yes', 'no'));
    assert.equal(BooleanUtil.toBooleanObject(null), null);
    assert.equal(BooleanUtil.toBooleanObject(false), false);
    assert.equal(BooleanUtil.toBooleanObject(true), true);
    assert.equal(BooleanUtil.toBooleanObject('no'), false);
    assert.equal(BooleanUtil.toBooleanObject('other'), null);
    assert.equal(BooleanUtil.toBooleanObject('true'), true);
    assert.equal(BooleanUtil.toBooleanObject('false'), false);
    assert.equal(BooleanUtil.toBooleanObject({}), null);
    assert.equal(BooleanUtil.toBooleanObjectWithValues('no', 'yes', 'no', null), false);
    assert.equal(BooleanUtil.toBooleanObjectWithValues(null, 'yes', 'no', null), null);
    assert.throws(() => BooleanUtil.toBooleanObjectWithValues('maybe', 'yes', 'no', null));
    assert.equal(BooleanUtil.toBooleanObject(0, 1, 0, -1), false);
    assert.equal(BooleanUtil.toBooleanObject(-1, 1, 0, -1), null);
    assert.throws(() => BooleanUtil.toBooleanObject(2, 1, 0, -1));
    assert.equal(BooleanUtil.toBoolean(true), true);
    assert.equal(BooleanUtil.toBoolean({}), false);
    assert.throws(() => BooleanUtil.oneHot(), /must not be empty/);
    assert.throws(() => BooleanUtil.or(), /must not be empty/);
    assert.throws(() => BooleanUtil.xor(), /must not be empty/);
  });
});
