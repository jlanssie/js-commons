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
    assert.equal(
      ObjectUtil.toString(
        () => 'value',
        () => 'fallback',
      ),
      'value',
    );
    assert.equal(
      ObjectUtil.toString(null, () => 'supplied'),
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
    await ObjectUtil.wait({}, { milliseconds: 0 });
  });
  it('handles value types, nulls, and validation paths', () => {
    assert.equal(ObjectUtil.NULL.toString(), 'null');
    assert.equal(ObjectUtil.identityHashCodeHex(null), null);
    assert.equal(ObjectUtil.identityToString(null), null);
    const sameObject = {};
    ObjectUtil.identityHashCodeHex(sameObject);
    assert.equal(ObjectUtil.identityHashCodeHex(sameObject), ObjectUtil.identityHashCodeHex(sameObject));
    assert.equal(ObjectUtil.clone(null), null);
    assert.equal(ObjectUtil.clone(new Uint8Array([1]))?.[0], 1);
    assert.equal(ObjectUtil.cloneIfPossible(1), 1);
    assert.deepEqual(ObjectUtil.cloneIfPossible([1]), [1]);
    assert.deepEqual(ObjectUtil.clone([1, 2]), [1, 2]);
    assert.deepEqual(ObjectUtil.clone({ clone: () => ({ value: 1 }) }), { value: 1 });
    assert.equal(ObjectUtil.clone({ callback: () => 1 }), null);
    assert.equal(ObjectUtil.clone(1), null);
    assert.equal(ObjectUtil.hashCode(true), 1231);
    assert.equal(ObjectUtil.hashCode(false), 1237);
    assert.equal(ObjectUtil.hashCode(null), 0);
    assert.equal(typeof ObjectUtil.hashCode({}), 'number');
    assert.equal(ObjectUtil.hashCode(NaN), 0x7ff80000);
    assert.equal(ObjectUtil.hashCode(Infinity), 0x7ff00000);
    assert.equal(ObjectUtil.hashCode(-Infinity), 0xfff00000);
    assert.equal(typeof ObjectUtil.hashCode(1.5), 'number');
    assert.equal(ObjectUtil.hashCode(1), 1);
    assert.equal(typeof ObjectUtil.hashCode(1n), 'number');
    assert.equal(typeof ObjectUtil.hashCode(Symbol('x')), 'number');
    assert.equal(typeof ObjectUtil.hashCode(() => 1), 'number');
    assert.equal(ObjectUtil.compare(null, null), 0);
    assert.equal(ObjectUtil.compare(null, 1, true), 1);
    assert.equal(ObjectUtil.compare(null, 1), -1);
    assert.equal(ObjectUtil.compare(1, null, true), -1);
    assert.equal(ObjectUtil.compare(1, null), 1);
    assert.equal(ObjectUtil.compare(1, 2), -1);
    assert.equal(ObjectUtil.compare(1, 1), 0);
    assert.equal(ObjectUtil.compare('a', 'b'), -1);
    assert.equal(ObjectUtil.compare('b', 'a'), 1);
    assert.equal(ObjectUtil.compare(2, 1), 1);
    assert.equal(ObjectUtil.compare({ toString: () => 'a' }, { toString: () => 'b' }), -1);
    assert.equal(ObjectUtil.compare({}, {}), 1);
    assert.equal(ObjectUtil.isEmpty(''), true);
    assert.equal(ObjectUtil.isEmpty(null), true);
    assert.equal(ObjectUtil.isEmpty([]), true);
    assert.equal(ObjectUtil.isEmpty(new Uint8Array()), true);
    assert.equal(ObjectUtil.isEmpty({ length: 0 }), true);
    assert.equal(ObjectUtil.isEmpty({ size: 0 }), true);
    assert.equal(ObjectUtil.isEmpty({ isEmpty: () => true }), true);
    assert.equal(ObjectUtil.isEmpty({}), false);
    assert.equal(ObjectUtil.identityToString(Object.create(null))?.startsWith('Object@'), true);
    assert.equal(ObjectUtil.defaultIfNull('value', 'fallback'), 'value');
    assert.equal(ObjectUtil.toString('value', 'fallback'), 'value');
    assert.equal(
      ObjectUtil.toStringWithSupplier('value', () => 'fallback'),
      'value',
    );
    assert.equal(
      ObjectUtil.getFirstNonNull(null, () => null),
      null,
    );
    assert.equal(ObjectUtil.getClass(null), null);
    const callable = () => 1;
    assert.equal(ObjectUtil.getClass(callable), callable);
    assert.equal(ObjectUtil.getIfNull('value', 'fallback'), 'value');
    assert.equal(ObjectUtil.isArray([]), true);
    assert.equal(ObjectUtil.isNotEmpty([]), false);
    assert.equal(ObjectUtil.mode(), null);
    assert.equal(ObjectUtil.mode(1, 2), null);
    assert.throws(() => ObjectUtil.median());
    assert.equal(
      ObjectUtil.median((left, right) => left - right, 3, 1, 2),
      2,
    );
    assert.throws(() => ObjectUtil.median(1, null as never));
    assert.throws(() => ObjectUtil.medianBy(null as never, 1));
    assert.throws(() => ObjectUtil.medianBy((left, right) => left - right, null as never));
    assert.throws(() => ObjectUtil.requireNonEmpty(null));
    assert.throws(() => ObjectUtil.requireNonEmpty(''));
    assert.throws(() => ObjectUtil.appendIdentityToString(() => {}, null as never));
    const builder = {
      value: '',
      append(value: string) {
        this.value += value;
      },
    };
    ObjectUtil.appendIdentityToString(builder, {});
    assert.match(builder.value, /^Object@[0-9a-f]+$/u);
  });
});
