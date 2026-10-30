export type EnumSource<T> = readonly T[] | Record<string, T> | { values: () => readonly T[] };

/**
 * Returns whether numeric key.
 * @param {string} key Key.
 * @return {boolean} Whether is numeric key.
 */
function isNumericKey(key: string): boolean {
  return /^\d+$/.test(key);
}

/**
 * Performs the values of operation.
 * @param {EnumSource<T> | null | undefined} source Source to inspect.
 * @return {T[]} The resulting collection.
 */
function valuesOf<T>(source: EnumSource<T> | null | undefined): T[] {
  if (source === null || source === undefined) {
    return [];
  }
  if (Array.isArray(source)) {
    return [...source];
  }
  if (typeof source === 'object') {
    const candidate = source as { values?: unknown };
    if (typeof candidate.values === 'function') {
      return [...(candidate.values as () => readonly T[])()];
    }
  }
  const entries = Object.entries(source as Record<string, T>);
  const hasNumericReverseMapping = entries.some(([key, value]) => isNumericKey(key) && typeof value === 'string');
  return entries.filter(([key]) => !hasNumericReverseMapping || !isNumericKey(key)).map(([, value]) => value);
}

/**
 * Performs the names and values operation.
 * @param {EnumSource<T> | null | undefined} source Source to inspect.
 * @return {Array<{ name: string; value: T }>} The resulting collection.
 */
function namesAndValues<T>(source: EnumSource<T> | null | undefined): Array<{ name: string; value: T }> {
  if (source === null || source === undefined) {
    return [];
  }
  if (Array.isArray(source)) {
    return source.map((value) => ({ name: String(value), value }));
  }
  if (typeof source === 'object') {
    const candidate = source as { values?: unknown };
    if (typeof candidate.values === 'function') {
      return (candidate.values as () => readonly T[])().map((value) => ({ name: String(value), value }));
    }
  }
  const entries = Object.entries(source as Record<string, T>);
  const hasNumericReverseMapping = entries.some(([key, value]) => isNumericKey(key) && typeof value === 'string');
  return entries
    .filter(([key]) => !hasNumericReverseMapping || !isNumericKey(key))
    .map(([name, value]) => ({ name, value }));
}

/**
 * Performs the values argument operation.
 * @param {unknown[]} values Values to process.
 * @return {T[]} The resulting collection.
 */
function valuesArgument<T>(values: unknown[]): T[] {
  if (
    values.length === 1 &&
    values[0] !== null &&
    typeof values[0] === 'object' &&
    Symbol.iterator in (values[0] as object)
  ) {
    return [...(values[0] as Iterable<T>)];
  }
  return values as T[];
}

/**
 * Performs the bit is set operation.
 * @param {number} value Value to process.
 * @param {number} bit Bit position to inspect.
 * @return {boolean} Whether bit is set.
 */
function bitIsSet(value: number, bit: number): boolean {
  return Math.floor(value / 2 ** bit) % 2 !== 0;
}

/** Apache Commons Lang inspired enum utilities. */
class EnumUtil {
  /**
   * Performs the generate bit vector operation.
   * @param {EnumSource<T>} source Source to inspect.
   * @param {...T} values Values to process.
   * @return {number} The resulting number.
   */
  static generateBitVector<T>(source: EnumSource<T>, ...values: T[]): number {
    const members = valuesOf(source);
    if (members.length > 64) {
      throw new Error('enum has more than 64 values');
    }
    const selected = valuesArgument<T>(values);
    let result = 0;
    for (const value of selected) {
      const ordinal = members.indexOf(value);
      if (ordinal < 0) {
        throw new Error('value is not a member of the enum');
      }
      result += 2 ** ordinal;
    }
    return result;
  }

  /**
   * Performs the generate bit vectors operation.
   * @param {EnumSource<T>} source Source to inspect.
   * @param {...T} values Values to process.
   * @return {number[]} The resulting collection.
   */
  static generateBitVectors<T>(source: EnumSource<T>, ...values: T[]): number[] {
    const members = valuesOf(source);
    const selected = valuesArgument<T>(values);
    const blockCount = Math.max(1, Math.ceil(members.length / 32));
    const result = new Array<number>(blockCount).fill(0);
    for (const value of selected) {
      const ordinal = members.indexOf(value);
      if (ordinal < 0) {
        throw new Error('value is not a member of the enum');
      }
      const block = Math.floor(ordinal / 32);
      result[block] += 2 ** (ordinal % 32);
    }
    return result.reverse();
  }

  /**
   * Returns the get enum.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @param {string | null | undefined} name Name to process.
   * @param {T | null} defaultValue Value to use when the input is nullish.
   * @return {T | null} The resulting value.
   */
  static getEnum<T>(
    source: EnumSource<T> | null | undefined,
    name: string | null | undefined,
    defaultValue: T | null = null,
  ): T | null {
    if (source === null || source === undefined || name === null || name === undefined) {
      return defaultValue;
    }
    return namesAndValues(source).find((entry) => entry.name === name)?.value ?? defaultValue;
  }

  /**
   * Returns the get enum ignore case.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @param {string | null | undefined} name Name to process.
   * @param {T | null} defaultValue Value to use when the input is nullish.
   * @return {T | null} The resulting value.
   */
  static getEnumIgnoreCase<T>(
    source: EnumSource<T> | null | undefined,
    name: string | null | undefined,
    defaultValue: T | null = null,
  ): T | null {
    if (source === null || source === undefined || name === null || name === undefined) {
      return defaultValue;
    }
    const lowerName = name.toLocaleLowerCase();
    return namesAndValues(source).find((entry) => entry.name.toLocaleLowerCase() === lowerName)?.value ?? defaultValue;
  }

  /**
   * Returns the get enum list.
   * @param {EnumSource<T>} source Source to inspect.
   * @return {T[]} The resulting collection.
   */
  static getEnumList<T>(source: EnumSource<T>): T[] {
    return valuesOf(source);
  }

  static getEnumMap<T>(source: EnumSource<T>): Map<string, T>;
  static getEnumMap<T, K>(source: EnumSource<T>, keyFunction: (value: T) => K): Map<K, T>;
  /**
   * Returns the get enum map.
   * @param {EnumSource<T>} source Source to inspect.
   * @param {(value: T) => K} keyFunction Function that produces map keys.
   * @return {Map<string | K, T>} The resulting collection.
   */
  static getEnumMap<T, K>(source: EnumSource<T>, keyFunction?: (value: T) => K): Map<string | K, T> {
    const result = new Map<string | K, T>();
    for (const entry of namesAndValues(source)) {
      const key = keyFunction ? keyFunction(entry.value) : entry.name;
      result.set(key, entry.value);
    }
    return result;
  }

  /**
   * Returns the get enum system property.
   * @param {EnumSource<T>} source Source to inspect.
   * @param {string | null | undefined} propertyName Property name.
   * @param {T | null} defaultValue Value to use when the input is nullish.
   * @return {T | null} The resulting value.
   */
  static getEnumSystemProperty<T>(
    source: EnumSource<T>,
    propertyName: string | null | undefined,
    defaultValue: T | null = null,
  ): T | null {
    const propertyValue =
      propertyName === null || propertyName === undefined ? undefined : globalThis.process?.env[propertyName];
    return EnumUtil.getEnum(source, propertyValue, defaultValue);
  }

  /**
   * Returns the get first enum.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @param {number} value Value to process.
   * @param {(entry: T) => number} valueFunction Value function.
   * @param {T | null} defaultValue Value to use when the input is nullish.
   * @return {T | null} The resulting value.
   */
  static getFirstEnum<T>(
    source: EnumSource<T> | null | undefined,
    value: number,
    valueFunction: (entry: T) => number,
    defaultValue: T | null = null,
  ): T | null {
    return valuesOf(source).find((entry) => valueFunction(entry) === value) ?? defaultValue;
  }

  /**
   * Returns the get first enum ignore case.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @param {string | null | undefined} name Name to process.
   * @param {(entry: T) => string} stringFunction String function.
   * @param {T | null} defaultValue Value to use when the input is nullish.
   * @return {T | null} The resulting value.
   */
  static getFirstEnumIgnoreCase<T>(
    source: EnumSource<T> | null | undefined,
    name: string | null | undefined,
    stringFunction: (entry: T) => string,
    defaultValue: T | null = null,
  ): T | null {
    if (name === null || name === undefined) {
      return defaultValue;
    }
    const lowerName = name.toLocaleLowerCase();
    return valuesOf(source).find((entry) => stringFunction(entry).toLocaleLowerCase() === lowerName) ?? defaultValue;
  }

  /**
   * Returns whether valid enum.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @param {string | null | undefined} name Name to process.
   * @return {boolean} Whether is valid enum.
   */
  static isValidEnum<T>(source: EnumSource<T> | null | undefined, name: string | null | undefined): boolean {
    return EnumUtil.getEnum(source, name) !== null;
  }

  /**
   * Returns whether valid enum ignore case.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @param {string | null | undefined} name Name to process.
   * @return {boolean} Whether is valid enum ignore case.
   */
  static isValidEnumIgnoreCase<T>(source: EnumSource<T> | null | undefined, name: string | null | undefined): boolean {
    return EnumUtil.getEnumIgnoreCase(source, name) !== null;
  }

  /**
   * Performs the process bit vector operation.
   * @param {EnumSource<T>} source Source to inspect.
   * @param {number} value Value to process.
   * @return {T[]} The resulting collection.
   */
  static processBitVector<T>(source: EnumSource<T>, value: number): T[] {
    return valuesOf(source).filter((_, ordinal) => bitIsSet(value, ordinal));
  }

  /**
   * Performs the process bit vectors operation.
   * @param {EnumSource<T>} source Source to inspect.
   * @param {...number} values Values to process.
   * @return {T[]} The resulting collection.
   */
  static processBitVectors<T>(source: EnumSource<T>, ...values: number[]): T[] {
    const blocks =
      values.length === 1 && Array.isArray(values[0])
        ? [...(values[0] as unknown as number[])].reverse()
        : [...values].reverse();
    return valuesOf(source).filter((_, ordinal) => {
      const block = Math.floor(ordinal / 32);
      return block < blocks.length && bitIsSet(blocks[block], ordinal % 32);
    });
  }

  /**
   * Performs the stream operation.
   * @param {EnumSource<T> | null | undefined} source Source to inspect.
   * @return {T[]} The resulting collection.
   */
  static stream<T>(source: EnumSource<T> | null | undefined): T[] {
    return valuesOf(source);
  }
}

export default EnumUtil;
