type NullableArray<T> = readonly T[] | ArrayLike<T> | null | undefined;

/**
 * Converts the supplied value using to array.
 * @param {NullableArray<T>} value Value to process.
 * @return {T[]} The resulting collection.
 */
function toArray<T>(value: NullableArray<T>): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.from(value);
}

/**
 * Performs the same value operation.
 * @param {unknown} left Left value to compare.
 * @param {unknown} right Right value to compare.
 * @return {boolean} Whether same value.
 */
function sameValue(left: unknown, right: unknown): boolean {
  return (
    left === right || (typeof left === 'number' && typeof right === 'number' && Number.isNaN(left) && Number.isNaN(right))
  );
}

/**
 * Performs the value hash operation.
 * @param {unknown} value Value to process.
 * @return {number} The resulting number.
 */
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

/**
 * Performs the deep equals operation.
 * @param {unknown} left Left value to compare.
 * @param {unknown} right Right value to compare.
 * @return {boolean} Whether deep equals.
 */
function deepEquals(left: unknown, right: unknown): boolean {
  if (sameValue(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => deepEquals(value, right[index]));
  }
  return false;
}

/**
 * Performs the validate index operation.
 * @param {number} index Index to process.
 * @param {number} length Number of characters or items.
 * @param {boolean} allowEnd Whether the ending index is allowed.
 */
function validateIndex(index: number, length: number, allowEnd = false): void {
  const upperBound = allowEnd ? length : length - 1;
  if (!Number.isInteger(index) || index < 0 || index > upperBound) {
    throw new RangeError(`index ${index} is out of bounds for length ${length}`);
  }
}

/**
 * Performs the numeric compare operation.
 * @param {unknown} left Left value to compare.
 * @param {unknown} right Right value to compare.
 * @return {number} The resulting number.
 */
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
  /**
   * Updates or transforms the value using add.
   * @param {NullableArray<T>} array Array to process.
   * @param {number | T} indexOrElement Element or insertion index.
   * @param {T} element Element to process.
   * @return {T[]} The resulting collection.
   */
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

  /**
   * Updates or transforms the value using add all.
   * @param {NullableArray<T>} array Array to process.
   * @param {...NullableArray<T>} arrays Arrays to combine.
   * @return {T[]} The resulting collection.
   */
  static addAll<T>(array: NullableArray<T>, ...arrays: Array<NullableArray<T>>): T[] {
    const result = toArray(array);
    for (const current of arrays) {
      result.push(...toArray(current));
    }
    return result;
  }

  /**
   * Updates or transforms the value using add first.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} element Element to process.
   * @return {T[]} The resulting collection.
   */
  static addFirst<T>(array: NullableArray<T>, element: T): T[] {
    return [element, ...toArray(array)];
  }

  /**
   * Performs the arraycopy operation.
   * @param {readonly T[]} source Source to inspect.
   * @param {number} sourcePos Source pos.
   * @param {T[] | number} destinationOrDestinationPos Destination array or destination position.
   * @param {number} destinationPosOrLength Destination position or copy length.
   * @param {number | (() => T[]) | ((length: number) => T[]) | undefined} lengthOrAllocator Copy length or destination allocator.
   * @return {T[]} The resulting collection.
   */
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

  /**
   * Creates a value using clone.
   * @param {NullableArray<T>} array Array to process.
   * @return {T[] | null} The resulting collection.
   */
  static clone<T>(array: NullableArray<T>): T[] | null {
    return array === null || array === undefined ? null : toArray(array);
  }

  /**
   * Performs the concat operation.
   * @param {...NullableArray<T>} arrays Arrays to combine.
   * @return {T[]} The resulting collection.
   */
  static concat<T>(...arrays: Array<NullableArray<T>>): T[] {
    const result: T[] = [];
    for (const array of arrays) {
      result.push(...toArray(array));
    }
    return result;
  }

  /**
   * Returns whether contains.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} value Value to process.
   * @param {number} tolerance Tolerance.
   * @return {boolean} Whether contains.
   */
  static contains<T>(array: NullableArray<T>, value: T, tolerance?: number): boolean {
    return ArrayUtil.indexOf(array, value, 0, tolerance) !== -1;
  }

  static containsAny<T>(array: NullableArray<T>, values: NullableArray<T>): boolean;
  static containsAny<T>(array: NullableArray<T>, ...values: T[]): boolean;
  /**
   * Returns whether any.
   * @param {NullableArray<T>} array Array to process.
   * @param {NullableArray<T> | T} valuesOrFirst Collection or first value to process.
   * @param {...T} values Values to process.
   * @return {boolean} Whether contains any.
   */
  static containsAny<T>(array: NullableArray<T>, valuesOrFirst: NullableArray<T> | T, ...values: T[]): boolean {
    const searchValues =
      Array.isArray(valuesOrFirst) || ArrayBuffer.isView(valuesOrFirst)
        ? toArray(valuesOrFirst as NullableArray<T>)
        : [valuesOrFirst as T, ...values];
    return searchValues.some((value) => ArrayUtil.contains(array, value));
  }

  /**
   * Returns the get.
   * @param {NullableArray<T>} array Array to process.
   * @param {number} index Index to process.
   * @param {T} defaultValue Value to use when the input is nullish.
   * @return {T | null | undefined} The resulting value.
   */
  static get<T>(array: NullableArray<T>, index: number, defaultValue?: T): T | null | undefined {
    return index >= 0 && index < (array?.length ?? 0) ? Array.from(array as ArrayLike<T>)[index] : defaultValue;
  }

  /**
   * Returns the get component type.
   * @param {NullableArray<T>} array Array to process.
   * @return {Function | null} The resulting value.
   */
  static getComponentType<T>(array: NullableArray<T>): Function | null {
    const first = array === null || array === undefined ? undefined : Array.from(array)[0];
    return first === null || first === undefined ? null : ((first as { constructor?: Function }).constructor ?? Object);
  }

  /**
   * Returns the get dimensions.
   * @param {unknown} array Array to process.
   * @return {number} The resulting number.
   */
  static getDimensions(array: unknown): number {
    if (!Array.isArray(array)) {
      return 0;
    }
    return array.length === 0 ? 1 : 1 + ArrayUtil.getDimensions(array[0]);
  }

  /**
   * Returns the get length.
   * @param {unknown} array Array to process.
   * @return {number} The resulting number.
   */
  static getLength(array: unknown): number {
    if (array === null || array === undefined) {
      return 0;
    }
    if (Array.isArray(array) || ArrayBuffer.isView(array)) {
      return (array as ArrayLike<unknown>).length;
    }
    return 0;
  }

  /**
   * Returns the hash code for the array.
   * @param {unknown} array Array to process.
   * @return {number} The resulting number.
   */
  static hashCode(array: unknown): number {
    if (array === null || array === undefined) {
      return 0;
    }
    return Array.from(array as ArrayLike<unknown>).reduce<number>(
      (hash, value) => (Math.imul(31, hash) + (Array.isArray(value) ? ArrayUtil.hashCode(value) : valueHash(value))) | 0,
      1,
    );
  }

  /**
   * Performs the indexes of operation.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} value Value to process.
   * @param {number} startIndex Starting index.
   * @return {Set<number>} The resulting collection.
   */
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

  /**
   * Returns the index of.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} value Value to process.
   * @param {number} startIndex Starting index.
   * @param {number} tolerance Tolerance.
   * @return {number} The resulting number.
   */
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

  /**
   * Updates or transforms the value using insert.
   * @param {number} index Index to process.
   * @param {NullableArray<T>} array Array to process.
   * @param {...T} values Values to process.
   * @return {T[]} The resulting collection.
   */
  static insert<T>(index: number, array: NullableArray<T>, ...values: T[]): T[] {
    const result = toArray(array);
    validateIndex(index, result.length, true);
    result.splice(index, 0, ...values);
    return result;
  }

  /**
   * Returns whether array index valid.
   * @param {NullableArray<T>} array Array to process.
   * @param {number} index Index to process.
   * @return {boolean} Whether is array index valid.
   */
  static isArrayIndexValid<T>(array: NullableArray<T>, index: number): boolean {
    return index >= 0 && index < (array?.length ?? 0);
  }

  /**
   * Returns whether empty.
   * @param {unknown} array Array to process.
   * @return {boolean} Whether is empty.
   */
  static isEmpty(array: unknown): boolean {
    return array === null || array === undefined || ArrayUtil.getLength(array) === 0;
  }

  /**
   * Returns whether equals.
   * @param {unknown} left Left value to compare.
   * @param {unknown} right Right value to compare.
   * @return {boolean} Whether is equals.
   */
  static isEquals(left: unknown, right: unknown): boolean {
    if (left === null || left === undefined || right === null || right === undefined) {
      return left === right;
    }
    return deepEquals(Array.from(left as ArrayLike<unknown>), Array.from(right as ArrayLike<unknown>));
  }

  /**
   * Returns whether not empty.
   * @param {unknown} array Array to process.
   * @return {boolean} Whether is not empty.
   */
  static isNotEmpty(array: unknown): boolean {
    return !ArrayUtil.isEmpty(array);
  }

  /**
   * Returns whether same length.
   * @param {unknown} left Left value to compare.
   * @param {unknown} right Right value to compare.
   * @return {boolean} Whether is same length.
   */
  static isSameLength(left: unknown, right: unknown): boolean {
    return ArrayUtil.getLength(left) === ArrayUtil.getLength(right);
  }

  /**
   * Returns whether same type.
   * @param {unknown} left Left value to compare.
   * @param {unknown} right Right value to compare.
   * @return {boolean} Whether is same type.
   */
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

  /**
   * Returns whether sorted.
   * @param {NullableArray<T>} array Array to process.
   * @param {(left: T, right: T) => number} comparator Comparator to use.
   * @return {boolean} Whether is sorted.
   */
  static isSorted<T>(array: NullableArray<T>, comparator: (left: T, right: T) => number = numericCompare): boolean {
    const values = toArray(array);
    for (let index = 1; index < values.length; index += 1) {
      if (comparator(values[index - 1], values[index]) > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the last index of.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} value Value to process.
   * @param {number} startIndex Starting index.
   * @param {number} tolerance Tolerance.
   * @return {number} The resulting number.
   */
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

  /**
   * Creates a value using new instance.
   * @param {Function} _componentType Component type.
   * @param {number} length Number of characters or items.
   * @return {T[]} The resulting collection.
   */
  static newInstance<T>(_componentType: Function, length: number): T[] {
    if (length < 0 || !Number.isInteger(length)) {
      throw new RangeError('length must be a non-negative integer');
    }
    return new Array<T>(length);
  }

  /**
   * Performs the null to operation.
   * @param {NullableArray<T>} array Array to process.
   * @param {T[]} defaultArray Array to use when the input is nullish.
   * @return {T[]} The resulting collection.
   */
  static nullTo<T>(array: NullableArray<T>, defaultArray: T[]): T[] {
    return array === null || array === undefined ? defaultArray : toArray(array);
  }

  /**
   * Performs the null to empty operation.
   * @param {NullableArray<T>} array Array to process.
   * @return {T[]} The resulting collection.
   */
  static nullToEmpty<T>(array: NullableArray<T>): T[] {
    return array === null || array === undefined ? [] : toArray(array);
  }

  /**
   * Updates or transforms the value using remove.
   * @param {NullableArray<T>} array Array to process.
   * @param {number} index Index to process.
   * @return {T[] | null} The resulting collection.
   */
  static remove<T>(array: NullableArray<T>, index: number): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const result = toArray(array);
    validateIndex(index, result.length);
    result.splice(index, 1);
    return result;
  }

  /**
   * Updates or transforms the value using remove all.
   * @param {NullableArray<T>} array Array to process.
   * @param {...number} indices Indices.
   * @return {T[] | null} The resulting collection.
   */
  static removeAll<T>(array: NullableArray<T>, ...indices: number[]): T[] | null {
    if (array === null || array === undefined) {
      return null;
    }
    const removed = new Set(indices);
    return toArray(array).filter((_, index) => !removed.has(index));
  }

  /**
   * Updates or transforms the value using remove all occurrences.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} element Element to process.
   * @return {T[] | null} The resulting collection.
   */
  static removeAllOccurrences<T>(array: NullableArray<T>, element: T): T[] | null {
    return array === null || array === undefined ? null : toArray(array).filter((value) => !sameValue(value, element));
  }

  /**
   * Updates or transforms the value using remove all occurences.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} element Element to process.
   * @return {T[] | null} The resulting collection.
   */
  static removeAllOccurences<T>(array: NullableArray<T>, element: T): T[] | null {
    return ArrayUtil.removeAllOccurrences(array, element);
  }

  /**
   * Updates or transforms the value using remove element.
   * @param {NullableArray<T>} array Array to process.
   * @param {T} element Element to process.
   * @return {T[] | null} The resulting collection.
   */
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

  /**
   * Updates or transforms the value using remove elements.
   * @param {NullableArray<T>} array Array to process.
   * @param {...T} elements Elements.
   * @return {T[] | null} The resulting collection.
   */
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

  /**
   * Updates or transforms the value using reverse.
   * @param {T[] | null | undefined} array Array to process.
   * @param {number} startIndex Starting index.
   * @param {unknown} endIndex Exclusive ending index.
   */
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

  /**
   * Updates or transforms the value using set all.
   * @param {T[]} array Array to process.
   * @param {((index: number) => T) | (() => T)} generator Function that generates values.
   * @return {T[]} The resulting collection.
   */
  static setAll<T>(array: T[], generator: ((index: number) => T) | (() => T)): T[] {
    for (let index = 0; index < array.length; index += 1) {
      array[index] = generator.length > 0 ? (generator as (index: number) => T)(index) : (generator as () => T)();
    }
    return array;
  }

  /**
   * Performs the shift operation.
   * @param {T[] | null | undefined} array Array to process.
   * @param {number} offset Offset into the value.
   * @param {number} startIndex Starting index.
   * @param {unknown} endIndex Exclusive ending index.
   */
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

  /**
   * Updates or transforms the value using shuffle.
   * @param {T[] | null | undefined} array Array to process.
   * @param {() => number} random Random number generator.
   */
  static shuffle<T>(array: T[] | null | undefined, random: () => number = Math.random): void {
    if (array === null || array === undefined) {
      return;
    }
    for (let index = array.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [array[index], array[other]] = [array[other], array[index]];
    }
  }

  /**
   * Returns whether starts with.
   * @param {NullableArray<T>} array Array to process.
   * @param {NullableArray<T>} expected Expected array prefix.
   * @return {boolean} Whether starts with.
   */
  static startsWith<T>(array: NullableArray<T>, expected: NullableArray<T>): boolean {
    const source = toArray(array);
    const prefix = toArray(expected);
    return prefix.length <= source.length && prefix.every((value, index) => sameValue(source[index], value));
  }

  /**
   * Performs the subarray operation.
   * @param {NullableArray<T>} array Array to process.
   * @param {number} startIndex Starting index.
   * @param {unknown} endIndex Exclusive ending index.
   * @return {T[]} The resulting collection.
   */
  static subarray<T>(array: NullableArray<T>, startIndex = 0, endIndex = array?.length ?? 0): T[] {
    if (array === null || array === undefined) {
      return [];
    }
    const values = toArray(array);
    return values.slice(Math.max(0, startIndex), Math.max(0, endIndex));
  }

  /**
   * Updates or transforms the value using swap.
   * @param {T[] | null | undefined} array Array to process.
   * @param {number} offset1 Offset1.
   * @param {number} offset2 Offset2.
   * @param {number} length Number of characters or items.
   */
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

  /**
   * Converts the supplied value using to array.
   * @param {...T} items Items.
   * @return {T[]} The resulting collection.
   */
  static toArray<T>(...items: T[]): T[] {
    return [...items];
  }

  /**
   * Converts the supplied value using to map.
   * @param {readonly unknown[] | null | undefined} array Array to process.
   * @return {Map<unknown, unknown>} The resulting collection.
   */
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

  /**
   * Converts the supplied value using to object.
   * @param {readonly (boolean | number | string | null | undefined)[] | null | undefined} array Array to process.
   * @return {Array<boolean | number | string | null> | null} The resulting collection.
   */
  static toObject(
    array: readonly (boolean | number | string | null | undefined)[] | null | undefined,
  ): Array<boolean | number | string | null> | null {
    return array === null || array === undefined ? null : array.map((value) => (value === undefined ? null : value));
  }

  /**
   * Converts the supplied value using to primitive.
   * @param {readonly (T | null | undefined)[] | null | undefined} array Array to process.
   * @param {T} valueForNull Value for null.
   * @return {T[] | null} The resulting collection.
   */
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

  /**
   * Returns the string representation.
   * @param {unknown} array Array to process.
   * @param {string} stringIfNull String to return for nullish input.
   * @return {string} The resulting string.
   */
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

  /**
   * Converts the supplied value using to string array.
   * @param {readonly unknown[] | null | undefined} array Array to process.
   * @param {string} valueForNullElements Value for null elements.
   * @return {string[] | null} The resulting collection.
   */
  static toStringArray(array: readonly unknown[] | null | undefined, valueForNullElements = ''): string[] | null {
    return array === null || array === undefined
      ? null
      : array.map((value) => (value === null || value === undefined ? valueForNullElements : String(value)));
  }
}

export default ArrayUtil;
