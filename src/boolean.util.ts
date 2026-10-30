type NullableBoolean = boolean | null | undefined;

/**
 * Returns whether true.
 * @param {unknown} value Value to process.
 * @return {boolean} Whether is true.
 */
function isTrue(value: unknown): value is true {
  return value === true;
}

/**
 * Returns whether false.
 * @param {unknown} value Value to process.
 * @return {boolean} Whether is false.
 */
function isFalse(value: unknown): value is false {
  return value === false;
}

/**
 * Performs the require values operation.
 * @param {unknown[]} values Values to process.
 */
function requireValues(values: unknown[]): void {
  if (values.length === 0) {
    throw new Error('array must not be empty');
  }
}

/**
 * Performs the flatten values operation.
 * @param {NullableBoolean[]} values Values to process.
 * @return {NullableBoolean[]} The resulting collection.
 */
function flattenValues(values: NullableBoolean[]): NullableBoolean[] {
  return values.length === 1 && Array.isArray(values[0]) ? (values[0] as unknown as NullableBoolean[]) : values;
}

/**
 * Performs the boolean from string operation.
 * @param {string | null | undefined} value Value to process.
 * @return {boolean | null} The resulting value.
 */
function booleanFromString(value: string | null | undefined): boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  switch (value.toLowerCase()) {
    case 'true':
    case 'on':
    case 'yes':
    case 'y':
    case 't':
    case '1':
      return true;
    case 'false':
    case 'off':
    case 'no':
    case 'n':
    case 'f':
    case '0':
      return false;
    default:
      return null;
  }
}

/** Apache Commons Lang inspired boolean utilities. */
class BooleanUtil {
  static readonly FALSE = 'false';
  static readonly NO = 'no';
  static readonly OFF = 'off';
  static readonly ON = 'on';
  static readonly TRUE = 'true';
  static readonly YES = 'yes';

  /**
   * Performs the and operation.
   * @param {...NullableBoolean} values Values to process.
   * @return {boolean} Whether and.
   */
  static and(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.every((value) => isTrue(value));
  }

  /**
   * Performs the boolean values operation.
   * @return {boolean[]} The resulting collection.
   */
  static booleanValues(): boolean[] {
    return [false, true];
  }

  /**
   * Performs the compare operation.
   * @param {boolean} left Left value to compare.
   * @param {boolean} right Right value to compare.
   * @return {number} The resulting number.
   */
  static compare(left: boolean, right: boolean): number {
    return left === right ? 0 : left ? 1 : -1;
  }

  /**
   * Performs the for each operation.
   * @param {(value: boolean) => void} action Action to perform.
   */
  static forEach(action: (value: boolean) => void): void {
    BooleanUtil.values().forEach(action);
  }

  /**
   * Returns whether false.
   * @param {NullableBoolean} value Value to process.
   * @return {boolean} Whether is false.
   */
  static isFalse(value: NullableBoolean): boolean {
    return isFalse(value);
  }

  /**
   * Returns whether not false.
   * @param {NullableBoolean} value Value to process.
   * @return {boolean} Whether is not false.
   */
  static isNotFalse(value: NullableBoolean): boolean {
    return !BooleanUtil.isFalse(value);
  }

  /**
   * Returns whether not true.
   * @param {NullableBoolean} value Value to process.
   * @return {boolean} Whether is not true.
   */
  static isNotTrue(value: NullableBoolean): boolean {
    return !BooleanUtil.isTrue(value);
  }

  /**
   * Returns whether true.
   * @param {NullableBoolean} value Value to process.
   * @return {boolean} Whether is true.
   */
  static isTrue(value: NullableBoolean): boolean {
    return isTrue(value);
  }

  /**
   * Performs the negate operation.
   * @param {NullableBoolean} value Value to process.
   * @return {boolean | null} The resulting value.
   */
  static negate(value: NullableBoolean): boolean | null {
    return value === null || value === undefined ? null : !value;
  }

  /**
   * Returns whether one hot.
   * @param {...NullableBoolean} values Values to process.
   * @return {boolean} Whether one hot.
   */
  static oneHot(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.filter((value) => value === true).length === 1;
  }

  /**
   * Performs the or operation.
   * @param {...NullableBoolean} values Values to process.
   * @return {boolean} Whether or.
   */
  static or(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.some((value) => value === true);
  }

  /**
   * Performs the primitive values operation.
   * @return {boolean[]} The resulting collection.
   */
  static primitiveValues(): boolean[] {
    return [false, true];
  }

  static toBoolean(value: NullableBoolean): boolean;
  static toBoolean(value: number): boolean;
  static toBoolean(value: string | null | undefined): boolean;
  static toBoolean(value: unknown, trueValue: unknown, falseValue: unknown): boolean;
  /**
   * Converts the supplied value using to boolean.
   * @param {unknown} value Value to process.
   * @param {unknown} trueValue Value representing true.
   * @param {unknown} falseValue Value representing false.
   * @return {boolean} Whether to boolean.
   */
  static toBoolean(value: unknown, trueValue?: unknown, falseValue?: unknown): boolean {
    if (arguments.length >= 3) {
      if (value === trueValue) {
        return true;
      }
      if (value === falseValue) {
        return false;
      }
      throw new Error('value did not match either specified value');
    }
    if (typeof value === 'string' || value === null || value === undefined) {
      return booleanFromString(value) === true;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return value === true;
  }

  /**
   * Converts the supplied value using to boolean default if null.
   * @param {NullableBoolean} value Value to process.
   * @param {boolean} valueIfNull Value to return for nullish input.
   * @return {boolean} Whether to boolean default if null.
   */
  static toBooleanDefaultIfNull(value: NullableBoolean, valueIfNull: boolean): boolean {
    return value === null || value === undefined ? valueIfNull : value;
  }

  static toBooleanObject(value: number): boolean;
  static toBooleanObject(
    value: number | null | undefined,
    trueValue: number,
    falseValue: number,
    nullValue: number,
  ): boolean | null;
  static toBooleanObject(value: string | null | undefined): boolean | null;
  /**
   * Converts the supplied value using to boolean object.
   * @param {unknown} value Value to process.
   * @param {unknown} trueValue Value representing true.
   * @param {unknown} falseValue Value representing false.
   * @param {unknown} nullValue Value representing null.
   * @return {boolean | null} The resulting value.
   */
  static toBooleanObject(value: unknown, trueValue?: unknown, falseValue?: unknown, nullValue?: unknown): boolean | null {
    if (arguments.length >= 4) {
      if (value === trueValue) {
        return true;
      }
      if (value === falseValue) {
        return false;
      }
      if (value === nullValue) {
        return null;
      }
      throw new Error('value did not match any specified value');
    }
    if (typeof value === 'string' || value === null || value === undefined) {
      return booleanFromString(value);
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return value === true ? true : value === false ? false : null;
  }

  /**
   * Converts the supplied value using to boolean object with values.
   * @param {unknown} value Value to process.
   * @param {unknown} trueValue Value representing true.
   * @param {unknown} falseValue Value representing false.
   * @param {unknown} nullValue Value representing null.
   * @return {boolean | null} The resulting value.
   */
  static toBooleanObjectWithValues(
    value: unknown,
    trueValue: unknown,
    falseValue: unknown,
    nullValue: unknown,
  ): boolean | null {
    if (value === trueValue) {
      return true;
    }
    if (value === falseValue) {
      return false;
    }
    if (value === nullValue) {
      return null;
    }
    throw new Error('value did not match any specified value');
  }

  static toInteger(value: boolean, trueValue?: number, falseValue?: number): number;
  static toInteger(value: NullableBoolean, trueValue: number, falseValue: number, nullValue: number): number;
  /**
   * Converts the supplied value using to integer.
   * @param {NullableBoolean} value Value to process.
   * @param {number} trueValue Value representing true.
   * @param {number} falseValue Value representing false.
   * @param {number} nullValue Value representing null.
   * @return {number} The resulting number.
   */
  static toInteger(value: NullableBoolean, trueValue = 1, falseValue = 0, nullValue = 0): number {
    return value === null || value === undefined ? nullValue : value ? trueValue : falseValue;
  }

  static toIntegerObject(value: boolean, trueValue?: number, falseValue?: number): number;
  static toIntegerObject(value: NullableBoolean, trueValue: number, falseValue: number, nullValue: number): number | null;
  /**
   * Converts the supplied value using to integer object.
   * @param {NullableBoolean} value Value to process.
   * @param {number} trueValue Value representing true.
   * @param {number} falseValue Value representing false.
   * @param {number | null} nullValue Value representing null.
   * @return {number | null} The resulting value.
   */
  static toIntegerObject(
    value: NullableBoolean,
    trueValue = 1,
    falseValue = 0,
    nullValue: number | null = null,
  ): number | null {
    return value === null || value === undefined ? nullValue : value ? trueValue : falseValue;
  }

  static toString(value: boolean, trueString: string | null, falseString: string | null): string | null;
  static toString(
    value: NullableBoolean,
    trueString: string | null,
    falseString: string | null,
    nullString: string | null,
  ): string | null;
  /**
   * Returns the string representation.
   * @param {NullableBoolean} value Value to process.
   * @param {string | null} trueString True string.
   * @param {string | null} falseString False string.
   * @param {string | null} nullString String to return for nullish input.
   * @return {string | null} The resulting string.
   */
  static toString(
    value: NullableBoolean,
    trueString: string | null,
    falseString: string | null,
    nullString: string | null = null,
  ): string | null {
    return value === null || value === undefined ? nullString : value ? trueString : falseString;
  }

  static toStringOnOff(value: boolean): string;
  static toStringOnOff(value: NullableBoolean): string | null;
  /**
   * Converts the supplied value using to string on off.
   * @param {NullableBoolean} value Value to process.
   * @return {string | null} The resulting string.
   */
  static toStringOnOff(value: NullableBoolean): string | null {
    return BooleanUtil.toString(value, BooleanUtil.ON, BooleanUtil.OFF, null);
  }

  static toStringTrueFalse(value: boolean): string;
  static toStringTrueFalse(value: NullableBoolean): string | null;
  /**
   * Converts the supplied value using to string true false.
   * @param {NullableBoolean} value Value to process.
   * @return {string | null} The resulting string.
   */
  static toStringTrueFalse(value: NullableBoolean): string | null {
    return BooleanUtil.toString(value, BooleanUtil.TRUE, BooleanUtil.FALSE, null);
  }

  static toStringYesNo(value: boolean): string;
  static toStringYesNo(value: NullableBoolean): string | null;
  /**
   * Converts the supplied value using to string yes no.
   * @param {NullableBoolean} value Value to process.
   * @return {string | null} The resulting string.
   */
  static toStringYesNo(value: NullableBoolean): string | null {
    return BooleanUtil.toString(value, BooleanUtil.YES, BooleanUtil.NO, null);
  }

  /**
   * Performs the values operation.
   * @return {readonly boolean[]} The resulting collection.
   */
  static values(): readonly boolean[] {
    return Object.freeze([false, true]);
  }

  /**
   * Performs the xor operation.
   * @param {...NullableBoolean} values Values to process.
   * @return {boolean} Whether xor.
   */
  static xor(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.filter((value) => value === true).length % 2 === 1;
  }
}

export default BooleanUtil;
