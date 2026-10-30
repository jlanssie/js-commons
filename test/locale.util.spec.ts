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
});
