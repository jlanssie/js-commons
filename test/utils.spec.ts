import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ArrayUtils,
  BooleanUtils,
  ClassUtils,
  CollectionUtils,
  EnumUtils,
  LocaleUtils,
  ObjectUtils,
  StringUtils,
} from '../src/_index.ts';

describe('Commons-inspired utilities', () => {
  describe('StringUtils', () => {
    it('handles null-safe predicates and common transformations', () => {
      assert.equal(StringUtils.isEmpty(null), true);
      assert.equal(StringUtils.isBlank(' \t'), true);
      assert.equal(StringUtils.capitalize('commons'), 'Commons');
      assert.equal(StringUtils.leftPad('7', 3, '0'), '007');
      assert.equal(StringUtils.substringBetween('[value]', '[', ']'), 'value');
      assert.equal(StringUtils.join(['a', null, 'b'], ','), 'a,,b');
      assert.deepEqual(StringUtils.split('a,b,,c', ','), ['a', 'b', 'c']);
    });

    it('keeps Apache-style abbreviation and tokenization edge cases', () => {
      assert.equal(StringUtils.abbreviate('abcdefghijklmno', 10), 'abcdefg...');
      assert.equal(StringUtils.abbreviate('abcdefghijklmno', 5, 10), '...fghi...');
      assert.deepEqual(StringUtils.split('ab:cd:ef', ':', 2), ['ab', 'cd:ef']);
      assert.deepEqual(StringUtils.splitByCharacterType('fooBar'), ['foo', 'B', 'ar']);
      assert.deepEqual(StringUtils.splitByCharacterTypeCamelCase('fooBar'), ['foo', 'Bar']);
      assert.deepEqual(StringUtils.stripAll(' a ', ' b '), ['a', 'b']);
    });
  });

  describe('ArrayUtils', () => {
    it('returns new arrays for structural operations and mutates ordering operations', () => {
      assert.deepEqual(ArrayUtils.add([1, 2], 3), [1, 2, 3]);
      assert.deepEqual(ArrayUtils.removeElement([1, 2, 1], 1), [2, 1]);
      assert.deepEqual(ArrayUtils.indexesOf([1, 2, 1], 1), new Set([0, 2]));
      assert.deepEqual(ArrayUtils.subarray([0, 1, 2, 3], 1, 3), [1, 2]);
      const values = [1, 2, 3];
      ArrayUtils.reverse(values);
      assert.deepEqual(values, [3, 2, 1]);
      assert.equal(ArrayUtils.toString([1, 'two']), '{1,two}');
    });
  });

  describe('BooleanUtils and ObjectUtils', () => {
    it('provides Apache-style conversions and null handling', () => {
      assert.equal(BooleanUtils.toBoolean('YES'), true);
      assert.equal(BooleanUtils.toBooleanObject('unknown'), null);
      assert.equal(BooleanUtils.toStringYesNo(false), 'no');
      //assert.equal(BooleanUtils.and([true, true]), true);
      assert.equal(ObjectUtils.firstNonNull(null, undefined, 'value'), 'value');
      assert.equal(ObjectUtils.max(2, 5, 3), 5);
      assert.equal(ObjectUtils.isEmpty(new Map()), true);
    });
  });

  describe('LocaleUtils and EnumUtils', () => {
    it('supports Java-style locales and TypeScript enum objects', () => {
      const locale = LocaleUtils.toLocale('en_US');
      assert.equal(locale?.language, 'en');
      assert.equal(locale?.country, 'US');
      assert.deepEqual(LocaleUtils.localeLookupList('en_US_POSIX').map(String), ['en_US_POSIX', 'en_US', 'en']);

      const Color = { Red: 'Red', Blue: 'Blue' } as const;
      assert.equal(EnumUtils.getEnumIgnoreCase(Color, 'blue'), 'Blue');
      assert.deepEqual(EnumUtils.getEnumList(Color), ['Red', 'Blue']);
      assert.deepEqual(EnumUtils.processBitVector(Color, 3), ['Red', 'Blue']);
    });
  });

  describe('ClassUtils and CollectionUtils', () => {
    it('works with constructors and native collections', () => {
      class Parent {}
      class Child extends Parent {}
      assert.equal(ClassUtils.isAssignable(Child, Parent), true);
      assert.equal(ClassUtils.getSimpleName(Child), 'Child');
      // @ts-ignore
      assert.ok(ClassUtils.getAllSuperclasses(Child).includes(Parent));
      assert.equal(ClassUtils.getAbbreviatedName('java.lang.String', 5), 'j.l.String');
      assert.equal(ClassUtils.getCanonicalName('[Ljava.lang.String;'), 'java.lang.String[]');

      const values = [1, 2, 2, 3];
      assert.equal(CollectionUtils.cardinality(2, values), 2);
      assert.deepEqual(CollectionUtils.intersection(values, [2, 3]), [2, 3]);
      assert.deepEqual(CollectionUtils.union([1, 1], [1, 2]), [1, 1, 2]);
      assert.deepEqual(
        CollectionUtils.select(values, (value) => value > 1),
        [2, 2, 3],
      );
      const target: number[] = [];
      CollectionUtils.addAll(target, 1, 2, 3);
      assert.deepEqual(target, [1, 2, 3]);
      assert.deepEqual(CollectionUtils.removeAll([1, 1, 2], [1]), [2]);
      assert.deepEqual(CollectionUtils.subtract([1, 1, 2], [1]), [1, 2]);
      const removable = [1, 2, 3, 4];
      assert.deepEqual(CollectionUtils.removeCount(removable, 1, 2), [2, 3]);
      assert.deepEqual(removable, [1, 4]);
      const ranged = [1, 2, 3, 4];
      assert.deepEqual(CollectionUtils.removeRange(ranged, 1, 3), [2, 3]);
      assert.deepEqual(ranged, [1, 4]);
      assert.deepEqual(
        CollectionUtils.subtract([1, 2, 2, 3], [2, 3], (value) => value === 2),
        [1, 2, 3],
      );
    });
  });
});
