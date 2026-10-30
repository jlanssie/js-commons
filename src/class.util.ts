export type ClassLike = Function | object;
export type InterfacesBehavior = 'include' | 'exclude';

const primitiveNames = new Map<string, Function>([
  ['boolean', Boolean],
  ['byte', Number],
  ['char', String],
  ['double', Number],
  ['float', Number],
  ['int', Number],
  ['long', Number],
  ['short', Number],
  ['void', Function],
  ['Boolean', Boolean],
  ['Byte', Number],
  ['Character', String],
  ['Double', Number],
  ['Float', Number],
  ['Integer', Number],
  ['Long', Number],
  ['Short', Number],
  ['String', String],
  ['java.lang.Boolean', Boolean],
  ['java.lang.Byte', Number],
  ['java.lang.Character', String],
  ['java.lang.Double', Number],
  ['java.lang.Float', Number],
  ['java.lang.Integer', Number],
  ['java.lang.Long', Number],
  ['java.lang.Short', Number],
  ['java.lang.String', String],
]);

/**
 * Performs the constructor of operation.
 * @param {unknown} value Value to process.
 * @return {Function | null} The resulting value.
 */
function constructorOf(value: unknown): Function | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'function') {
    return value;
  }
  if (typeof value === 'string') {
    return String;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return Number;
  }
  if (typeof value === 'boolean') {
    return Boolean;
  }
  if (typeof value === 'symbol') {
    return Symbol;
  }
  return (value as { constructor?: Function }).constructor ?? Object;
}

/**
 * Performs the class name operation.
 * @param {unknown} value Value to process.
 * @return {string} The resulting string.
 */
function className(value: unknown): string {
  const constructor = constructorOf(value);
  return constructor?.name ?? '';
}

/**
 * Performs the class name from string operation.
 * @param {string} value Value to process.
 * @return {string} The resulting string.
 */
function classNameFromString(value: string): string {
  const dimensions = value.match(/^\[+/u)?.[0].length ?? 0;
  const descriptor = value.slice(dimensions).replace(/;$/, '');
  let name: string;
  if (descriptor.startsWith('L')) {
    name = descriptor.slice(1).replace(/\//g, '.');
  } else {
    const primitive = new Map([
      ['Z', 'boolean'],
      ['B', 'byte'],
      ['C', 'char'],
      ['D', 'double'],
      ['F', 'float'],
      ['I', 'int'],
      ['J', 'long'],
      ['S', 'short'],
      ['V', 'void'],
    ]);
    name = primitive.get(descriptor) ?? value;
  }
  return `${name}${'[]'.repeat(dimensions)}`;
}

/**
 * Performs the class name for operation.
 * @param {ClassLike | string | null | undefined} value Value to process.
 * @return {string} The resulting string.
 */
function classNameFor(value: ClassLike | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return typeof value === 'string' ? classNameFromString(value) : className(value);
}

/**
 * Performs the package name operation.
 * @param {string} name Name to process.
 * @return {string} The resulting string.
 */
function packageName(name: string): string {
  const normalized = name.replace(/\//g, '.').replace(/\$/g, '.');
  const lastDot = normalized.lastIndexOf('.');
  return lastDot < 0 ? '' : normalized.slice(0, lastDot);
}

/**
 * Performs the simple name operation.
 * @param {string} name Name to process.
 * @return {string} The resulting string.
 */
function simpleName(name: string): string {
  const normalized = classNameFromString(name).replace(/\$/g, '.');
  const lastDot = normalized.lastIndexOf('.');
  return lastDot < 0 ? normalized : normalized.slice(lastDot + 1);
}

/**
 * Returns whether constructor.
 * @param {unknown} value Value to process.
 * @return {boolean} Whether is constructor.
 */
function isConstructor(value: unknown): value is Function {
  return typeof value === 'function';
}

/** Apache Commons Lang inspired class utilities. */
class ClassUtil {
  static readonly PACKAGE_SEPARATOR_CHAR = '.';
  static readonly PACKAGE_SEPARATOR = '.';
  static readonly INNER_CLASS_SEPARATOR_CHAR = '$';
  static readonly INNER_CLASS_SEPARATOR = '$';

  /**
   * Performs the comparator operation.
   * @return {(left: Function, right: Function) => number} The resulting value.
   */
  static comparator(): (left: Function, right: Function) => number {
    return (left, right) => className(left).localeCompare(className(right));
  }

  /**
   * Converts the supplied value using convert classes to class names.
   * @param {readonly ClassLike[] | null | undefined} classes Classes to process.
   * @return {string[] | null} The resulting collection.
   */
  static convertClassesToClassNames(classes: readonly ClassLike[] | null | undefined): string[] | null {
    return classes === null || classes === undefined ? null : classes.map((value) => classNameFor(value));
  }

  /**
   * Converts the supplied value using convert class names to classes.
   * @param {readonly string[] | null | undefined} names Names.
   * @return {Array<Function | null> | null} The resulting collection.
   */
  static convertClassNamesToClasses(names: readonly string[] | null | undefined): Array<Function | null> | null {
    if (names === null || names === undefined) return null;
    return names.map((name) => {
      if (name === null || name === undefined) return null;
      try {
        return ClassUtil.getClass(name);
      } catch {
        return null;
      }
    });
  }

  /**
   * Returns the get abbreviated name.
   * @param {ClassLike | string | null | undefined} value Value to process.
   * @param {number} lengthHint Length hint.
   * @return {string} The resulting string.
   */
  static getAbbreviatedName(value: ClassLike | string | null | undefined, lengthHint: number): string {
    if (lengthHint <= 0) {
      throw new Error('lengthHint must be greater than zero');
    }
    const name = typeof value === 'string' ? value : classNameFor(value);
    if (name.length <= lengthHint) {
      return name;
    }
    const dimensions = name.match(/^\[+/u)?.[0].length ?? 0;
    if (dimensions > 0 && name.startsWith(`${'['.repeat(dimensions)}L`) && name.endsWith(';')) {
      const elementName = name.slice(dimensions + 1, -1);
      const elementHint = Math.max(1, lengthHint - dimensions - 2);
      return `${'['.repeat(dimensions)}L${ClassUtil.getAbbreviatedName(elementName, elementHint)};`;
    }
    const parts = name.split('.');
    const simple = parts.at(-1) ?? '';
    const packages = parts.slice(0, -1);
    const abbreviated: string[] = [];
    packages.forEach((part, index) => {
      const candidate = [...abbreviated, part, ...packages.slice(index + 1), simple].join('.');
      abbreviated.push(candidate.length <= lengthHint ? part : part.charAt(0));
    });
    return [...abbreviated, simple].join('.');
  }

  /**
   * Returns the get all interfaces.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {Function[] | null} The resulting collection.
   */
  static getAllInterfaces(value: ClassLike | null | undefined): Function[] | null {
    if (value === null || value === undefined) return null;
    const result: Function[] = [];
    let current = constructorOf(value);
    while (current) {
      const interfaces = (current as Function & { interfaces?: Function[] }).interfaces ?? [];
      for (const item of interfaces) {
        if (!result.includes(item)) {
          result.push(item);
        }
      }
      current = Object.getPrototypeOf(current) as Function | null;
    }
    return result;
  }

  /**
   * Returns the get all superclasses.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {Function[] | null} The resulting collection.
   */
  static getAllSuperclasses(value: ClassLike | null | undefined): Function[] | null {
    if (value === null || value === undefined) return null;
    const result: Function[] = [];
    let current = constructorOf(value);
    while (current && current !== Object) {
      const parent = Object.getPrototypeOf(current);
      if (parent === Function.prototype || parent === Function || parent === Object.prototype || parent === null) {
        result.push(Object);
        break;
      }
      if (typeof parent !== 'function') {
        result.push(Object);
        break;
      }
      current = parent;
      result.push(parent);
    }
    return result;
  }

  /**
   * Returns the get canonical name.
   * @param {ClassLike | string | null | undefined} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getCanonicalName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    if (value === null || value === undefined) {
      return valueIfNull;
    }
    return typeof value === 'string' ? classNameFromString(value) : className(value).replace(/\$/g, '.');
  }

  static getClass(classNameValue: string | null | undefined): Function | null;
  static getClass(_classLoader: unknown, classNameValue: string | null | undefined): Function | null;
  /**
   * Returns the get class.
   * @param {unknown} _classLoaderOrName Class loader or name.
   * @param {string | null} possibleName Possible name.
   * @return {Function | null} The resulting value.
   */
  static getClass(_classLoaderOrName: unknown, possibleName?: string | null): Function | null {
    const name = possibleName === undefined ? (_classLoaderOrName as string | null | undefined) : possibleName;
    if (name === null || name === undefined) {
      return null;
    }
    if (/^(?:\[+.*|.*\[\])$/u.test(name)) {
      return Array;
    }
    const primitive = primitiveNames.get(name);
    if (primitive) {
      return primitive;
    }
    const path = name.replace(/\//g, '.').split('.');
    let current: unknown = globalThis;
    for (const part of path) {
      if (current === null || current === undefined) {
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (typeof current === 'function') {
      return current;
    }
    throw new Error(`Class not found: ${name}`);
  }

  /**
   * Returns the get class strict.
   * @param {string} classNameValue Class name to resolve.
   * @return {Function} The resulting value.
   */
  static getClassStrict(classNameValue: string): Function {
    const result = ClassUtil.getClass(classNameValue);
    if (!result) {
      throw new Error(`Class not found: ${classNameValue}`);
    }
    return result;
  }

  /**
   * Returns the get component type.
   * @param {readonly T[] | null | undefined} value Value to process.
   * @return {Function | null} The resulting value.
   */
  static getComponentType<T>(value: readonly T[] | null | undefined): Function | null {
    if (value === null || value === undefined) {
      return null;
    }
    const first = value[0];
    return first === undefined ? null : constructorOf(first);
  }

  static getName(value: ClassLike | null | undefined, valueIfNull?: string): string;
  static getName(value: unknown, valueIfNull?: string): string;
  /**
   * Returns the get name.
   * @param {unknown} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getName(value: unknown, valueIfNull = ''): string {
    return value === null || value === undefined ? valueIfNull : classNameFor(value as ClassLike);
  }

  /**
   * Returns the get package canonical name.
   * @param {ClassLike | string | null | undefined} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getPackageCanonicalName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return packageName(ClassUtil.getCanonicalName(value, valueIfNull));
  }

  /**
   * Returns the get package name.
   * @param {ClassLike | string | null | undefined} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getPackageName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return packageName(ClassUtil.getName(value as ClassLike, valueIfNull));
  }

  /**
   * Returns the get public method.
   * @param {ClassLike} value Value to process.
   * @param {string} methodName Method name.
   * @param {...ClassLike} _parameterTypes Parameter types.
   * @return {Function} The resulting value.
   */
  static getPublicMethod(value: ClassLike, methodName: string, ..._parameterTypes: ClassLike[]): Function {
    const target = isConstructor(value) ? value.prototype : value;
    const method = (target as Record<string, unknown>)[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method not found: ${methodName}`);
    }
    return method;
  }

  /**
   * Returns the get short canonical name.
   * @param {ClassLike | string | null | undefined} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getShortCanonicalName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return simpleName(ClassUtil.getCanonicalName(value, valueIfNull));
  }

  /**
   * Returns the get short class name.
   * @param {ClassLike | string | null | undefined} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getShortClassName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return simpleName(ClassUtil.getName(value as ClassLike, valueIfNull));
  }

  /**
   * Returns the get simple name.
   * @param {ClassLike | null | undefined} value Value to process.
   * @param {string} valueIfNull Value to return for nullish input.
   * @return {string} The resulting string.
   */
  static getSimpleName(value: ClassLike | null | undefined, valueIfNull = ''): string {
    return value === null || value === undefined ? valueIfNull : simpleName(className(value));
  }

  /**
   * Performs the hierarchy operation.
   * @param {ClassLike} value Value to process.
   * @param {InterfacesBehavior} interfacesBehavior Whether interfaces should be included.
   * @return {Function[]} The resulting collection.
   */
  static hierarchy(value: ClassLike, interfacesBehavior: InterfacesBehavior = 'exclude'): Function[] {
    const result: Function[] = [];
    let current = constructorOf(value);
    while (current) {
      result.push(current);
      if (interfacesBehavior === 'include') {
        for (const item of ClassUtil.getAllInterfaces(current) ?? []) {
          if (!result.includes(item)) {
            result.push(item);
          }
        }
      }
      const parent = Object.getPrototypeOf(current);
      if (parent === Function.prototype || parent === Function || parent === Object.prototype || parent === null) {
        if (!result.includes(Object)) result.push(Object);
        break;
      }
      current = typeof parent === 'function' ? parent : null;
    }
    return result;
  }

  /**
   * Returns whether assignable.
   * @param {ClassLike | null | undefined} cls Cls.
   * @param {ClassLike | null | undefined} toClass To class.
   * @param {boolean} autoboxing Autoboxing.
   * @return {boolean} Whether is assignable.
   */
  static isAssignable(
    cls: ClassLike | null | undefined,
    toClass: ClassLike | null | undefined,
    autoboxing = false,
  ): boolean {
    if (cls === null || cls === undefined || toClass === null || toClass === undefined) {
      return false;
    }
    const source = constructorOf(cls);
    const target = constructorOf(toClass);
    if (source === null || target === null) {
      return false;
    }
    if (source === target) {
      return true;
    }
    if (
      autoboxing &&
      ((source === Number && target === Number) ||
        (source === String && target === String) ||
        (source === Boolean && target === Boolean))
    ) {
      return true;
    }
    if (target === Object) {
      return true;
    }
    return source.prototype instanceof (target as Function);
  }

  /**
   * Returns whether assignable array.
   * @param {readonly (ClassLike | null)[] | null} classes Classes to process.
   * @param {readonly (ClassLike | null)[] | null} toClasses To classes.
   * @param {boolean} autoboxing Autoboxing.
   * @return {boolean} Whether is assignable array.
   */
  static isAssignableArray(
    classes: readonly (ClassLike | null)[] | null,
    toClasses: readonly (ClassLike | null)[] | null,
    autoboxing = false,
  ): boolean {
    if (classes === null || toClasses === null || classes.length !== toClasses.length) {
      return false;
    }
    return classes.every((value, index) => ClassUtil.isAssignable(value, toClasses[index], autoboxing));
  }

  /**
   * Returns whether inner class.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {boolean} Whether is inner class.
   */
  static isInnerClass(value: ClassLike | null | undefined): boolean {
    return ClassUtil.getName(value).includes('$');
  }

  /**
   * Returns whether primitive or wrapper.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {boolean} Whether is primitive or wrapper.
   */
  static isPrimitiveOrWrapper(value: ClassLike | null | undefined): boolean {
    return ClassUtil.isPrimitiveWrapper(value);
  }

  /**
   * Returns whether primitive wrapper.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {boolean} Whether is primitive wrapper.
   */
  static isPrimitiveWrapper(value: ClassLike | null | undefined): boolean {
    return value === Boolean || value === Number || value === String || value === BigInt || value === Symbol;
  }

  /**
   * Returns whether public.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {boolean} Whether is public.
   */
  static isPublic(value: ClassLike | null | undefined): boolean {
    return value !== null && value !== undefined;
  }

  /**
   * Performs the primitives to wrappers operation.
   * @param {...ClassLike | null} classes Classes to process.
   * @return {Array<ClassLike | null>} The resulting collection.
   */
  static primitivesToWrappers(...classes: Array<ClassLike | null>): Array<ClassLike | null> {
    return classes.map((value) => ClassUtil.primitiveToWrapper(value));
  }

  /**
   * Performs the primitive to wrapper operation.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {ClassLike | null} The resulting value.
   */
  static primitiveToWrapper(value: ClassLike | null | undefined): ClassLike | null {
    return value === undefined ? null : value;
  }

  /**
   * Converts the supplied value using to class.
   * @param {readonly unknown[] | null | undefined} values Values to process.
   * @return {Array<Function | null> | null} The resulting collection.
   */
  static toClass(values: readonly unknown[] | null | undefined): Array<Function | null> | null {
    return values === null || values === undefined ? null : values.map((value) => constructorOf(value));
  }

  /**
   * Updates or transforms the value using wrappers to primitives.
   * @param {...ClassLike | null} classes Classes to process.
   * @return {Array<ClassLike | null>} The resulting collection.
   */
  static wrappersToPrimitives(...classes: Array<ClassLike | null>): Array<ClassLike | null> {
    return classes.map((value) => ClassUtil.wrapperToPrimitive(value));
  }

  /**
   * Updates or transforms the value using wrapper to primitive.
   * @param {ClassLike | null | undefined} value Value to process.
   * @return {ClassLike | null} The resulting value.
   */
  static wrapperToPrimitive(value: ClassLike | null | undefined): ClassLike | null {
    return value === undefined ? null : value;
  }
}

export default ClassUtil;
