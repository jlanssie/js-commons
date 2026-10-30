import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import CollectionUtil from '../src/collection.util.ts';

describe('CollectionUtil', () => {
  it('addAll', () => {
    const values: number[] = [];
    assert.equal(CollectionUtil.addAll(values, [1, 2]), true);
    assert.deepEqual(values, [1, 2]);
  });
  it('addIgnoreNull', () => {
    const values: number[] = [];
    assert.equal(CollectionUtil.addIgnoreNull(values, null), false);
    assert.equal(CollectionUtil.addIgnoreNull(values, 1), true);
  });
  it('cardinality', () => assert.equal(CollectionUtil.cardinality(2, [1, 2, 2]), 2));
  it('collate', () => assert.deepEqual(CollectionUtil.collate([3, 1], [2]), [1, 2, 3]));
  it('collect', () =>
    assert.deepEqual(
      CollectionUtil.collect([1, 2], (value) => value * 2),
      [2, 4],
    ));
  it('containsAll', () => assert.equal(CollectionUtil.containsAll([1, 2, 3], [1, 3]), true));
  it('containsAny', () => assert.equal(CollectionUtil.containsAny([1, 2], 3, 2), true));
  it('countMatches', () =>
    assert.equal(
      CollectionUtil.countMatches([1, 2, 3], (value) => value > 1),
      2,
    ));
  it('disjunction', () => assert.deepEqual(CollectionUtil.disjunction([1, 1, 2], [1, 3]), [1, 2]));
  it('emptyCollection', () => assert.deepEqual(CollectionUtil.emptyCollection<number>(), []));
  it('emptyIfNull', () => assert.deepEqual(CollectionUtil.emptyIfNull(null), []));
  it('exists', () =>
    assert.equal(
      CollectionUtil.exists([1, 2], (value) => value === 2),
      true,
    ));
  it('extractSingleton', () => assert.equal(CollectionUtil.extractSingleton([1]), 1));
  it('filter', () => {
    const values = [1, 2, 3];
    assert.equal(
      CollectionUtil.filter(values, (value) => value > 1),
      true,
    );
    assert.deepEqual(values, [2, 3]);
  });
  it('filterInverse', () => {
    const values = [1, 2, 3];
    CollectionUtil.filterInverse(values, (value) => value > 1);
    assert.deepEqual(values, [1]);
  });
  it('find', () =>
    assert.equal(
      CollectionUtil.find([1, 2], (value) => value === 2),
      2,
    ));
  it('forAllButLastDo', () => {
    const values: number[] = [];
    assert.equal(
      CollectionUtil.forAllButLastDo([1, 2], (value) => values.push(value)),
      2,
    );
    assert.deepEqual(values, [1]);
  });
  it('forAllDo', () => {
    const values: number[] = [];
    CollectionUtil.forAllDo([1, 2], (value) => values.push(value));
    assert.deepEqual(values, [1, 2]);
  });
  it('get', () => {
    assert.equal(CollectionUtil.get([1, 2], 1), 2);
    assert.deepEqual(CollectionUtil.get(new Map([['a', 1]]), 0), ['a', 1]);
  });
  it('getCardinalityMap', () => assert.equal(CollectionUtil.getCardinalityMap([1, 1, 2]).get(1), 2));
  it('hashCode', () => assert.equal(typeof CollectionUtil.hashCode([1, 2]), 'number'));
  it('intersection', () => assert.deepEqual(CollectionUtil.intersection([1, 1, 2], [1, 2]), [1, 2]));
  it('isEmpty', () => assert.equal(CollectionUtil.isEmpty(new Set()), true));
  it('isNotEmpty', () => assert.equal(CollectionUtil.isNotEmpty([1]), true));
  it('isEqualCollection', () => assert.equal(CollectionUtil.isEqualCollection([1, 2, 2], [2, 1, 2]), true));
  it('isFull', () => assert.equal(CollectionUtil.isFull({ isFull: () => true } as never), true));
  it('isProperSubCollection', () => assert.equal(CollectionUtil.isProperSubCollection([1], [1, 2]), true));
  it('isSubCollection', () => assert.equal(CollectionUtil.isSubCollection([1, 2], [2, 1, 2]), true));
  it('matchesAll', () =>
    assert.equal(
      CollectionUtil.matchesAll([2, 4], (value) => value % 2 === 0),
      true,
    ));
  it('maxSize', () => assert.equal(CollectionUtil.maxSize({ maxSize: 3 } as never), 3));
  it('permutations', () =>
    assert.deepEqual(CollectionUtil.permutations([1, 2]), [
      [1, 2],
      [2, 1],
    ]));
  it('predicatedCollection', () => {
    const values = CollectionUtil.predicatedCollection([], (value: number) => value > 0);
    values.push(1);
    assert.throws(() => values.push(0));
  });
  it('removeAll', () => assert.deepEqual(CollectionUtil.removeAll([1, 2, 1], [1]), [2]));
  it('removeCount', () => {
    const values = [1, 2, 3];
    assert.deepEqual(CollectionUtil.removeCount(values, 1, 1), [2]);
    assert.deepEqual(values, [1, 3]);
  });
  it('removeRange', () => {
    const values = [1, 2, 3];
    assert.deepEqual(CollectionUtil.removeRange(values, 1, 3), [2, 3]);
    assert.deepEqual(values, [1]);
  });
  it('retainAll', () => assert.deepEqual(CollectionUtil.retainAll([1, 2, 3], [2, 3]), [2, 3]));
  it('reverseArray', () => {
    const values = [1, 2];
    CollectionUtil.reverseArray(values);
    assert.deepEqual(values, [2, 1]);
  });
  it('select', () =>
    assert.deepEqual(
      CollectionUtil.select([1, 2, 3], (value) => value > 1),
      [2, 3],
    ));
  it('selectRejected', () =>
    assert.deepEqual(
      CollectionUtil.selectRejected([1, 2, 3], (value) => value > 1),
      [1],
    ));
  it('size', () => assert.equal(CollectionUtil.size(new Set([1, 2])), 2));
  it('sizeIsEmpty', () => assert.equal(CollectionUtil.sizeIsEmpty(''), true));
  it('subtract', () => assert.deepEqual(CollectionUtil.subtract([1, 1, 2], [1]), [1, 2]));
  it('subtractBy', () =>
    assert.deepEqual(
      CollectionUtil.subtractBy([1, 2, 3], [2], (value) => value % 2 === 0),
      [1, 3],
    ));
  it('synchronizedCollection', () => {
    const values = [1];
    assert.equal(CollectionUtil.synchronizedCollection(values), values);
  });
  it('transform', () => {
    const values = [1, 2];
    CollectionUtil.transform(values, (value) => value * 2);
    assert.deepEqual(values, [2, 4]);
  });
  it('transformingCollection', () =>
    assert.deepEqual(
      CollectionUtil.transformingCollection([1], (value) => value + 1),
      [2],
    ));
  it('union', () => assert.deepEqual(CollectionUtil.union([1, 1], [1, 2]), [1, 1, 2]));
  it('unmodifiableCollection', () => assert.equal(Object.isFrozen(CollectionUtil.unmodifiableCollection([1])), true));
});
