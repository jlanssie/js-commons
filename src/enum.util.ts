export type EnumSource<T> = readonly T[] | Record<string, T> | { values: () => readonly T[] };

function isNumericKey(key: string): boolean {
  return /^\d+$/.test(key);
}

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

function bitIsSet(value: number, bit: number): boolean {
  return Math.floor(value / 2 ** bit) % 2 !== 0;
}

/** Apache Commons Lang inspired enum utilities. */
class EnumUtil {
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

  static getEnumList<T>(source: EnumSource<T>): T[] {
    return valuesOf(source);
  }

  static getEnumMap<T>(source: EnumSource<T>): Map<string, T>;
  static getEnumMap<T, K>(source: EnumSource<T>, keyFunction: (value: T) => K): Map<K, T>;
  static getEnumMap<T, K>(source: EnumSource<T>, keyFunction?: (value: T) => K): Map<string | K, T> {
    const result = new Map<string | K, T>();
    for (const entry of namesAndValues(source)) {
      const key = keyFunction ? keyFunction(entry.value) : entry.name;
      result.set(key, entry.value);
    }
    return result;
  }

  static getEnumSystemProperty<T>(
    source: EnumSource<T>,
    propertyName: string | null | undefined,
    defaultValue: T | null = null,
  ): T | null {
    const propertyValue =
      propertyName === null || propertyName === undefined ? undefined : globalThis.process?.env[propertyName];
    return EnumUtil.getEnum(source, propertyValue, defaultValue);
  }

  static getFirstEnum<T>(
    source: EnumSource<T> | null | undefined,
    value: number,
    valueFunction: (entry: T) => number,
    defaultValue: T | null = null,
  ): T | null {
    return valuesOf(source).find((entry) => valueFunction(entry) === value) ?? defaultValue;
  }

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

  static isValidEnum<T>(source: EnumSource<T> | null | undefined, name: string | null | undefined): boolean {
    return EnumUtil.getEnum(source, name) !== null;
  }

  static isValidEnumIgnoreCase<T>(source: EnumSource<T> | null | undefined, name: string | null | undefined): boolean {
    return EnumUtil.getEnumIgnoreCase(source, name) !== null;
  }

  static processBitVector<T>(source: EnumSource<T>, value: number): T[] {
    return valuesOf(source).filter((_, ordinal) => bitIsSet(value, ordinal));
  }

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

  static stream<T>(source: EnumSource<T> | null | undefined): T[] {
    return valuesOf(source);
  }
}

export default EnumUtil;
