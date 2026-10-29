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

function className(value: unknown): string {
  const constructor = constructorOf(value);
  return constructor?.name ?? '';
}

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

function classNameFor(value: ClassLike | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return typeof value === 'string' ? classNameFromString(value) : className(value);
}

function packageName(name: string): string {
  const normalized = name.replace(/\//g, '.').replace(/\$/g, '.');
  const lastDot = normalized.lastIndexOf('.');
  return lastDot < 0 ? '' : normalized.slice(0, lastDot);
}

function simpleName(name: string): string {
  const normalized = classNameFromString(name).replace(/\$/g, '.');
  const lastDot = normalized.lastIndexOf('.');
  return lastDot < 0 ? normalized : normalized.slice(lastDot + 1);
}

function isConstructor(value: unknown): value is Function {
  return typeof value === 'function';
}

/** Apache Commons Lang inspired class utilities. */
class ClassUtil {
  static readonly PACKAGE_SEPARATOR_CHAR = '.';
  static readonly PACKAGE_SEPARATOR = '.';
  static readonly INNER_CLASS_SEPARATOR_CHAR = '$';
  static readonly INNER_CLASS_SEPARATOR = '$';

  static comparator(): (left: Function, right: Function) => number {
    return (left, right) => className(left).localeCompare(className(right));
  }

  static convertClassesToClassNames(classes: readonly ClassLike[] | null | undefined): string[] | null {
    return classes === null || classes === undefined ? null : classes.map((value) => classNameFor(value));
  }

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

  static getCanonicalName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    if (value === null || value === undefined) {
      return valueIfNull;
    }
    return typeof value === 'string' ? classNameFromString(value) : className(value).replace(/\$/g, '.');
  }

  static getClass(classNameValue: string | null | undefined): Function | null;
  static getClass(_classLoader: unknown, classNameValue: string | null | undefined): Function | null;
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

  static getClassStrict(classNameValue: string): Function {
    const result = ClassUtil.getClass(classNameValue);
    if (!result) {
      throw new Error(`Class not found: ${classNameValue}`);
    }
    return result;
  }

  static getComponentType<T>(value: readonly T[] | null | undefined): Function | null {
    if (value === null || value === undefined) {
      return null;
    }
    const first = value[0];
    return first === undefined ? null : constructorOf(first);
  }

  static getName(value: ClassLike | null | undefined, valueIfNull?: string): string;
  static getName(value: unknown, valueIfNull?: string): string;
  static getName(value: unknown, valueIfNull = ''): string {
    return value === null || value === undefined ? valueIfNull : classNameFor(value as ClassLike);
  }

  static getPackageCanonicalName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return packageName(ClassUtil.getCanonicalName(value, valueIfNull));
  }

  static getPackageName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return packageName(ClassUtil.getName(value as ClassLike, valueIfNull));
  }

  static getPublicMethod(value: ClassLike, methodName: string, ..._parameterTypes: ClassLike[]): Function {
    const target = isConstructor(value) ? value.prototype : value;
    const method = (target as Record<string, unknown>)[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method not found: ${methodName}`);
    }
    return method;
  }

  static getShortCanonicalName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return simpleName(ClassUtil.getCanonicalName(value, valueIfNull));
  }

  static getShortClassName(value: ClassLike | string | null | undefined, valueIfNull = ''): string {
    return simpleName(ClassUtil.getName(value as ClassLike, valueIfNull));
  }

  static getSimpleName(value: ClassLike | null | undefined, valueIfNull = ''): string {
    return value === null || value === undefined ? valueIfNull : simpleName(className(value));
  }

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

  static isInnerClass(value: ClassLike | null | undefined): boolean {
    return ClassUtil.getName(value).includes('$');
  }

  static isPrimitiveOrWrapper(value: ClassLike | null | undefined): boolean {
    return ClassUtil.isPrimitiveWrapper(value);
  }

  static isPrimitiveWrapper(value: ClassLike | null | undefined): boolean {
    return value === Boolean || value === Number || value === String || value === BigInt || value === Symbol;
  }

  static isPublic(value: ClassLike | null | undefined): boolean {
    return value !== null && value !== undefined;
  }

  static primitivesToWrappers(...classes: Array<ClassLike | null>): Array<ClassLike | null> {
    return classes.map((value) => ClassUtil.primitiveToWrapper(value));
  }

  static primitiveToWrapper(value: ClassLike | null | undefined): ClassLike | null {
    return value === undefined ? null : value;
  }

  static toClass(values: readonly unknown[] | null | undefined): Array<Function | null> | null {
    return values === null || values === undefined ? null : values.map((value) => constructorOf(value));
  }

  static wrappersToPrimitives(...classes: Array<ClassLike | null>): Array<ClassLike | null> {
    return classes.map((value) => ClassUtil.wrapperToPrimitive(value));
  }

  static wrapperToPrimitive(value: ClassLike | null | undefined): ClassLike | null {
    return value === undefined ? null : value;
  }
}

export default ClassUtil;
