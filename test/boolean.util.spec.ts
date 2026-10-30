import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import BooleanUtil from '../src/boolean.util.ts';

describe('BooleanUtil', () => {
  it('and', () => assert.equal(BooleanUtil.and(true, true), true));
  it('booleanValues', () => assert.deepEqual(BooleanUtil.booleanValues(), [false, true]));
  it('compare', () => assert.equal(BooleanUtil.compare(false, true), -1));
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
  });
  it('toBooleanDefaultIfNull', () => assert.equal(BooleanUtil.toBooleanDefaultIfNull(null, true), true));
  it('toBooleanObject', () => {
    assert.equal(BooleanUtil.toBooleanObject('unknown'), null);
    assert.equal(BooleanUtil.toBooleanObject(1), true);
    assert.equal(BooleanUtil.toBooleanObject(2, 2, 1, 0), true);
  });
  it('toBooleanObjectWithValues', () => assert.equal(BooleanUtil.toBooleanObjectWithValues('yes', 'yes', 'no', null), true));
  it('toInteger', () => assert.equal(BooleanUtil.toInteger(null, 1, 0, 9), 9));
  it('toIntegerObject', () => assert.equal(BooleanUtil.toIntegerObject(null), null));
  it('toString', () => assert.equal(BooleanUtil.toString(true, 'yes', 'no'), 'yes'));
  it('toStringOnOff', () => assert.equal(BooleanUtil.toStringOnOff(false), 'off'));
  it('toStringTrueFalse', () => assert.equal(BooleanUtil.toStringTrueFalse(true), 'true'));
  it('toStringYesNo', () => assert.equal(BooleanUtil.toStringYesNo(false), 'no'));
  it('values', () => assert.deepEqual(BooleanUtil.values(), [false, true]));
  it('xor', () => assert.equal(BooleanUtil.xor(true, false), true));
});
