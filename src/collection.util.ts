export type Predicate<T> = (value: T) => boolean;
export type Transformer<I, O> = (value: I) => O;
export type Closure<T> = (value: T) => void;
export type Equator<T> = (left: T, right: T) => boolean;
export type CollectionLike<T> = Iterable<T> | ArrayLike<T> | null | undefined;

function valuesOf<T>(collection: CollectionLike<T>): T[] {
  if (collection === null || collection === undefined) {
    return [];
  }
  if (Array.isArray(collection)) {
    return [...collection];
  }
  if (collection instanceof Map) {
    return [...collection.entries()] as T[];
  }
  if (typeof (collection as Iterable<T>)[Symbol.iterator] === 'function') {
    return [...(collection as Iterable<T>)];
  }
  return Array.from(collection as ArrayLike<T>);
}

function addValue<T>(collection: CollectionLike<T>, value: T): boolean {
  if (collection === null || collection === undefined) {
    throw new TypeError('collection must not be null');
  }
  if (Array.isArray(collection)) {
    collection.push(value);
    return true;
  }
  const candidate = collection as unknown as { add?: (item: T) => unknown; push?: (item: T) => unknown };
  if (typeof candidate.add === 'function') {
    const before = collection instanceof Set ? collection.size : undefined;
    candidate.add(value);
    return before === undefined || collection instanceof Set
      ? collection instanceof Set
        ? collection.size !== before
        : true
      : true;
  }
  if (typeof candidate.push === 'function') {
    candidate.push(value);
    return true;
  }
  throw new TypeError('collection is not mutable');
}

function cardinalityMap<T>(
  collection: CollectionLike<T>,
  equator: Equator<T> = Object.is,
): Array<{ value: T; count: number }> {
  const result: Array<{ value: T; count: number }> = [];
  for (const value of valuesOf(collection)) {
    const entry = result.find((candidate) => equator(candidate.value, value));
    if (entry) entry.count += 1;
    else result.push({ value, count: 1 });
  }
  return result;
}

function collectionSize(collection: unknown): number {
  if (collection === null || collection === undefined) return 0;
  if (typeof collection === 'string' || Array.isArray(collection) || ArrayBuffer.isView(collection))
    return (collection as { length: number }).length;
  if (collection instanceof Map || collection instanceof Set) return collection.size;
  const candidate = collection as { size?: unknown; length?: unknown };
  if (typeof candidate.size === 'number') return candidate.size;
  if (typeof candidate.length === 'number') return candidate.length;
  if (typeof (collection as Iterable<unknown>)[Symbol.iterator] === 'function')
    return valuesOf(collection as Iterable<unknown>).length;
  return 0;
}

/** Apache Commons Collections inspired collection utilities. */
class CollectionUtil {
  static readonly INDEX_NOT_FOUND = -1;
  static readonly DEFAULT_TOSTRING_PREFIX = '[';
  static readonly DEFAULT_TOSTRING_SUFFIX = ']';
  static readonly COLON = ':';
  static readonly COMMA = ',';
  static readonly EMPTY_COLLECTION: readonly never[] = Object.freeze([]);

  static addAll<T>(collection: CollectionLike<T>, values: Iterable<T> | ArrayLike<T>): boolean;
  static addAll<T>(collection: CollectionLike<T>, ...values: T[]): boolean;
  static addAll<T>(collection: CollectionLike<T>, values: Iterable<T> | ArrayLike<T> | T, ...additional: T[]): boolean {
    if (additional.length > 0) {
      let changed = false;
      for (const value of [values as T, ...additional]) changed = addValue(collection, value) || changed;
      return changed;
    }
    if (
      values !== null &&
      typeof values === 'object' &&
      (typeof (values as Iterable<T>)[Symbol.iterator] === 'function' || typeof (values as ArrayLike<T>).length === 'number')
    ) {
      let changed = false;
      for (const value of valuesOf(values as CollectionLike<T>)) changed = addValue(collection, value) || changed;
      return changed;
    }
    return addValue(collection, values as T);
  }

  static addIgnoreNull<T>(collection: CollectionLike<T>, value: T | null | undefined): boolean {
    return value === null || value === undefined ? false : addValue(collection, value);
  }

  static cardinality<T>(value: T, collection: CollectionLike<T>): number {
    return valuesOf(collection).filter((entry) => Object.is(entry, value)).length;
  }

  static collate<T>(
    left: CollectionLike<T>,
    right: CollectionLike<T>,
    comparator: ((a: T, b: T) => number) | boolean = numericCompare,
    includeDuplicates = true,
  ): T[] {
    const compare = typeof comparator === 'boolean' ? numericCompare : comparator;
    const include = typeof comparator === 'boolean' ? comparator : includeDuplicates;
    const result = [...valuesOf(left), ...valuesOf(right)].sort(compare);
    return include ? result : result.filter((value, index) => index === 0 || compare(result[index - 1], value) !== 0);
  }

  static collect<I, O>(input: CollectionLike<I>, transformer: Transformer<I, O>): O[] {
    return valuesOf(input).map(transformer);
  }

  static containsAll(left: CollectionLike<unknown>, right: CollectionLike<unknown>): boolean {
    const source = valuesOf(left);
    return valuesOf(right).every((value) => source.some((entry) => Object.is(entry, value)));
  }

  static containsAny(left: CollectionLike<unknown>, right: CollectionLike<unknown>): boolean;
  static containsAny<T>(left: CollectionLike<unknown>, ...right: T[]): boolean;
  static containsAny<T>(left: CollectionLike<unknown>, rightOrFirst: CollectionLike<T> | T, ...rest: T[]): boolean {
    const right =
      rightOrFirst !== null &&
      typeof rightOrFirst === 'object' &&
      (typeof (rightOrFirst as Iterable<T>)[Symbol.iterator] === 'function' ||
        typeof (rightOrFirst as ArrayLike<T>).length === 'number')
        ? valuesOf(rightOrFirst as CollectionLike<T>)
        : [rightOrFirst as T, ...rest];
    const source = valuesOf(left);
    return right.some((value) => source.some((entry) => Object.is(entry, value)));
  }

  static countMatches<T>(input: CollectionLike<T>, predicate: Predicate<T>): number {
    return predicate === null || predicate === undefined ? 0 : valuesOf(input).filter(predicate).length;
  }

  static disjunction<T>(left: CollectionLike<T>, right: CollectionLike<T>): T[] {
    const leftCounts = cardinalityMap(left);
    const rightCounts = cardinalityMap(right);
    return [
      ...leftCounts,
      ...rightCounts.filter((entry) => !leftCounts.some((candidate) => Object.is(candidate.value, entry.value))),
    ].flatMap((entry) =>
      Array(
        Math.abs(entry.count - (rightCounts.find((candidate) => Object.is(candidate.value, entry.value))?.count ?? 0)),
      ).fill(entry.value),
    );
  }

  static emptyCollection<T>(): T[] {
    return CollectionUtil.EMPTY_COLLECTION as unknown as T[];
  }
  static emptyIfNull<T>(collection: CollectionLike<T>): T[] {
    return collection === null || collection === undefined
      ? CollectionUtil.emptyCollection<T>()
      : Array.isArray(collection)
        ? collection
        : valuesOf(collection);
  }
  static exists<T>(input: CollectionLike<T>, predicate: Predicate<T>): boolean {
    return predicate === null || predicate === undefined ? false : valuesOf(input).some(predicate);
  }

  static extractSingleton<T>(collection: CollectionLike<T>): T | null {
    const values = valuesOf(collection);
    if (values.length !== 1) {
      throw new Error('Can extract singleton only when collection size is exactly one');
    }
    return values[0];
  }

  static filter<T>(collection: CollectionLike<T>, predicate: Predicate<T>): boolean {
    if (predicate === null || predicate === undefined) return false;
    if (Array.isArray(collection)) {
      const before = collection.length;
      for (let index = collection.length - 1; index >= 0; index -= 1)
        if (!predicate(collection[index])) collection.splice(index, 1);
      return before !== collection.length;
    }
    if (collection instanceof Set) {
      let changed = false;
      for (const value of collection)
        if (!predicate(value)) {
          collection.delete(value);
          changed = true;
        }
      return changed;
    }
    return false;
  }

  static filterInverse<T>(collection: CollectionLike<T>, predicate: Predicate<T>): boolean {
    return predicate === null || predicate === undefined
      ? false
      : CollectionUtil.filter(collection, (value) => !predicate(value));
  }
  static find<T>(collection: CollectionLike<T>, predicate: Predicate<T>): T | null {
    return predicate === null || predicate === undefined ? null : (valuesOf(collection).find(predicate) ?? null);
  }

  static forAllButLastDo<T>(collection: CollectionLike<T>, closure: Closure<T>): T | null {
    const values = valuesOf(collection);
    if (closure === null || closure === undefined) return null;
    for (const value of values.slice(0, -1)) closure(value);
    return values.at(-1) ?? null;
  }

  static forAllDo<T>(collection: CollectionLike<T>, closure: Closure<T>): Closure<T> {
    if (closure !== null && closure !== undefined) valuesOf(collection).forEach(closure);
    return closure;
  }

  static get<T>(collection: CollectionLike<T>, index: number): T | null {
    if (index < 0) return null;
    if (collection instanceof Map) return [...collection.entries()][index] as T;
    if (typeof collection === 'string') return collection[index] as T;
    return valuesOf(collection)[index] ?? null;
  }

  static getCardinalityMap<T>(collection: CollectionLike<T>): Map<T, number> {
    const result = new Map<T, number>();
    for (const value of valuesOf(collection)) result.set(value, (result.get(value) ?? 0) + 1);
    return result;
  }

  static hashCode<T>(collection: CollectionLike<T>, equator: Equator<T> = Object.is): number {
    void equator;
    if (collection === null || collection === undefined) return 0;
    return valuesOf(collection).reduce((hash, value) => (Math.imul(31, hash) + collectionHash(value)) | 0, 1);
  }

  static intersection<T>(left: CollectionLike<T>, right: CollectionLike<T>): T[] {
    const remaining = cardinalityMap(right);
    const result: T[] = [];
    for (const value of valuesOf(left)) {
      const entry = remaining.find((candidate) => Object.is(candidate.value, value));
      if (entry && entry.count > 0) {
        result.push(value);
        entry.count -= 1;
      }
    }
    return result;
  }

  static isEmpty(collection: CollectionLike<unknown>): boolean {
    return collectionSize(collection) === 0;
  }
  static isNotEmpty(collection: CollectionLike<unknown>): boolean {
    return !CollectionUtil.isEmpty(collection);
  }
  static isEqualCollection<T>(left: CollectionLike<T>, right: CollectionLike<T>, equator: Equator<T> = Object.is): boolean {
    const a = cardinalityMap(left, equator);
    const b = cardinalityMap(right, equator);
    return (
      a.length === b.length &&
      a.every((entry) => b.some((candidate) => equator(entry.value, candidate.value) && entry.count === candidate.count))
    );
  }
  static isFull(collection: CollectionLike<unknown>): boolean {
    const candidate = collection as unknown as { isFull?: () => boolean };
    return typeof candidate?.isFull === 'function' ? candidate.isFull() : false;
  }
  static isProperSubCollection<T>(left: CollectionLike<T>, right: CollectionLike<T>): boolean {
    return CollectionUtil.isSubCollection(left, right) && collectionSize(left) < collectionSize(right);
  }
  static isSubCollection<T>(left: CollectionLike<T>, right: CollectionLike<T>): boolean {
    const a = cardinalityMap(left);
    const b = cardinalityMap(right);
    return a.every((entry) => (b.find((candidate) => Object.is(candidate.value, entry.value))?.count ?? 0) >= entry.count);
  }
  static matchesAll<T>(input: CollectionLike<T>, predicate: Predicate<T>): boolean {
    return predicate === null || predicate === undefined ? false : valuesOf(input).every(predicate);
  }
  static maxSize(collection: CollectionLike<unknown>): number {
    const candidate = collection as unknown as { maxSize?: number | (() => number) };
    return typeof candidate?.maxSize === 'function'
      ? candidate.maxSize()
      : typeof candidate?.maxSize === 'number'
        ? candidate.maxSize
        : -1;
  }

  static permutations<T>(collection: CollectionLike<T>): T[][] {
    const values = valuesOf(collection);
    const result: T[][] = [];
    const visit = (remaining: T[], path: T[]): void => {
      if (remaining.length === 0) {
        result.push(path);
        return;
      }
      remaining.forEach((value, index) =>
        visit([...remaining.slice(0, index), ...remaining.slice(index + 1)], [...path, value]),
      );
    };
    visit(values, []);
    return result;
  }

  static predicatedCollection<T>(collection: T[], predicate: Predicate<T>): T[] {
    const target = collection;
    return new Proxy(target, {
      get(object, property, receiver) {
        if (property === 'push')
          return (...items: T[]) => {
            items.forEach((item) => {
              if (!predicate(item)) throw new Error('predicate rejected value');
            });
            return object.push(...items);
          };
        return Reflect.get(object, property, receiver);
      },
    });
  }

  static removeAll<T>(collection: CollectionLike<T>, remove: CollectionLike<T>, equator?: Equator<T>): T[] {
    const isEqual = equator ?? Object.is;
    const removed = valuesOf(remove);
    return valuesOf(collection).filter((value) => !removed.some((candidate) => isEqual(value, candidate)));
  }
  static removeCount<T>(collection: CollectionLike<T>, startIndex: number, count: number): T[] {
    if (!Number.isInteger(startIndex) || startIndex < 0) {
      throw new RangeError('startIndex must be a non-negative integer');
    }
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError('count must be a non-negative integer');
    }
    const values = valuesOf(collection);
    if (startIndex + count > values.length) {
      throw new RangeError('startIndex + count must not exceed the collection size');
    }
    if (Array.isArray(collection)) {
      return collection.splice(startIndex, count);
    }
    return values.slice(startIndex, startIndex + count);
  }
  static removeRange<T>(collection: CollectionLike<T>, startIndex: number, endIndex: number): T[] {
    if (endIndex < startIndex) {
      throw new RangeError('endIndex must not be less than startIndex');
    }
    return CollectionUtil.removeCount(collection, startIndex, endIndex - startIndex);
  }
  static retainAll<T>(collection: CollectionLike<T>, retain: CollectionLike<T>, equator?: Equator<T>): T[] {
    const isEqual = equator ?? Object.is;
    const values = valuesOf(retain);
    return valuesOf(collection).filter((value) => values.some((candidate) => isEqual(value, candidate)));
  }
  static reverseArray<T>(array: T[]): void {
    array.reverse();
  }
  static select<T>(input: CollectionLike<T>, predicate: Predicate<T>): T[] {
    return predicate === null || predicate === undefined ? [] : valuesOf(input).filter(predicate);
  }
  static selectRejected<T>(input: CollectionLike<T>, predicate: Predicate<T>): T[] {
    return predicate === null || predicate === undefined ? [] : valuesOf(input).filter((value) => !predicate(value));
  }
  static size(object: unknown): number {
    return collectionSize(object);
  }
  static sizeIsEmpty(object: unknown): boolean {
    return collectionSize(object) === 0;
  }
  static subtract<T>(left: CollectionLike<T>, right: CollectionLike<T>): T[];
  static subtract<T>(left: CollectionLike<T>, right: CollectionLike<T>, predicate: Predicate<T>): T[];
  static subtract<T>(left: CollectionLike<T>, right: CollectionLike<T>, predicate: Predicate<T> = () => true): T[] {
    const remaining = cardinalityMap(valuesOf(right).filter(predicate));
    return valuesOf(left).filter((value) => {
      const entry = remaining.find((candidate) => Object.is(candidate.value, value));
      if (entry && entry.count > 0) {
        entry.count -= 1;
        return false;
      }
      return true;
    });
  }
  static subtractBy<T>(left: CollectionLike<T>, right: CollectionLike<T>, predicate: Predicate<T>): T[] {
    return CollectionUtil.subtract(left, right, predicate);
  }
  static synchronizedCollection<T>(collection: T[]): T[] {
    return collection;
  }
  static transform<T>(collection: T[], transformer: Transformer<T, T>): void {
    for (let index = 0; index < collection.length; index += 1) collection[index] = transformer(collection[index]);
  }
  static transformingCollection<T>(collection: T[], transformer: Transformer<T, T>): T[] {
    CollectionUtil.transform(collection, transformer);
    return collection;
  }
  static union<T>(left: CollectionLike<T>, right: CollectionLike<T>): T[] {
    const result = valuesOf(left);
    const leftCounts = CollectionUtil.getCardinalityMap(left);
    const rightCounts = CollectionUtil.getCardinalityMap(right);
    for (const [value, count] of rightCounts)
      for (let index = count - (leftCounts.get(value) ?? 0); index > 0; index -= 1) result.push(value);
    return result;
  }
  static unmodifiableCollection<T>(collection: CollectionLike<T>): readonly T[] {
    return Object.freeze(valuesOf(collection));
  }
}

function numericCompare(left: unknown, right: unknown): number {
  if (left === right) return 0;
  return (left as string | number) < (right as string | number) ? -1 : 1;
}

function collectionHash(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value | 0;
  if (typeof value === 'string')
    return value.split('').reduce((hash, character) => (Math.imul(31, hash) + character.charCodeAt(0)) | 0, 0);
  return String(value)
    .split('')
    .reduce((hash, character) => (Math.imul(31, hash) + character.charCodeAt(0)) | 0, 0);
}

export { CollectionUtil, CollectionUtil as CollectionUtils, CollectionUtil as CollectionsUtils };
export default CollectionUtil;
