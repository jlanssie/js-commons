import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import ObjectUtil from '../src/object.util.ts';

describe('ObjectUtil', () => {
  it('allNotNull', () => assert.equal(ObjectUtil.allNotNull(1, 'x'), true));
  it('allNull', () => assert.equal(ObjectUtil.allNull(null, undefined), true));
  it('anyNotNull', () => assert.equal(ObjectUtil.anyNotNull(null, 1), true));
  it('anyNull', () => assert.equal(ObjectUtil.anyNull(1, null), true));
  it('clone', () => assert.deepEqual(ObjectUtil.clone({ value: 1 }), { value: 1 }));
  it('cloneIfPossible', () => assert.equal(ObjectUtil.cloneIfPossible(1), 1));
  it('compare', () => assert.equal(ObjectUtil.compare(1, 2), -1));
  it('CONST', () => assert.equal(ObjectUtil.CONST('value'), 'value'));
  it('CONST_BYTE', () => assert.equal(ObjectUtil.CONST_BYTE(1), 1));
  it('CONST_SHORT', () => assert.equal(ObjectUtil.CONST_SHORT(2), 2));
  it('defaultIfNull', () => assert.equal(ObjectUtil.defaultIfNull(null, 'fallback'), 'fallback'));
  it('equals', () => assert.equal(ObjectUtil.equals(NaN, NaN), true));
  it('firstNonNull', () => assert.equal(ObjectUtil.firstNonNull(null, undefined, 'value'), 'value'));
  it('getClass', () => assert.equal(ObjectUtil.getClass('value'), String));
  it('getFirstNonNull', () =>
    assert.equal(
      ObjectUtil.getFirstNonNull(
        () => null,
        () => 'value',
      ),
      'value',
    ));
  it('getIfNull', () => {
    assert.equal(ObjectUtil.getIfNull(null, 'fallback'), 'fallback');
    assert.equal(
      ObjectUtil.getIfNull(null, () => 'supplied'),
      'supplied',
    );
  });
  it('hashCode', () => assert.equal(typeof ObjectUtil.hashCode('value'), 'number'));
  it('hashCodeHex', () => assert.match(ObjectUtil.hashCodeHex('value'), /^[0-9a-f]+$/u));
  it('hashCodeMulti', () => assert.equal(typeof ObjectUtil.hashCodeMulti('a', 'b'), 'number'));
  it('identityHashCodeHex', () => assert.match(ObjectUtil.identityHashCodeHex({})!, /^[0-9a-f]+$/u));
  it('identityToString', () => assert.match(ObjectUtil.identityToString({})!, /^Object@[0-9a-f]+$/u));
  it('appendIdentityToString', () => {
    let output = '';
    ObjectUtil.appendIdentityToString((value) => {
      output = value;
    }, {});
    assert.match(output, /^Object@[0-9a-f]+$/u);
  });
  it('isArray', () => assert.equal(ObjectUtil.isArray(new Uint8Array()), true));
  it('isEmpty', () => assert.equal(ObjectUtil.isEmpty(new Map()), true));
  it('isNotEmpty', () => assert.equal(ObjectUtil.isNotEmpty('value'), true));
  it('max', () => assert.equal(ObjectUtil.max(2, 5, 3), 5));
  it('median', () => assert.equal(ObjectUtil.median(3, 1, 2), 2));
  it('medianBy', () =>
    assert.equal(
      ObjectUtil.medianBy((left, right) => left - right, 3, 1, 2),
      2,
    ));
  it('min', () => assert.equal(ObjectUtil.min(2, 5, 3), 2));
  it('mode', () => assert.equal(ObjectUtil.mode(1, 2, 2, 3), 2));
  it('notEqual', () => assert.equal(ObjectUtil.notEqual(1, 2), true));
  it('requireNonEmpty', () => assert.equal(ObjectUtil.requireNonEmpty('value'), 'value'));
  it('toString', () => {
    assert.equal(ObjectUtil.toString(null, 'null'), 'null');
    assert.equal(
      ObjectUtil.toString(
        () => null,
        () => 'supplied',
      ),
      'supplied',
    );
  });
  it('toStringWithSupplier', () =>
    assert.equal(
      ObjectUtil.toStringWithSupplier(null, () => 'supplied'),
      'supplied',
    ));
  it('wait', async () => {
    await ObjectUtil.wait({}, 0);
  });
});
