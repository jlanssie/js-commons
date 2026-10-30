import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import ClassUtil from '../src/class.util.ts';

class Parent {}
class Child extends Parent {
  greet(): string {
    return 'hello';
  }
}

describe('ClassUtil', () => {
  it('comparator', () => {
    const compare = ClassUtil.comparator();
    assert.ok(compare(String, Number) !== 0);
  });
  it('convertClassesToClassNames', () =>
    assert.deepEqual(ClassUtil.convertClassesToClassNames([String, Number]), ['String', 'Number']));
  it('convertClassNamesToClasses', () =>
    assert.deepEqual(ClassUtil.convertClassNamesToClasses(['String', 'Number']), [String, Number]));
  it('getAbbreviatedName', () => assert.equal(ClassUtil.getAbbreviatedName('java.lang.String', 5), 'j.l.String'));
  it('getAllInterfaces', () => assert.deepEqual(ClassUtil.getAllInterfaces(Child), []));
  it('getAllSuperclasses', () => assert.ok(ClassUtil.getAllSuperclasses(Child)?.includes(Parent)));
  it('getCanonicalName', () => assert.equal(ClassUtil.getCanonicalName('[Ljava.lang.String;'), 'java.lang.String[]'));
  it('getClass', () => {
    assert.equal(ClassUtil.getClass('String'), String);
    assert.equal(ClassUtil.getClass('int'), Number);
  });
  it('getClassStrict', () => assert.equal(ClassUtil.getClassStrict('String'), String));
  it('getComponentType', () => assert.equal(ClassUtil.getComponentType([1, 2]), Number));
  it('getName', () => assert.equal(ClassUtil.getName(String), 'String'));
  it('getPackageCanonicalName', () => assert.equal(ClassUtil.getPackageCanonicalName('java.lang.String'), 'java.lang'));
  it('getPackageName', () => assert.equal(ClassUtil.getPackageName('java.lang.String'), 'java.lang'));
  it('getPublicMethod', () => assert.equal(ClassUtil.getPublicMethod(Child, 'greet'), Child.prototype.greet));
  it('getShortCanonicalName', () => assert.equal(ClassUtil.getShortCanonicalName('java.lang.String'), 'String'));
  it('getShortClassName', () => assert.equal(ClassUtil.getShortClassName('java.lang.String'), 'String'));
  it('getSimpleName', () => assert.equal(ClassUtil.getSimpleName(Child), 'Child'));
  it('hierarchy', () => assert.ok(ClassUtil.hierarchy(Child).includes(Child)));
  it('isAssignable', () => assert.equal(ClassUtil.isAssignable(Child, Parent), true));
  it('isAssignableArray', () => assert.equal(ClassUtil.isAssignableArray([Child], [Parent]), true));
  it('isInnerClass', () => assert.equal(ClassUtil.isInnerClass('pkg.Outer$Inner'), true));
  it('isPrimitiveOrWrapper', () => assert.equal(ClassUtil.isPrimitiveOrWrapper(Number), true));
  it('isPrimitiveWrapper', () => assert.equal(ClassUtil.isPrimitiveWrapper(String), true));
  it('isPublic', () => assert.equal(ClassUtil.isPublic(Child), true));
  it('primitivesToWrappers', () => assert.deepEqual(ClassUtil.primitivesToWrappers(Number, String), [Number, String]));
  it('primitiveToWrapper', () => assert.equal(ClassUtil.primitiveToWrapper(Number), Number));
  it('toClass', () => assert.deepEqual(ClassUtil.toClass([1, 'a']), [Number, String]));
  it('wrappersToPrimitives', () => assert.deepEqual(ClassUtil.wrappersToPrimitives(Number, String), [Number, String]));
  it('wrapperToPrimitive', () => assert.equal(ClassUtil.wrapperToPrimitive(Number), Number));
  it('handles null, descriptors, interfaces, and errors', () => {
    assert.equal(ClassUtil.getName(null, 'fallback'), 'fallback');
    assert.equal(ClassUtil.getCanonicalName(null, 'fallback'), 'fallback');
    assert.equal(ClassUtil.getPackageName(null, 'fallback'), '');
    assert.equal(ClassUtil.getPackageCanonicalName(null, 'fallback'), '');
    assert.equal(ClassUtil.getComponentType(null), null);
    assert.deepEqual(ClassUtil.toClass(null), null);
    assert.deepEqual(ClassUtil.toClass([null, true, Symbol('x')]), [null, Boolean, Symbol]);
    assert.deepEqual(ClassUtil.convertClassesToClassNames([null as never]), ['']);
    assert.equal(ClassUtil.getClass(null), null);
    assert.equal(ClassUtil.getClass('String[]'), Array);
    assert.throws(() => ClassUtil.getClass('does.not.Exist'));
    assert.throws(() => ClassUtil.getClassStrict('does.not.Exist'));
    assert.throws(() => ClassUtil.getClassStrict(null as never));
    assert.equal(ClassUtil.getAbbreviatedName('Short', 10), 'Short');
    assert.throws(() => ClassUtil.getAbbreviatedName('java.lang.String', 0));
    assert.equal(ClassUtil.getAbbreviatedName('[Ljava.lang.String;', 5), '[Lj.l.String;');
    assert.equal(ClassUtil.getAllInterfaces(null), null);
    assert.equal(ClassUtil.getAllSuperclasses(null), null);
    assert.throws(() => ClassUtil.getPublicMethod(Child, 'missing'));
    assert.equal(ClassUtil.isAssignable(null, Parent), false);
    assert.equal(ClassUtil.isAssignable(Child, Child), true);
    assert.equal(ClassUtil.isAssignable(Number, Number, true), true);
    assert.equal(ClassUtil.isAssignable(Child, Object), true);
    assert.equal(ClassUtil.isAssignableArray(null, [Parent]), false);
    assert.equal(ClassUtil.isAssignableArray([Child], [Parent, Parent]), false);
    assert.equal(ClassUtil.isInnerClass(null), false);
    assert.equal(ClassUtil.isPrimitiveWrapper(Boolean), true);
    assert.equal(ClassUtil.isPublic(null), false);
    assert.equal(ClassUtil.primitiveToWrapper(undefined), null);
    assert.equal(ClassUtil.wrapperToPrimitive(undefined), null);
    assert.deepEqual(ClassUtil.primitivesToWrappers(null), [null]);
    assert.deepEqual(ClassUtil.wrappersToPrimitives(null), [null]);
    assert.ok(ClassUtil.hierarchy(Child, 'include').includes(Parent));
    class Odd {}
    Object.setPrototypeOf(Odd, {});
    assert.deepEqual(ClassUtil.getAllSuperclasses(Odd), [Object]);
    const Interface = function Interface() {};
    (Parent as typeof Parent & { interfaces?: Function[] }).interfaces = [Interface, Interface];
    assert.deepEqual(ClassUtil.getAllInterfaces(Child), [Interface]);
    assert.ok(ClassUtil.hierarchy(Child, 'include').includes(Interface));
    assert.deepEqual(ClassUtil.convertClassNamesToClasses(['does.not.Exist']), [null]);
    assert.equal(ClassUtil.comparator()(String, String), 0);
  });
});
