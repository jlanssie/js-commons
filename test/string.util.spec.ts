import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import StringUtil from '../src/string.util.ts';

describe('StringUtil', () => {
  it('abbreviate', () => {
    assert.equal(StringUtil.abbreviate('abcdefghijklmno', 10), 'abcdefg...');
    assert.equal(StringUtil.abbreviate('abcdefghijklmno', 5, 10), '...fghi...');
  });
  it('abbreviateWithMarker', () => assert.equal(StringUtil.abbreviateWithMarker('abcdef', '~', 4), 'abc~'));
  it('abbreviateMiddle', () => assert.equal(StringUtil.abbreviateMiddle('abcdef', '...', 5), 'a...f'));
  it('appendIfMissing', () => assert.equal(StringUtil.appendIfMissing('name', '.txt'), 'name.txt'));
  it('appendIfMissingIgnoreCase', () => assert.equal(StringUtil.appendIfMissingIgnoreCase('name.TXT', '.txt'), 'name.TXT'));
  it('capitalize', () => assert.equal(StringUtil.capitalize('commons'), 'Commons'));
  it('center', () => assert.equal(StringUtil.center('a', 3, '-'), '-a-'));
  it('chomp', () => assert.equal(StringUtil.chomp('line\r\n'), 'line'));
  it('chop', () => assert.equal(StringUtil.chop('line\r\n'), 'line'));
  it('compare', () => assert.equal(StringUtil.compare('a', 'b'), -1));
  it('compareIgnoreCase', () => assert.equal(StringUtil.compareIgnoreCase('A', 'a'), 0));
  it('contains', () => assert.equal(StringUtil.contains('abc', 'b'), true));
  it('containsAny', () => assert.equal(StringUtil.containsAny('abc', 'x', 'b'), true));
  it('containsAnyIgnoreCase', () => assert.equal(StringUtil.containsAnyIgnoreCase('abc', 'X', 'B'), true));
  it('containsIgnoreCase', () => assert.equal(StringUtil.containsIgnoreCase('Abc', 'B'), true));
  it('containsNone', () => assert.equal(StringUtil.containsNone('abc', 'xyz'), true));
  it('containsOnly', () => assert.equal(StringUtil.containsOnly('abc', 'abc'), true));
  it('containsWhitespace', () => assert.equal(StringUtil.containsWhitespace('a b'), true));
  it('countMatches', () => assert.equal(StringUtil.countMatches('aaaa', 'aa'), 2));
  it('defaultIfBlank', () => assert.equal(StringUtil.defaultIfBlank(' ', 'fallback'), 'fallback'));
  it('defaultIfEmpty', () => assert.equal(StringUtil.defaultIfEmpty('', 'fallback'), 'fallback'));
  it('defaultString', () => assert.equal(StringUtil.defaultString(null, 'fallback'), 'fallback'));
  it('deleteWhitespace', () => assert.equal(StringUtil.deleteWhitespace(' a\tb '), 'ab'));
  it('difference', () => assert.equal(StringUtil.difference('abc', 'abd'), 'd'));
  it('endsWith', () => assert.equal(StringUtil.endsWith('abc', 'bc'), true));
  it('endsWithAny', () => assert.equal(StringUtil.endsWithAny('abc', 'x', 'bc'), true));
  it('endsWithIgnoreCase', () => assert.equal(StringUtil.endsWithIgnoreCase('ABC', 'bc'), true));
  it('equals', () => assert.equal(StringUtil.equals(null, null), true));
  it('equalsAny', () => assert.equal(StringUtil.equalsAny('a', 'b', 'a'), true));
  it('equalsAnyIgnoreCase', () => assert.equal(StringUtil.equalsAnyIgnoreCase('a', 'B', 'A'), true));
  it('equalsIgnoreCase', () => assert.equal(StringUtil.equalsIgnoreCase('A', 'a'), true));
  it('firstNonBlank', () => assert.equal(StringUtil.firstNonBlank(' ', 'value'), 'value'));
  it('firstNonEmpty', () => assert.equal(StringUtil.firstNonEmpty('', 'value'), 'value'));
  it('getBytes', () => assert.deepEqual(Array.from(StringUtil.getBytes('abc')), [97, 98, 99]));
  it('getCommonPrefix', () => assert.equal(StringUtil.getCommonPrefix('flower', 'flow', 'flight'), 'fl'));
  it('getDigits', () => assert.equal(StringUtil.getDigits('a1٢b'), '1٢'));
  it('getFuzzyDistance', () => assert.ok(StringUtil.getFuzzyDistance('foo', 'fo') > 0));
  it('getIfBlank', () =>
    assert.equal(
      StringUtil.getIfBlank(' ', () => 'value'),
      'value',
    ));
  it('getIfEmpty', () =>
    assert.equal(
      StringUtil.getIfEmpty('', () => 'value'),
      'value',
    ));
  it('getJaroWinklerDistance', () => assert.equal(StringUtil.getJaroWinklerDistance('same', 'same'), 1));
  it('getLevenshteinDistance', () => assert.equal(StringUtil.getLevenshteinDistance('kitten', 'sitting'), 3));
  it('indexOf', () => assert.equal(StringUtil.indexOf('abc', 'b'), 1));
  it('indexOfAny', () => assert.equal(StringUtil.indexOfAny('abc', 'x', 'b'), 1));
  it('indexOfAnyBut', () => assert.equal(StringUtil.indexOfAnyBut('aab', 'a'), 2));
  it('indexOfDifference', () => assert.equal(StringUtil.indexOfDifference('abc', 'abd'), 2));
  it('indexOfIgnoreCase', () => assert.equal(StringUtil.indexOfIgnoreCase('Abc', 'B'), 1));
  it('isAllBlank', () => assert.equal(StringUtil.isAllBlank(' ', null), true));
  it('isAllEmpty', () => assert.equal(StringUtil.isAllEmpty('', null), true));
  it('isAllLowerCase', () => assert.equal(StringUtil.isAllLowerCase('abc'), true));
  it('isAllUpperCase', () => assert.equal(StringUtil.isAllUpperCase('ABC'), true));
  it('isAlpha', () => assert.equal(StringUtil.isAlpha('abc'), true));
  it('isAlphanumeric', () => assert.equal(StringUtil.isAlphanumeric('abc123'), true));
  it('isAlphanumericSpace', () => assert.equal(StringUtil.isAlphanumericSpace('abc 123'), true));
  it('isAlphaSpace', () => assert.equal(StringUtil.isAlphaSpace('abc xyz'), true));
  it('isAnyBlank', () => assert.equal(StringUtil.isAnyBlank('value', ' '), true));
  it('isAnyEmpty', () => assert.equal(StringUtil.isAnyEmpty('value', ''), true));
  it('isAsciiPrintable', () => assert.equal(StringUtil.isAsciiPrintable('abc!'), true));
  it('isBlank', () => assert.equal(StringUtil.isBlank(' \t'), true));
  it('isEmpty', () => assert.equal(StringUtil.isEmpty(''), true));
  it('isMixedCase', () => assert.equal(StringUtil.isMixedCase('aB'), true));
  it('isNoneBlank', () => assert.equal(StringUtil.isNoneBlank('a', 'b'), true));
  it('isNoneEmpty', () => assert.equal(StringUtil.isNoneEmpty('a', 'b'), true));
  it('isNotBlank', () => assert.equal(StringUtil.isNotBlank('a'), true));
  it('isNotEmpty', () => assert.equal(StringUtil.isNotEmpty('a'), true));
  it('isNumeric', () => assert.equal(StringUtil.isNumeric('١٢٣'), true));
  it('isNumericSpace', () => assert.equal(StringUtil.isNumericSpace('12 3'), true));
  it('isWhitespace', () => assert.equal(StringUtil.isWhitespace(' \t'), true));
  it('join', () => assert.equal(StringUtil.join(['a', null, 'b'], ','), 'a,,b'));
  it('joinWith', () => assert.equal(StringUtil.joinWith('-', 'a', null, 'b'), 'a--b'));
  it('lastIndexOf', () => assert.equal(StringUtil.lastIndexOf('ababa', 'a'), 4));
  it('lastIndexOfAny', () => assert.equal(StringUtil.lastIndexOfAny('abc', 'a', 'c'), 2));
  it('lastIndexOfIgnoreCase', () => assert.equal(StringUtil.lastIndexOfIgnoreCase('AbCa', 'A'), 3));
  it('lastOrdinalIndexOf', () => assert.equal(StringUtil.lastOrdinalIndexOf('a-b-c', '-', 2), 1));
  it('left', () => assert.equal(StringUtil.left('abcd', 2), 'ab'));
  it('leftPad', () => assert.equal(StringUtil.leftPad('7', 3, '0'), '007'));
  it('length', () => assert.equal(StringUtil.length(null), 0));
  it('lowerCase', () => assert.equal(StringUtil.lowerCase('ABC'), 'abc'));
  it('mid', () => assert.equal(StringUtil.mid('abcd', 1, 2), 'bc'));
  it('normalizeSpace', () => assert.equal(StringUtil.normalizeSpace(' a\t  b '), 'a b'));
  it('ordinalIndexOf', () => assert.equal(StringUtil.ordinalIndexOf('a-b-c', '-', 2), 3));
  it('overlay', () => assert.equal(StringUtil.overlay('abcdef', 'X', 2, 4), 'abXef'));
  it('prependIfMissing', () => assert.equal(StringUtil.prependIfMissing('file', 'pre-'), 'pre-file'));
  it('prependIfMissingIgnoreCase', () =>
    assert.equal(StringUtil.prependIfMissingIgnoreCase('Pre-file', 'pre-'), 'Pre-file'));
  it('remove', () => assert.equal(StringUtil.remove('banana', 'na'), 'ba'));
  it('removeAll', () => assert.equal(StringUtil.removeAll('a1b2', '\\d'), 'ab'));
  it('removeEnd', () => assert.equal(StringUtil.removeEnd('name.txt', '.txt'), 'name'));
  it('removeEndIgnoreCase', () => assert.equal(StringUtil.removeEndIgnoreCase('name.TXT', '.txt'), 'name'));
  it('removeFirst', () => assert.equal(StringUtil.removeFirst('a1a2', '\\d'), 'aa2'));
  it('removeIgnoreCase', () => assert.equal(StringUtil.removeIgnoreCase('Banana', 'NA'), 'Ba'));
  it('removePattern', () => assert.equal(StringUtil.removePattern('a1b2', '\\d'), 'ab'));
  it('removeStart', () => assert.equal(StringUtil.removeStart('pre-file', 'pre-'), 'file'));
  it('removeStartIgnoreCase', () => assert.equal(StringUtil.removeStartIgnoreCase('Pre-file', 'pre-'), 'file'));
  it('repeat', () => assert.equal(StringUtil.repeat('ab', 2, '-'), 'ab-ab'));
  it('replace', () => assert.equal(StringUtil.replace('a-a-a', 'a', 'b', 2), 'b-b-a'));
  it('replaceAll', () => assert.equal(StringUtil.replaceAll('a1b2', '\\d', '#'), 'a#b#'));
  it('replaceChars', () => assert.equal(StringUtil.replaceChars('abc', 'ac', 'xy'), 'xby'));
  it('replaceEach', () => assert.equal(StringUtil.replaceEach('abc', ['a', 'b'], ['x', 'y']), 'xyc'));
  it('replaceEachRepeatedly', () => assert.equal(StringUtil.replaceEachRepeatedly('a', ['a', 'b'], ['b', 'c']), 'c'));
  it('replaceFirst', () => assert.equal(StringUtil.replaceFirst('a1a2', '\\d', '#'), 'a#a2'));
  it('replaceIgnoreCase', () => assert.equal(StringUtil.replaceIgnoreCase('AbA', 'a', 'x'), 'xbx'));
  it('replaceOnce', () => assert.equal(StringUtil.replaceOnce('a-a', 'a', 'b'), 'b-a'));
  it('replaceOnceIgnoreCase', () => assert.equal(StringUtil.replaceOnceIgnoreCase('Aa', 'a', 'b'), 'ba'));
  it('replacePattern', () => assert.equal(StringUtil.replacePattern('a1b2', '\\d', '#'), 'a#b#'));
  it('reverse', () => assert.equal(StringUtil.reverse('abc'), 'cba'));
  it('reverseDelimited', () => assert.equal(StringUtil.reverseDelimited('a-b-c', '-'), 'c-b-a'));
  it('right', () => assert.equal(StringUtil.right('abcd', 2), 'cd'));
  it('rightPad', () => assert.equal(StringUtil.rightPad('7', 3, '0'), '700'));
  it('rotate', () => assert.equal(StringUtil.rotate('abcd', 1), 'dabc'));
  it('split', () => assert.deepEqual(StringUtil.split('a,b,,c', ','), ['a', 'b', 'c']));
  it('splitPreserveAllTokens', () =>
    assert.deepEqual(StringUtil.splitPreserveAllTokens('a,b,,c', ','), ['a', 'b', '', 'c']));
  it('splitByWholeSeparator', () => assert.deepEqual(StringUtil.splitByWholeSeparator('a::b', '::'), ['a', 'b']));
  it('splitByWholeSeparatorPreserveAllTokens', () =>
    assert.deepEqual(StringUtil.splitByWholeSeparatorPreserveAllTokens('a::::b', '::'), ['a', '', 'b']));
  it('splitByCharacterType', () => assert.deepEqual(StringUtil.splitByCharacterType('fooBar'), ['foo', 'B', 'ar']));
  it('splitByCharacterTypeCamelCase', () =>
    assert.deepEqual(StringUtil.splitByCharacterTypeCamelCase('fooBar'), ['foo', 'Bar']));
  it('startsWith', () => assert.equal(StringUtil.startsWith('abc', 'ab'), true));
  it('startsWithAny', () => assert.equal(StringUtil.startsWithAny('abc', 'x', 'ab'), true));
  it('startsWithIgnoreCase', () => assert.equal(StringUtil.startsWithIgnoreCase('Abc', 'a'), true));
  it('strip', () => assert.equal(StringUtil.strip('  abc  '), 'abc'));
  it('stripAccents', () => assert.equal(StringUtil.stripAccents('café'), 'cafe'));
  it('stripAll', () => assert.deepEqual(StringUtil.stripAll(' a ', ' b '), ['a', 'b']));
  it('stripEnd', () => assert.equal(StringUtil.stripEnd('abc---', '-'), 'abc'));
  it('stripStart', () => assert.equal(StringUtil.stripStart('---abc', '-'), 'abc'));
  it('stripToEmpty', () => assert.equal(StringUtil.stripToEmpty(null), ''));
  it('stripToNull', () => assert.equal(StringUtil.stripToNull('  '), null));
  it('substring', () => assert.equal(StringUtil.substring('abcd', 1, 3), 'bc'));
  it('substringAfter', () => assert.equal(StringUtil.substringAfter('a-b-c', '-'), 'b-c'));
  it('substringAfterLast', () => assert.equal(StringUtil.substringAfterLast('a-b-c', '-'), 'c'));
  it('substringBefore', () => assert.equal(StringUtil.substringBefore('a-b-c', '-'), 'a'));
  it('substringBeforeLast', () => assert.equal(StringUtil.substringBeforeLast('a-b-c', '-'), 'a-b'));
  it('substringBetween', () => assert.equal(StringUtil.substringBetween('[value]', '[', ']'), 'value'));
  it('substringsBetween', () => assert.deepEqual(StringUtil.substringsBetween('[a][b]', '[', ']'), ['a', 'b']));
  it('swapCase', () => assert.equal(StringUtil.swapCase('AbC'), 'aBc'));
  it('toCodePoints', () => assert.deepEqual(StringUtil.toCodePoints('A😀'), [65, 128512]));
  it('toEncodedString', () => assert.equal(StringUtil.toEncodedString([65, 66]), 'AB'));
  it('toString', () => assert.equal(StringUtil.toString([65, 66]), 'AB'));
  it('toRootLowerCase', () => assert.equal(StringUtil.toRootLowerCase('ABC'), 'abc'));
  it('toRootUpperCase', () => assert.equal(StringUtil.toRootUpperCase('abc'), 'ABC'));
  it('trim', () => assert.equal(StringUtil.trim('  abc  '), 'abc'));
  it('trimAsciiControl', () => assert.equal(StringUtil.trimAsciiControl('\u0000 abc\u0001'), 'abc'));
  it('trimToEmpty', () => assert.equal(StringUtil.trimToEmpty(null), ''));
  it('trimToNull', () => assert.equal(StringUtil.trimToNull('  '), null));
  it('truncate', () => {
    assert.equal(StringUtil.truncate('abcdef', 3), 'abc');
    assert.equal(StringUtil.truncate('abcdef', 1, 3), 'bcd');
  });
  it('uncapitalize', () => assert.equal(StringUtil.uncapitalize('Commons'), 'commons'));
  it('unwrap', () => assert.equal(StringUtil.unwrap('##value##', '##'), 'value'));
  it('upperCase', () => assert.equal(StringUtil.upperCase('abc'), 'ABC'));
  it('valueOf', () => assert.equal(StringUtil.valueOf([65, 66]), 'AB'));
  it('wrap', () => assert.equal(StringUtil.wrap('value', '"'), '"value"'));
  it('wrapIfMissing', () => assert.equal(StringUtil.wrapIfMissing('value', '"'), '"value"'));
});
