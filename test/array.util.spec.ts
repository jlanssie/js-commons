import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import ArrayUtil from '../src/array.util.ts';

describe('ArrayUtil', () => {
  it('add', () => assert.deepEqual(ArrayUtil.add([1, 3], 1, 2), [1, 2, 3]));
  it('addAll', () => assert.deepEqual(ArrayUtil.addAll([1], [2], null, [3]), [1, 2, 3]));
  it('addFirst', () => assert.deepEqual(ArrayUtil.addFirst([2, 3], 1), [1, 2, 3]));
  it('arraycopy', () => {
    assert.deepEqual(ArrayUtil.arraycopy([1, 2], 0, [0, 0, 0], 1, 2), [0, 1, 2]);
    assert.deepEqual(
      ArrayUtil.arraycopy([1, 2], 0, 0, 2, () => []),
      [1, 2],
    );
    const allocated = ArrayUtil.arraycopy([1, 2], 0, 0, 2, (length) => new Array(length));
    assert.equal(allocated.length, 4);
    assert.deepEqual(allocated.slice(0, 2), [1, 2]);
    assert.deepEqual(ArrayUtil.arraycopy([1, 2], 0, 0, 2, undefined), [1, 2]);
  });
  it('clone', () => {
    const result = ArrayUtil.clone([1, 2]);
    assert.deepEqual(result, [1, 2]);
    assert.notEqual(result, [1, 2]);
  });
  it('concat', () => assert.deepEqual(ArrayUtil.concat([1], null, [2, 3]), [1, 2, 3]));
  it('contains', () => {
    assert.equal(ArrayUtil.contains([1, 2], 2), true);
    assert.equal(ArrayUtil.contains([NaN], NaN), true);
  });
  it('containsAny', () => {
    assert.equal(ArrayUtil.containsAny([1, 2], [3, 2]), true);
    assert.equal(ArrayUtil.containsAny([1, 2], 3, 4), false);
  });
  it('get', () => {
    assert.equal(ArrayUtil.get([1, 2], 1), 2);
    assert.equal(ArrayUtil.get([1, 2], 4, 9), 9);
    assert.equal(ArrayUtil.get([1], 0), 1);
    assert.equal(ArrayUtil.get(null, 0), undefined);
  });
  it('getComponentType', () => {
    assert.equal(ArrayUtil.getComponentType([1, 2]), Number);
    assert.equal(ArrayUtil.getComponentType([null]), null);
    assert.equal(ArrayUtil.getComponentType([Object.create(null)]), Object);
    assert.equal(ArrayUtil.getComponentType(undefined), null);
    assert.equal(ArrayUtil.getComponentType([undefined]), null);
  });
  it('getDimensions', () => assert.equal(ArrayUtil.getDimensions([[1], [2]]), 2));
  it('getLength', () => assert.equal(ArrayUtil.getLength(new Uint8Array([1, 2])), 2));
  it('hashCode', () => {
    assert.equal(typeof ArrayUtil.hashCode([1, 2]), 'number');
    assert.equal(typeof ArrayUtil.hashCode([NaN, false, 1.5]), 'number');
    assert.equal(typeof ArrayUtil.hashCode([[1]]), 'number');
  });
  it('indexesOf', () => assert.deepEqual(ArrayUtil.indexesOf([1, 2, 1], 1), new Set([0, 2])));
  it('indexOf', () => {
    assert.equal(ArrayUtil.indexOf([1, 2, 3], 2), 1);
    assert.equal(ArrayUtil.indexOf([1, 2.1], 2, 0, 0.2), 1);
  });
  it('insert', () => assert.deepEqual(ArrayUtil.insert(1, [1, 3], 2), [1, 2, 3]));
  it('isArrayIndexValid', () => {
    assert.equal(ArrayUtil.isArrayIndexValid([1], 0), true);
    assert.equal(ArrayUtil.isArrayIndexValid([1], 1), false);
    assert.equal(ArrayUtil.isArrayIndexValid(null, 0), false);
  });
  it('isEmpty', () => assert.equal(ArrayUtil.isEmpty([]), true));
  it('isEquals', () => assert.equal(ArrayUtil.isEquals([1, [2]], [1, [2]]), true));
  it('isNotEmpty', () => assert.equal(ArrayUtil.isNotEmpty([1]), true));
  it('isSameLength', () => assert.equal(ArrayUtil.isSameLength([1], [2]), true));
  it('isSameType', () => assert.equal(ArrayUtil.isSameType([1], [2]), true));
  it('isSorted', () => assert.equal(ArrayUtil.isSorted([1, 2, 3]), true));
  it('lastIndexOf', () => assert.equal(ArrayUtil.lastIndexOf([1, 2, 1], 1), 2));
  it('newInstance', () => assert.equal(ArrayUtil.newInstance(Number, 3).length, 3));
  it('nullTo', () => {
    assert.deepEqual(ArrayUtil.nullTo(null, [1]), [1]);
    assert.deepEqual(ArrayUtil.nullTo([1], [2]), [1]);
  });
  it('nullToEmpty', () => {
    assert.deepEqual(ArrayUtil.nullToEmpty(null), []);
    assert.deepEqual(ArrayUtil.nullToEmpty([1]), [1]);
  });
  it('remove', () => assert.deepEqual(ArrayUtil.remove([1, 2], 0), [2]));
  it('removeAll', () => assert.deepEqual(ArrayUtil.removeAll([1, 2, 3], 0, 2), [2]));
  it('removeAllOccurrences', () => assert.deepEqual(ArrayUtil.removeAllOccurrences([1, 2, 1], 1), [2]));
  it('removeAllOccurences', () => assert.deepEqual(ArrayUtil.removeAllOccurences([1, 2, 1], 1), [2]));
  it('removeElement', () => assert.deepEqual(ArrayUtil.removeElement([1, 2, 1], 1), [2, 1]));
  it('removeElements', () => assert.deepEqual(ArrayUtil.removeElements([1, 2, 1], 1), [2, 1]));
  it('reverse', () => {
    const values = [1, 2, 3];
    ArrayUtil.reverse(values);
    assert.deepEqual(values, [3, 2, 1]);
  });
  it('setAll', () => {
    assert.deepEqual(
      ArrayUtil.setAll([0, 0], (index) => index + 1),
      [1, 2],
    );
    assert.deepEqual(
      ArrayUtil.setAll([0, 0], () => 1),
      [1, 1],
    );
  });
  it('shift', () => {
    const values = [1, 2, 3];
    ArrayUtil.shift(values, 1);
    assert.deepEqual(values, [3, 1, 2]);
  });
  it('shuffle', () => {
    const values = [1, 2, 3];
    ArrayUtil.shuffle(values, () => 0);
    assert.deepEqual(values, [2, 3, 1]);
  });
  it('startsWith', () => assert.equal(ArrayUtil.startsWith([1, 2], [1]), true));
  it('subarray', () => assert.deepEqual(ArrayUtil.subarray([0, 1, 2], 1, 3), [1, 2]));
  it('swap', () => {
    const values = [1, 2, 3];
    ArrayUtil.swap(values, 0, 2);
    assert.deepEqual(values, [3, 2, 1]);
  });
  it('toArray', () => assert.deepEqual(ArrayUtil.toArray(1, 2), [1, 2]));
  it('toMap', () => assert.deepEqual(Array.from(ArrayUtil.toMap([['a', 1]])), [['a', 1]]));
  it('toObject', () => assert.deepEqual(ArrayUtil.toObject([1, undefined, null]), [1, null, null]));
  it('toPrimitive', () => {
    assert.deepEqual(ArrayUtil.toPrimitive([1, null, 3]), [1, 0, 3]);
    assert.deepEqual(ArrayUtil.toPrimitive([true, null], true), [true, true]);
  });
  it('toString', () => assert.equal(ArrayUtil.toString([1, 'two']), '{1,two}'));
  it('toStringArray', () => assert.deepEqual(ArrayUtil.toStringArray([1, null]), ['1', '']));
  it('handles null, overload, and error paths', () => {
    assert.deepEqual(ArrayUtil.add([1], 2), [1, 2]);
    assert.deepEqual(ArrayUtil.addAll(null, [1]), [1]);
    assert.equal(ArrayUtil.clone(null), null);
    assert.equal(ArrayUtil.getComponentType([]), null);
    assert.equal(ArrayUtil.getDimensions('not an array'), 0);
    assert.equal(ArrayUtil.getDimensions([]), 1);
    assert.equal(ArrayUtil.getLength(null), 0);
    assert.equal(ArrayUtil.getLength({}), 0);
    assert.equal(ArrayUtil.hashCode(null), 0);
    assert.equal(ArrayUtil.hashCode(undefined), 0);
    assert.equal(ArrayUtil.isSorted([1, 1]), true);
    assert.equal(typeof ArrayUtil.hashCode([null, true, 'x', {}]), 'number');
    assert.equal(ArrayUtil.indexOf([1, 2.1], 2, 0.2), 1);
    assert.equal(ArrayUtil.indexOf([1], 2), -1);
    assert.equal(ArrayUtil.isEquals([1], [2]), false);
    assert.equal(ArrayUtil.isEquals(null, undefined), false);
    assert.equal(ArrayUtil.isSameType(null, undefined), false);
    assert.equal(ArrayUtil.isSameType([1], ['1']), false);
    assert.equal(ArrayUtil.isSameType([], []), true);
    assert.equal(ArrayUtil.isSameType({}, {}), true);
    assert.equal(ArrayUtil.isSameType({}, new Date()), false);
    assert.equal(ArrayUtil.isSorted([2, 1]), false);
    assert.equal(ArrayUtil.lastIndexOf([1, 2.1], 2, 0.2), 1);
    assert.equal(ArrayUtil.lastIndexOf([1], 2), -1);
    assert.throws(() => ArrayUtil.insert(-1, [], 1), RangeError);
    assert.throws(() => ArrayUtil.newInstance(Number, -1), RangeError);
    assert.equal(ArrayUtil.nullTo(null, [1])[0], 1);
    assert.equal(ArrayUtil.remove(null, 0), null);
    assert.equal(ArrayUtil.removeAll(null, 0), null);
    assert.equal(ArrayUtil.removeAllOccurrences(null, 1), null);
    assert.equal(ArrayUtil.removeElement(null, 1), null);
    assert.equal(ArrayUtil.removeElements(null, 1), null);
    ArrayUtil.reverse(null);
    ArrayUtil.shift(null, 1);
    ArrayUtil.shift([1], 1, 0, 0);
    ArrayUtil.shuffle(null);
    ArrayUtil.swap(null, 0, 1);
    assert.deepEqual(ArrayUtil.subarray(null), []);
    assert.deepEqual(ArrayUtil.subarray([1], 0, 1), [1]);
    assert.deepEqual(ArrayUtil.subarray([1]), [1]);
    assert.equal(ArrayUtil.toMap(null).size, 0);
    assert.deepEqual(ArrayUtil.toMap([new Map([['a', 1]])]), new Map([['a', 1]]));
    assert.equal(ArrayUtil.toObject(null), null);
    assert.equal(ArrayUtil.toPrimitive(null), null);
    assert.deepEqual(ArrayUtil.toPrimitive([null]), [false]);
    assert.equal(ArrayUtil.toString([[1], null]), '{{1},null}');
    assert.equal(ArrayUtil.toString(null), '{}');
    assert.equal(ArrayUtil.toString({ value: 1 }), '[object Object]');
    assert.deepEqual(ArrayUtil.toStringArray(null), null);
  });
});
