import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import LocaleUtil from '../src/locale.util.ts';

describe('LocaleUtil', () => {
  it('LocaleValue.region', () => assert.equal(LocaleUtil.toLocale('en_US')?.region, 'US'));
  it('LocaleValue.toString', () => assert.equal(String(LocaleUtil.toLocale('en_US_POSIX')), 'en_US_POSIX'));
  it('LocaleValue.toIntlLocale', () => assert.equal(LocaleUtil.toLocale('en_US')?.toIntlLocale()?.language, 'en'));
  it('availableLocaleList', () => assert.ok(LocaleUtil.availableLocaleList().some((locale) => String(locale) === 'en')));
  it('availableLocaleSet', () => assert.ok(LocaleUtil.availableLocaleSet().size > 0));
  it('countriesByLanguage', () => assert.ok(LocaleUtil.countriesByLanguage('en').some((locale) => locale.country === 'US')));
  it('isAvailableLocale', () => assert.equal(LocaleUtil.isAvailableLocale('en_US'), true));
  it('isLanguageUndetermined', () => assert.equal(LocaleUtil.isLanguageUndetermined({ country: 'US' }), true));
  it('languagesByCountry', () => assert.ok(LocaleUtil.languagesByCountry('US').some((locale) => locale.language === 'en')));
  it('localeLookupList', () => {
    assert.deepEqual(LocaleUtil.localeLookupList('en_US_POSIX').map(String), ['en_US_POSIX', 'en_US', 'en']);
  });
  it('toLocale', () => {
    const locale = LocaleUtil.toLocale('fr-FR');
    assert.equal(locale?.language, 'fr');
    assert.equal(locale?.country, 'FR');
  });
  it('handles null, object, fallback, and invalid locale paths', () => {
    assert.equal(LocaleUtil.toLocale(null), null);
    assert.equal(LocaleUtil.isAvailableLocale(null), false);
    assert.deepEqual(LocaleUtil.countriesByLanguage(null), []);
    assert.deepEqual(LocaleUtil.languagesByCountry(null), []);
    assert.deepEqual(LocaleUtil.localeLookupList(null), []);
    assert.deepEqual(LocaleUtil.localeLookupList(null, 'en_US').map(String), ['en_US']);
    assert.equal(LocaleUtil.toLocale({ language: 'de', region: 'DE' })?.toString(), 'de_DE');
    assert.equal(LocaleUtil.toLocale(new Intl.Locale('fr-FR'))?.language, 'fr');
    assert.equal(LocaleUtil.toLocale(LocaleUtil.toLocale('en_US'))?.country, 'US');
    assert.equal(LocaleUtil.isAvailableLocale(LocaleUtil.toLocale('en_US')), true);
    assert.equal(LocaleUtil.toLocale({ country: 'US' })?.toString(), '_US');
    assert.equal(LocaleUtil.toLocale({ country: 'US' })?.toIntlLocale(), null);
    assert.equal(LocaleUtil.toLocale('US')?.toString(), '_US');
    assert.equal(LocaleUtil.toLocale('en')?.toString(), 'en');
    assert.equal(LocaleUtil.toLocale('')?.toString(), '');
    assert.equal(LocaleUtil.toLocale({ language: 'bad!' })?.toIntlLocale(), null);
    assert.throws(() => LocaleUtil.toLocale('invalid-locale'));
    assert.throws(() => LocaleUtil.toLocale('en_usa'));
    assert.throws(() => LocaleUtil.toLocale('en_US_!'));
    assert.ok(LocaleUtil.localeLookupList('en_US', 'fr_FR').some((locale) => String(locale) === 'fr_FR'));
  });
});
