type NullableArray<T> = readonly T[] | ArrayLike<T> | null | undefined;

function toArray<T>(value: NullableArray<T>): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.from(value);
}

function sameValue(left: unknown, right: unknown): boolean {
  return (
    left === right || (typeof left === 'number' && typeof right === 'number' && Number.isNaN(left) && Number.isNaN(right))
  );
}

function valueHash(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0x7ff80000 : value | 0;
  }
  if (typeof value === 'boolean') {
    return value ? 1231 : 1237;
  }
  if (typeof value === 'string') {
    let result = 0;
    for (const character of value) {
      result = (Math.imul(31, result) + character.codePointAt(0)!) | 0;
    }
    return result;
  }
  return String(value)
    .split('')
    .reduce((hash, character) => (Math.imul(31, hash) + character.charCodeAt(0)) | 0, 0);
}

function deepEquals(left: unknown, right: unknown): boolean {
  if (sameValue(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => deepEquals(value, right[index]));
  }
  return false;
}

function validateIndex(index: number, length: number, allowEnd = false): void {
  const upperBound = allowEnd ? length : length - 1;
  if (!Number.isInteger(index) || index < 0 || index > upperBound) {
    throw new RangeError(`index ${index} is out of bounds for length ${length}`);
  }
}

function numericCompare(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }
  return (left as number) < (right as number) ? -1 : 1;
}

/** Apache Commons Lang inspired array utilities. */
class ArrayUtil {
  static add<T>(array: NullableArray<T>, element: T): T[];
  static add<T>(array: NullableArray<T>, index: number, element: T): T[];
  static add<T>(array: NullableArray<T>, indexOrElement: number | T, element?: T): T[] {
    const result = toArray(array);
    if (element === undefined && arguments.length === 2) {
      result.push(indexOrElement as T);
      return result;
    }
    const index = indexOrElement as number;
    validateIndex(index, result.length, true);
    result.splice(index, 0, element as T);
    return result;
  }

  static addAll<T>(array: NullableArray<T>, ...arrays: Array<NullableArray<T>>): T[] {
    const result = toArray(array);
    for (const current of arrays) {
      result.push(...toArray(current));
    }
    return result;
  }

  static addFirst<T>(array: NullableArray<T>, element: T): T[] {
    return [element, ...toArray(array)];
  }

  static arraycopy<T>(
    source: readonly T[],
    sourcePos: number,
    destinationOrDestinationPos: T[] | number,
    destinationPosOrLength: number,
    lengthOrAllocator: number | (() => T[]) | ((length: number) => T[]) | undefined,
  ): T[] {
    if (Array.isArray(destinationOrDestinationPos)) {
      const destination = destinationOrDestinationPos;
      const destinationPos = destinationPosOrLength;
      const length = lengthOrAllocator as number;
      for (let index = 0; index < length; index += 1) {
        destination[destinationPos + index] = source[sourcePos + index];
      }
      return destination;
    }
    const destinationPos = destinationOrDestinationPos;
    const length = destinationPosOrLength;
    const allocator = lengthOrAllocator;
    const destination =
      typeof allocator === 'function'
        ? allocator.length > 0
          ? (allocator as (size: number) => T[])(source.length + Math.max(0, length - destinationPos))
          : (allocator as () => T[])()
        : source.slice();
    for (let index = 0; index < length; index += 1) {
      destination[destinationPos + index] = source[sourcePos + index];
    }
    return destination;
  }

  static clone<T>(array: NullableArray<T>): T[] | null {
    return array === null || array === undefined ? null : toArray(array);
  }

  static concat<T>(...arrays: Array<NullableArray<T>>): T[] {
    const result: T[] = [];
    for (const array of arrays) {
      result.push(...toArray(array));
    }
    return result;
  }

  static contains<T>(array: NullableArray<T>, value: T, tolerance?: number): boolean {
    return ArrayUtil.indexOf(array, value, 0, tolerance) !== -1;
  }

  static containsAny<T>(array: NullableArray<T>, values: NullableArray<T>): boolean;
  static containsAny<T>(array: NullableArray<T>, ...values: T[]): boolean;
  static containsAny<T>(array: NullableArray<T>, valuesOrFirst: NullableArray<T> | T, ...values: T[]): boolean {
    const searchValues =
      Array.isArray(valuesOrFirst) || ArrayBuffer.isView(valuesOrFirst)
        ? toArray(valuesOrFirst as NullableArray<T>)
        : [valuesOrFirst as T, ...values];
    return searchValues.some((value) => ArrayUtil.contains(array, value));
  }

  static get<T>(array: NullableArray<T>, index: number, defaultValue?: T): T | null | undefined {
    return index >= 0 && index < (array?.length ?? 0) ? Array.from(array as ArrayLike<T>)[index] : defaultValue;
  }

  static getComponentType<T>(array: NullableArray<T>): Function | null {
    const first = array === null || array === undefined ? undefined : Array.from(array)[0];
    return first === null || first === undefined ? null : ((first as { constructor?: Function }).constructor ?? Object);
  }

  static getDimensions(array: unknown): number {
    if (!Array.isArray(array)) {
      return 0;
    }
    return array.length === 0 ? 1 : 1 + ArrayUtil.getDimensions(array[0]);
  }

  static getLength(array: unknown): number {
    if (array === null || array === undefined) {
      return 0;
    }
    if (Array.isArray(array) || ArrayBuffer.isView(array)) {
      return (array as ArrayLike<unknown>).length;
    }
    return 0;
  }

  static hashCode(array: unknown): number {
    if (array === null || array === undefined) {
      return 0;
    }
    return Array.from(array as ArrayLike<unknown>).reduce<number>(
      (hash, value) => (Math.imul(31, hash) + (Array.isArray(value) ? ArrayUtil.hashCode(value) : valueHash(value))) | 0,
      1,
    );
  }

  static indexesOf<T>(array: NullableArray<T>, value: T, startIndex = 0): Set<number> {
    const result = new Set<number>();
    const values = toArray(array);
    for (let index = Math.max(0, startIndex); index < values.length; index += 1) {
      if (sameValue(values[index], value)) {
        result.add(index);
      }
    }
    return result;
  }

  static indexOf<T>(array: NullableArray<T>, value: T, startIndex = 0, tolerance?: number): number {
    const values = toArray(array);
    if (tolerance === undefined && !Number.isInteger(startIndex) && typeof value === 'number') {
      tolerance = startIndex;
      startIndex = 0;
    }
    const start = Math.max(0, startIndex);
    for (let index = start; index < values.length; index += 1) {
      const matches =
        (tolerance === undefined && sameValue(values[index], value)) ||
        (tolerance !== undefined &&
          typeof values[index] === 'number' &&
          Math.abs((values[index] as number) - (value as number)) <= tolerance);
      if (matches) {
        return index;
      }
    }
    return -1;
  }

  static insert<T>(index: number, array: NullableArray<T>, ...values: T[]): T[] {
    const result = toArray(array);
    validateIndex(index, result.length, true);
    result.splice(index, 0, ...values);
    return result;
  }

  static isArrayIndexValid<T>(array: NullableArray<T>, index: number): boolean {
    return index >= 0 && index < (array?.length ?? 0);
  }

  static isEmpty(array: unknown): boolean {
    return array === null || array === undefined || ArrayUtil.getLength(array) === 0;
  }

  static isEquals(left: unknown, right: unknown): boolean {
    if (left === null || left === undefined || right === null || right === undefined) {
      return left === right;
    }
    return deepEquals(Array.from(left as ArrayLike<unknown>), Array.from(right as ArrayLike<unknown>));
  }

  static isNotEmpty(array: unknown): boolean {
    return !ArrayUtil.isEmpty(array);
  }

  static isSameLength(left: unknown, right: unknown): boolean {
    return ArrayUtil.getLength(left) === ArrayUtil.getLength(right);
  }

  static isSameType(left: unknown, right: unknown): boolean {
    if (left === null || left === undefined || right === null || right === undefined) {
      return left === right;
    }
    const leftConstructor = (left as { constructor?: Function }).constructor;
    const rightConstructor = (right as { constructor?: Function }).constructor;
    if (leftConstructor !== rightConstructor) return false;
    if (Array.isArray(left) && Array.isArray(right) && left.length > 0 && right.length > 0) {
      return (left[0] as { constructor?: Function }).constructor === (right[0] as { constructor?: Function }).constructor;
    }
    return true;
  }

  static isSorted<T>(array: NullableArray<T>, comparator: (left: T, right: T) => number = numericCompare): boolean {
    const values = toArray(array);
    for (let index = 1; index < values.length; index += 1) {
      if (comparator(values[index - 1], values[index]) > 0) {
        return false;
      }
    }
    return true;
  }

  static lastIndexOf<T>(array: NullableArray<T>, value: T, startIndex?: number, tolerance?: number): number {
    const values = toArray(array);
    if (tolerance === undefined && startIndex !== undefined && !Number.isInteger(startIndex) && typeof value === 'number') {
      tolerance = startIndex;
      startIndex = undefined;
    }
    const start = Math.min(startIndex ?? values.length - 1, values.length - 1);
    for (let index = start; index >= 0; index -= 1) {
      const matches =
        (tolerance === undefined && sameValue(values[index], value)) ||
        (tolerance !== undefined &&
          typeof values[index] === 'number' &&
          Math.abs((values[index] as number) - (value as number)) <= tolerance);
      if (matches) {
        return index;
      }
    }
    return -1;
  }

  static newInstance<T>(_componentType: Function, length: number): T[] {
    if (length < 0 || !Number.isInteger(length)) {
      throw new RangeError('length must be a non-negative integer');
    }
    return new Array<T>(length);
  }

  static nullTo<T>(array: NullableArray<T>, defaultArray: T[]): T[] {
    return array === null || array === undefined ? defaultArray : toArray(array);
  }

  static nullToEmpty<T>(array: NullableArray<T>): T[] {
    return array === null || array === undefined ? [] : toArray(array);
  }

  static remove<T>(array: NullableArray<T>, index: number): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const result = toArray(array);
    validateIndex(index, result.length);
    result.splice(index, 1);
    return result;
  }

  static removeAll<T>(array: NullableArray<T>, ...indices: number[]): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const removed = new Set(indices);
    return toArray(array).filter((_, index) => !removed.has(index));
  }

  static removeAllOccurrences<T>(array: NullableArray<T>, element: T): T[] | null {
    return array === null || array === undefined ? null : toArray(array).filter((value) => !sameValue(value, element));
  }

  static removeAllOccurences<T>(array: NullableArray<T>, element: T): T[] | null {
    return ArrayUtil.removeAllOccurrences(array, element);
  }

  static removeElement<T>(array: NullableArray<T>, element: T): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const result = toArray(array);
    const index = ArrayUtil.indexOf(result, element);
    if (index >= 0) {
      result.splice(index, 1);
    }
    return result;
  }

  static removeElements<T>(array: NullableArray<T>, ...elements: T[]): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const remaining = toArray(elements);
    return toArray(array).filter((value) => {
      const index = remaining.findIndex((candidate) => sameValue(candidate, value));
      if (index < 0) {
        return true;
      }
      remaining.splice(index, 1);
      return false;
    });
  }

  static reverse<T>(array: T[] | null | undefined, startIndex = 0, endIndex = array?.length ?? 0): void {
    if (array === null || array === undefined) {
      return;
    }
    const start = Math.max(0, startIndex);
    const end = Math.min(array.length, endIndex);
    for (let left = start, right = end - 1; left < right; left += 1, right -= 1) {
      [array[left], array[right]] = [array[right], array[left]];
    }
  }

  static setAll<T>(array: T[], generator: ((index: number) => T) | (() => T)): T[] {
    for (let index = 0; index < array.length; index += 1) {
      array[index] = generator.length > 0 ? (generator as (index: number) => T)(index) : (generator as () => T)();
    }
    return array;
  }

  static shift<T>(array: T[] | null | undefined, offset: number, startIndex = 0, endIndex = array?.length ?? 0): void {
    if (array === null || array === undefined) {
      return;
    }
    const start = Math.max(0, startIndex);
    const end = Math.min(array.length, endIndex);
    const length = end - start;
    if (length <= 0) {
      return;
    }
    const distance = ((offset % length) + length) % length;
    const values = array.slice(start, end);
    for (let index = 0; index < length; index += 1) {
      array[start + ((index + distance) % length)] = values[index];
    }
  }

  static shuffle<T>(array: T[] | null | undefined, random: () => number = Math.random): void {
    if (array === null || array === undefined) {
      return;
    }
    for (let index = array.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [array[index], array[other]] = [array[other], array[index]];
    }
  }

  static startsWith<T>(array: NullableArray<T>, expected: NullableArray<T>): boolean {
    const source = toArray(array);
    const prefix = toArray(expected);
    return prefix.length <= source.length && prefix.every((value, index) => sameValue(source[index], value));
  }

  static subarray<T>(array: NullableArray<T>, startIndex = 0, endIndex = array?.length ?? 0): T[] {
    if (array === null || array === undefined) {
      return [];
    }
    const values = toArray(array);
    return values.slice(Math.max(0, startIndex), Math.max(0, endIndex));
  }

  static swap<T>(array: T[] | null | undefined, offset1: number, offset2: number, length = 1): void {
    if (array === null || array === undefined) {
      return;
    }
    for (let index = 0; index < length; index += 1) {
      const first = offset1 + index;
      const second = offset2 + index;
      if (first >= 0 && first < array.length && second >= 0 && second < array.length) {
        [array[first], array[second]] = [array[second], array[first]];
      }
    }
  }

  static toArray<T>(...items: T[]): T[] {
    return [...items];
  }

  static toMap(array: readonly unknown[] | null | undefined): Map<unknown, unknown> {
    const result = new Map<unknown, unknown>();
    if (array === null || array === undefined) {
      return result;
    }
    for (const item of array) {
      if (Array.isArray(item) && item.length >= 2) {
        result.set(item[0], item[1]);
      } else if (item instanceof Map) {
        for (const [key, value] of item) {
          result.set(key, value);
        }
      }
    }
    return result;
  }

  static toObject(
    array: readonly (boolean | number | string | null | undefined)[] | null | undefined,
  ): Array<boolean | number | string | null> | null {
    return array === null || array === undefined ? null : array.map((value) => (value === undefined ? null : value));
  }

  static toPrimitive<T extends boolean | number | string>(
    array: readonly (T | null | undefined)[] | null | undefined,
    valueForNull?: T,
  ): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const fallback =
      valueForNull ?? ((typeof array.find((value) => value !== null && value !== undefined) === 'number' ? 0 : false) as T);
    return array.map((value) => (value === null || value === undefined ? fallback : value));
  }

  static toString(array: unknown, stringIfNull = '{}'): string {
    if (array === null || array === undefined) {
      return stringIfNull;
    }
    if (!Array.isArray(array) && !ArrayBuffer.isView(array)) {
      return String(array);
    }
    return `{${Array.from(array as ArrayLike<unknown>)
      .map((value) =>
        Array.isArray(value) ? ArrayUtil.toString(value) : value === null || value === undefined ? 'null' : String(value),
      )
      .join(',')
      .replace(/, /gu, ',')}}`;
  }

  static toStringArray(array: readonly unknown[] | null | undefined, valueForNullElements = ''): string[] | null {
    return array === null || array === undefined
      ? null
      : array.map((value) => (value === null || value === undefined ? valueForNullElements : String(value)));
  }
}

export default ArrayUtil;
