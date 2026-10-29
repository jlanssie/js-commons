type NullableBoolean = boolean | null | undefined;

function isTrue(value: unknown): value is true {
  return value === true;
}

function isFalse(value: unknown): value is false {
  return value === false;
}

function requireValues(values: unknown[]): void {
  if (values.length === 0) {
    throw new Error('array must not be empty');
  }
}

function flattenValues(values: NullableBoolean[]): NullableBoolean[] {
  return values.length === 1 && Array.isArray(values[0]) ? (values[0] as unknown as NullableBoolean[]) : values;
}

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

  static and(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.every((value) => isTrue(value));
  }

  static booleanValues(): boolean[] {
    return [false, true];
  }

  static compare(left: boolean, right: boolean): number {
    return left === right ? 0 : left ? 1 : -1;
  }

  static forEach(action: (value: boolean) => void): void {
    BooleanUtil.values().forEach(action);
  }

  static isFalse(value: NullableBoolean): boolean {
    return isFalse(value);
  }

  static isNotFalse(value: NullableBoolean): boolean {
    return !BooleanUtil.isFalse(value);
  }

  static isNotTrue(value: NullableBoolean): boolean {
    return !BooleanUtil.isTrue(value);
  }

  static isTrue(value: NullableBoolean): boolean {
    return isTrue(value);
  }

  static negate(value: NullableBoolean): boolean | null {
    return value === null || value === undefined ? null : !value;
  }

  static oneHot(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.filter((value) => value === true).length === 1;
  }

  static or(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.some((value) => value === true);
  }

  static primitiveValues(): boolean[] {
    return [false, true];
  }

  static toBoolean(value: NullableBoolean): boolean;
  static toBoolean(value: number): boolean;
  static toBoolean(value: string | null | undefined): boolean;
  static toBoolean(value: unknown, trueValue: unknown, falseValue: unknown): boolean;
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
  static toInteger(value: NullableBoolean, trueValue = 1, falseValue = 0, nullValue = 0): number {
    return value === null || value === undefined ? nullValue : value ? trueValue : falseValue;
  }

  static toIntegerObject(value: boolean, trueValue?: number, falseValue?: number): number;
  static toIntegerObject(value: NullableBoolean, trueValue: number, falseValue: number, nullValue: number): number | null;
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
  static toStringOnOff(value: NullableBoolean): string | null {
    return BooleanUtil.toString(value, BooleanUtil.ON, BooleanUtil.OFF, null);
  }

  static toStringTrueFalse(value: boolean): string;
  static toStringTrueFalse(value: NullableBoolean): string | null;
  static toStringTrueFalse(value: NullableBoolean): string | null {
    return BooleanUtil.toString(value, BooleanUtil.TRUE, BooleanUtil.FALSE, null);
  }

  static toStringYesNo(value: boolean): string;
  static toStringYesNo(value: NullableBoolean): string | null;
  static toStringYesNo(value: NullableBoolean): string | null {
    return BooleanUtil.toString(value, BooleanUtil.YES, BooleanUtil.NO, null);
  }

  static values(): readonly boolean[] {
    return Object.freeze([false, true]);
  }

  static xor(...values: NullableBoolean[]): boolean {
    const flattened = flattenValues(values);
    requireValues(flattened);
    return flattened.filter((value) => value === true).length % 2 === 1;
  }
}

export default BooleanUtil;
