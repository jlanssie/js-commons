type Nullable<T> = T | null | undefined;

const objectIds = new WeakMap<object, number>();
let nextObjectId = 1;

/**
 * Returns whether nil.
 * @param {unknown} value Value to process.
 * @return {boolean} Whether is nil.
 */
function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Performs the object id operation.
 * @param {object} value Value to process.
 * @return {number} The resulting number.
 */
function objectId(value: object): number {
  const current = objectIds.get(value);
  if (current !== undefined) {
    return current;
  }
  const id = nextObjectId++;
  objectIds.set(value, id);
  return id;
}

/**
 * Performs the string hash operation.
 * @param {string} value Value to process.
 * @return {number} The resulting number.
 */
function stringHash(value: string): number {
  let hash = 0;
  for (const character of value) {
    hash = Math.imul(31, hash) + character.codePointAt(0)!;
  }
  return hash | 0;
}

/**
 * Returns the hash value for the object.
 * @param {unknown} value Value to process.
 * @return {number} The resulting number.
 */
function hashValue(value: unknown): number {
  if (isNil(value)) {
    return 0;
  }
  if (typeof value === 'string') {
    return stringHash(value);
  }
  if (typeof value === 'boolean') {
    return value ? 1231 : 1237;
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return 0x7ff80000;
    }
    if (!Number.isFinite(value)) {
      return value > 0 ? 0x7ff00000 : 0xfff00000;
    }
    return (value | 0) === value ? value | 0 : stringHash(String(value));
  }
  if (typeof value === 'bigint') {
    return stringHash(value.toString());
  }
  if (typeof value === 'symbol') {
    return stringHash(value.toString());
  }
  if (typeof value === 'function') {
    return objectId(value);
  }
  return objectId(value);
}

/**
 * Performs the compare values operation.
 * @param {unknown} left Left value to compare.
 * @param {unknown} right Right value to compare.
 * @return {number} The resulting number.
 */
function compareValues(left: unknown, right: unknown): number {
  if (isNil(left)) {
    return isNil(right) ? 0 : -1;
  }
  if (isNil(right)) {
    return 1;
  }
  if (left === right || Object.is(left, right)) {
    return 0;
  }
  if (typeof left === 'number' && typeof right === 'number') {
    return left < right ? -1 : 1;
  }
  if (typeof left === 'string' && typeof right === 'string') {
    return left < right ? -1 : 1;
  }
  const leftValue = String(left);
  const rightValue = String(right);
  return leftValue < rightValue ? -1 : 1;
}

/**
 * Returns whether empty value.
 * @param {unknown} value Value to process.
 * @return {boolean} Whether is empty value.
 */
function isEmptyValue(value: unknown): boolean {
  if (isNil(value)) {
    return true;
  }
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }
  if (ArrayBuffer.isView(value)) {
    return value.byteLength === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  if (typeof value === 'object') {
    const candidate = value as { length?: unknown; size?: unknown; isEmpty?: unknown };
    if (typeof candidate.isEmpty === 'function') {
      return (candidate.isEmpty as () => boolean)();
    }
    if (typeof candidate.length === 'number') {
      return candidate.length === 0;
    }
    if (typeof candidate.size === 'number') {
      return candidate.size === 0;
    }
  }
  return false;
}

/**
 * Creates a value using clone value.
 * @param {T} value Value to process.
 * @return {T | null} The resulting value.
 */
function cloneValue<T>(value: T): T | null {
  if (isNil(value)) {
    return null;
  }
  if (Array.isArray(value)) {
    return value.slice() as T;
  }
  if (ArrayBuffer.isView(value)) {
    return (value as { slice?: () => unknown }).slice?.() as T;
  }
  if (typeof value === 'object') {
    const cloneMethod = (value as { clone?: unknown }).clone;
    if (typeof cloneMethod === 'function') {
      return (cloneMethod as () => T).call(value);
    }
    const globalClone = globalThis.structuredClone;
    if (typeof globalClone === 'function') {
      try {
        return globalClone(value);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Performs the class name operation.
 * @param {object} value Value to process.
 * @return {string} The resulting string.
 */
function className(value: object): string {
  const constructor = (value as { constructor?: { name?: string } }).constructor;
  return constructor?.name || 'Object';
}

/** Apache Commons Lang inspired object utilities. */
class ObjectUtil {
  /** A stable sentinel corresponding to Apache Commons Lang's `NULL`. */
  static readonly NULL = Object.freeze({ toString: () => 'null' });

  /**
   * Returns whether all not null.
   * @param {...unknown} values Values to process.
   * @return {boolean} Whether all not null.
   */
  static allNotNull(...values: unknown[]): boolean {
    return values.every((value) => !isNil(value));
  }

  /**
   * Returns whether all null.
   * @param {...unknown} values Values to process.
   * @return {boolean} Whether all null.
   */
  static allNull(...values: unknown[]): boolean {
    return values.every((value) => isNil(value));
  }

  /**
   * Returns whether any not null.
   * @param {...unknown} values Values to process.
   * @return {boolean} Whether any not null.
   */
  static anyNotNull(...values: unknown[]): boolean {
    return values.some((value) => !isNil(value));
  }

  /**
   * Returns whether any null.
   * @param {...unknown} values Values to process.
   * @return {boolean} Whether any null.
   */
  static anyNull(...values: unknown[]): boolean {
    return values.some((value) => isNil(value));
  }

  /**
   * Creates a value using clone.
   * @param {T} value Value to process.
   * @return {T | null} The resulting value.
   */
  static clone<T>(value: T): T | null {
    return cloneValue(value);
  }

  /**
   * Creates a value using clone if possible.
   * @param {T} value Value to process.
   * @return {T | null} The resulting value.
   */
  static cloneIfPossible<T>(value: T): T | null {
    const clone = cloneValue(value);
    return clone === null ? value : clone;
  }

  /**
   * Performs the compare operation.
   * @param {Nullable<T>} left Left value to compare.
   * @param {Nullable<T>} right Right value to compare.
   * @param {boolean} nullGreater Whether null values sort after non-null values.
   * @return {number} The resulting number.
   */
  static compare<T>(left: Nullable<T>, right: Nullable<T>, nullGreater = false): number {
    if (isNil(left)) {
      return isNil(right) ? 0 : nullGreater ? 1 : -1;
    }
    if (isNil(right)) {
      return nullGreater ? -1 : 1;
    }
    return compareValues(left, right);
  }

  static CONST(value: boolean): boolean;
  static CONST(value: number): number;
  static CONST<T>(value: T): T;
  /**
   * Performs the const operation.
   * @param {T} value Value to process.
   * @return {T} The resulting value.
   */
  static CONST<T>(value: T): T {
    return value;
  }

  /**
   * Performs the const_byte operation.
   * @param {number} value Value to process.
   * @return {number} The resulting number.
   */
  static CONST_BYTE(value: number): number {
    return value;
  }

  /**
   * Performs the const_short operation.
   * @param {number} value Value to process.
   * @return {number} The resulting number.
   */
  static CONST_SHORT(value: number): number {
    return value;
  }

  /**
   * Performs the default if null operation.
   * @param {Nullable<T>} value Value to process.
   * @param {T} defaultValue Value to use when the input is nullish.
   * @return {T | null | undefined} The resulting value.
   */
  static defaultIfNull<T>(value: Nullable<T>, defaultValue: T): T | null | undefined {
    return isNil(value) ? defaultValue : value;
  }

  /**
   * Returns whether equals.
   * @param {unknown} left Left value to compare.
   * @param {unknown} right Right value to compare.
   * @return {boolean} Whether equals.
   */
  static equals(left: unknown, right: unknown): boolean {
    return left === right || Object.is(left, right);
  }

  /**
   * Returns the first non null.
   * @param {...Nullable<T>} values Values to process.
   * @return {T | null | undefined} The resulting value.
   */
  static firstNonNull<T>(...values: Nullable<T>[]): T | null | undefined {
    return values.find((value) => !isNil(value));
  }

  /**
   * Returns the get class.
   * @param {Nullable<T>} value Value to process.
   * @return {Function | null} The resulting value.
   */
  static getClass<T>(value: Nullable<T>): Function | null {
    if (isNil(value)) {
      return null;
    }
    if (typeof value === 'function') {
      return value;
    }
    return (value as { constructor: Function }).constructor;
  }

  /**
   * Returns the get first non null.
   * @param {...(() => Nullable<T>) | null | undefined} suppliers Suppliers.
   * @return {T | null | undefined} The resulting value.
   */
  static getFirstNonNull<T>(...suppliers: Array<(() => Nullable<T>) | null | undefined>): T | null | undefined {
    for (const supplier of suppliers) {
      if (typeof supplier === 'function') {
        const value = supplier();
        if (!isNil(value)) {
          return value;
        }
      }
    }
    return null;
  }

  static getIfNull<T>(value: Nullable<T>, defaultValue: T): T | null | undefined;
  static getIfNull<T>(value: Nullable<T>, defaultSupplier: () => T): T | null | undefined;
  /**
   * Returns the get if null.
   * @param {Nullable<T>} value Value to process.
   * @param {T | (() => T)} defaultValue Value to use when the input is nullish.
   * @return {T | null | undefined} The resulting value.
   */
  static getIfNull<T>(value: Nullable<T>, defaultValue: T | (() => T)): T | null | undefined {
    if (!isNil(value)) {
      return value;
    }
    return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
  }

  /**
   * Returns the hash code for the value.
   * @param {unknown} value Value to process.
   * @return {number} The resulting number.
   */
  static hashCode(value: unknown): number {
    return hashValue(value);
  }

  /**
   * Returns the hash code as a hexadecimal string.
   * @param {unknown} value Value to process.
   * @return {string} The resulting string.
   */
  static hashCodeHex(value: unknown): string {
    return (hashValue(value) >>> 0).toString(16);
  }

  /**
   * Returns a hash code computed from multiple values.
   * @param {...unknown} values Values to process.
   * @return {number} The resulting number.
   */
  static hashCodeMulti(...values: unknown[]): number {
    return values.reduce<number>((hash, value) => (Math.imul(31, hash) + hashValue(value)) | 0, 1);
  }

  /**
   * Performs the identity hash code hex operation.
   * @param {object | null | undefined} value Value to process.
   * @return {string | null} The resulting string.
   */
  static identityHashCodeHex(value: object | null | undefined): string | null {
    return isNil(value) ? null : (objectId(value) >>> 0).toString(16);
  }

  /**
   * Performs the identity to string operation.
   * @param {object | null | undefined} value Value to process.
   * @return {string | null} The resulting string.
   */
  static identityToString(value: object | null | undefined): string | null {
    if (isNil(value)) {
      return null;
    }
    return `${className(value)}@${ObjectUtil.identityHashCodeHex(value)}`;
  }

  /** Appends an identity string to a mutable string builder or callback.
   * @param {object} value Value to process.
   * @param {{ append(value: string): unknown } | ((value: string) => unknown)} builder Builder.
   */
  static appendIdentityToString(
    builder: { append(value: string): unknown } | ((value: string) => unknown),
    value: object,
  ): void {
    const identity = ObjectUtil.identityToString(value);
    if (identity === null) {
      throw new TypeError('value must not be null');
    }
    if (typeof builder === 'function') {
      builder(identity);
    } else {
      builder.append(identity);
    }
  }

  /**
   * Returns whether array.
   * @param {unknown} value Value to process.
   * @return {boolean} Whether is array.
   */
  static isArray(value: unknown): boolean {
    return Array.isArray(value) || ArrayBuffer.isView(value);
  }

  /**
   * Returns whether empty.
   * @param {unknown} value Value to process.
   * @return {boolean} Whether is empty.
   */
  static isEmpty(value: unknown): boolean {
    return isEmptyValue(value);
  }

  /**
   * Returns whether not empty.
   * @param {unknown} value Value to process.
   * @return {boolean} Whether is not empty.
   */
  static isNotEmpty(value: unknown): boolean {
    return !isEmptyValue(value);
  }

  /**
   * Returns the max.
   * @param {...Nullable<T>} values Values to process.
   * @return {T | null | undefined} The resulting value.
   */
  static max<T>(...values: Nullable<T>[]): T | null | undefined {
    let result: T | null | undefined;
    for (const value of values) {
      if (!isNil(value) && (isNil(result) || compareValues(value, result) > 0)) {
        result = value;
      }
    }
    return result;
  }

  static median<T>(...items: T[]): T;
  static median<T>(comparator: (left: T, right: T) => number, ...items: T[]): T;
  /**
   * Returns the median.
   * @param {T | ((left: T, right: T) => number)} first First value to process.
   * @param {...T} remaining Remaining.
   * @return {T} The resulting value.
   */
  static median<T>(first: T | ((left: T, right: T) => number), ...remaining: T[]): T {
    const comparator = typeof first === 'function' ? (first as (left: T, right: T) => number) : compareValues;
    const items = typeof first === 'function' ? remaining : [first as T, ...remaining];
    if (items.length === 0 || items.some((item) => isNil(item))) {
      throw new TypeError('items must be non-empty and contain no null values');
    }
    return items.slice().sort(comparator)[Math.floor((items.length - 1) / 2)];
  }

  /**
   * Returns the median by.
   * @param {(left: T, right: T) => number} comparator Comparator to use.
   * @param {...T} items Items.
   * @return {T} The resulting value.
   */
  static medianBy<T>(comparator: (left: T, right: T) => number, ...items: T[]): T {
    if (typeof comparator !== 'function') {
      throw new TypeError('comparator must be a function');
    }
    if (items.length === 0 || items.some((item) => isNil(item))) {
      throw new TypeError('items must be non-empty and contain no null values');
    }
    return items.slice().sort(comparator)[Math.floor((items.length - 1) / 2)];
  }

  /**
   * Returns the min.
   * @param {...Nullable<T>} values Values to process.
   * @return {T | null | undefined} The resulting value.
   */
  static min<T>(...values: Nullable<T>[]): T | null | undefined {
    let result: T | null | undefined;
    for (const value of values) {
      if (!isNil(value) && (isNil(result) || compareValues(value, result) < 0)) {
        result = value;
      }
    }
    return result;
  }

  /**
   * Returns the mode.
   * @param {...T} items Items.
   * @return {T | null} The resulting value.
   */
  static mode<T>(...items: T[]): T | null {
    if (items.length === 0) {
      return null;
    }
    const counts = new Map<T, number>();
    let best: T | null = null;
    let bestCount = 1;
    let tied = false;
    for (const item of items) {
      const count = (counts.get(item) ?? 0) + 1;
      counts.set(item, count);
      if (count > bestCount) {
        best = item;
        bestCount = count;
        tied = false;
      } else if (count === bestCount && best !== item) {
        tied = true;
      }
    }
    return tied ? null : best;
  }

  /**
   * Performs the not equal operation.
   * @param {unknown} left Left value to compare.
   * @param {unknown} right Right value to compare.
   * @return {boolean} Whether not equal.
   */
  static notEqual(left: unknown, right: unknown): boolean {
    return !ObjectUtil.equals(left, right);
  }

  /**
   * Performs the require non empty operation.
   * @param {T} value Value to process.
   * @param {string} message Message.
   * @return {T} The resulting value.
   */
  static requireNonEmpty<T>(value: T, message = 'object'): T {
    if (isNil(value)) {
      throw new TypeError(message);
    }
    if (isEmptyValue(value)) {
      throw new Error(message);
    }
    return value;
  }

  static toString(value: unknown, nullString?: string): string;
  static toString(valueSupplier: () => unknown, nullSupplier: () => string): string;
  /**
   * Returns the string representation.
   * @param {unknown} value Value to process.
   * @param {string | (() => string)} nullString String to return for nullish input.
   * @return {string} The resulting string.
   */
  static toString(value: unknown, nullString: string | (() => string) = ''): string {
    if (typeof value === 'function' && typeof nullString === 'function') {
      const supplied = (value as () => unknown)();
      return isNil(supplied) ? nullString() : String(supplied);
    }
    return isNil(value) ? (typeof nullString === 'function' ? nullString() : nullString) : String(value);
  }

  /**
   * Converts the supplied value using to string with supplier.
   * @param {T} value Value to process.
   * @param {() => string} supplier Function that supplies a value.
   * @return {string} The resulting string.
   */
  static toStringWithSupplier<T>(value: T, supplier: () => string): string {
    return isNil(value) ? supplier() : String(value);
  }

  /**
   * Waits for the specified duration.
   * @param {object} _value Value.
   * @param {number | { milliseconds: number }} duration Duration to wait.
   * @return {Promise<void>} The resulting value.
   */
  static wait(_value: object, duration: number | { milliseconds: number }): Promise<void> {
    const milliseconds = typeof duration === 'number' ? duration : duration.milliseconds;
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, Math.max(0, milliseconds));
    });
  }
}

export default ObjectUtil;
